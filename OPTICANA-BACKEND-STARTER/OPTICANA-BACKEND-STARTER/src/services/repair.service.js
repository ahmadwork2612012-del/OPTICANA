import prisma from "../lib/prisma.js";
import { changeStock } from "./inventory.service.js";
import { getRepairPaymentSummary, syncRepairPaymentState, reversePayment, recordPayment } from "./payment.service.js";
import { writeAudit } from "./audit.service.js";

function err(message, code, statusCode = 400) { const e = new Error(message); e.code = code; e.statusCode = statusCode; return e; }
function money(v) { const n = Number(v); return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0; }

const include = {
  customer: { select: { id: true, name: true, phone: true } },
  product: { select: { id: true, name: true, sku: true } },
  parts: { include: { product: { select: { id: true, name: true, sku: true, stock: true, purchasePrice: true } } } },
  payments: { orderBy: { createdAt: "asc" } },
};

function serialize(r) {
  if (!r) return null;
  const baseCost = Number(r.finalCost) > 0 ? Number(r.finalCost) : Number(r.estimatedCost || 0);
  return {
    ...r,
    customerName: r.customer?.name || "",
    phone: r.customer?.phone || "",
    itemType: r.itemType || "",
    problem: r.problem || r.title || "",
    diagnosis: r.diagnosis || "",
    receivedDate: r.receivedDate || r.createdAt,
    dueDate: r.dueDate || null,
    cost: baseCost,
    image: r.imageUrl || null,
    estimatedCost: Number(r.estimatedCost || 0),
    finalCost: Number(r.finalCost || 0),
    paidAmount: Number(r.paidAmount || 0),
    remainingAmount: Math.max(baseCost - Number(r.paidAmount || 0), 0),
    parts: Array.isArray(r.parts) ? r.parts.map(p => ({...p, unitCost: Number(p.unitCost || 0), total: money(Number(p.unitCost || 0) * Number(p.quantity || 0))})) : [],
  };
}

async function nextNumber(tx) {
  const prefix = `REP-${new Date().toISOString().slice(0,10).replaceAll("-", "")}-`;
  const last = await tx.repair.findFirst({ where: { repairNumber: { startsWith: prefix } }, orderBy: { repairNumber: "desc" }, select: { repairNumber: true } });
  return `${prefix}${String(Number(last?.repairNumber?.split("-").pop() || 0) + 1).padStart(3, "0")}`;
}

function normalizeParts(parts) {
  if (!Array.isArray(parts)) return [];
  return parts.map(p => {
    const productId = String(p.productId || "");
    const quantity = Number(p.quantity);
    const unitCost = money(p.unitCost);
    if (!productId || !Number.isInteger(quantity) || quantity <= 0) throw err("Invalid repair part", "INVALID_REPAIR_PART");
    return { productId, quantity, unitCost };
  });
}

const transitions = {
  RECEIVED: ["DIAGNOSING", "CANCELLED"],
  PENDING: ["DIAGNOSING", "CANCELLED"],
  DIAGNOSING: ["IN_PROGRESS", "WAITING", "CANCELLED"],
  WAITING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["READY", "WAITING", "CANCELLED"],
  READY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  COMPLETED: [],
  CANCELLED: [],
};

async function prepareParts(tx, rawParts, availableExtras = new Map()) {
  const parts = normalizeParts(rawParts);
  const requestedByProduct = new Map();
  for (const part of parts) {
    requestedByProduct.set(part.productId, (requestedByProduct.get(part.productId) || 0) + part.quantity);
  }
  const productCache = new Map();
  for (const productId of requestedByProduct.keys()) {
    const product = await tx.product.findUnique({ where: { id: productId }, select: { id: true, stock: true, name: true, purchasePrice: true } });
    if (!product) throw err("Repair part product not found", "PRODUCT_NOT_FOUND", 404);
    const available = product.stock + Number(availableExtras.get(product.id) || 0);
    if (available < requestedByProduct.get(product.id)) throw err(`Insufficient stock for ${product.name}`, "INSUFFICIENT_STOCK", 409);
    productCache.set(product.id, product);
  }
  return parts.map((part) => {
    const product = productCache.get(part.productId);
    return { ...part, unitCost: part.unitCost > 0 ? part.unitCost : money(product.purchasePrice) };
  });
}

export async function listRepairs() { return (await prisma.repair.findMany({ include, orderBy: { createdAt: "desc" }, take: 500 })).map(serialize); }
export async function getRepair(id) { return serialize(await prisma.repair.findUnique({ where: { id }, include })); }

export async function createRepair(input, userId = null) {
  return prisma.$transaction(async tx => {
    const parts = await prepareParts(tx, input.parts);
    const totalParts = parts.reduce((sum, p) => sum + p.quantity * p.unitCost, 0);
    let customerId = input.customerId ? String(input.customerId) : null;
    if (customerId && !(await tx.customer.findUnique({ where: { id: customerId }, select: { id: true } }))) throw err("Customer not found", "CUSTOMER_NOT_FOUND", 404);
    if (!customerId && String(input.customerName || "").trim()) {
      const phone = String(input.phone || "").trim() || null;
      const existing = phone ? await tx.customer.findFirst({ where: { phone }, select: { id: true } }) : null;
      const customer = existing || await tx.customer.create({ data: { name: String(input.customerName).trim(), phone, whatsapp: phone } , select: { id: true } });
      customerId = customer.id;
    }
    const estimatedCost = Math.max(0, money(input.estimatedCost ?? input.cost) || money(totalParts));
    const finalCost = Math.max(0, money(input.finalCost));
    const receivedDate = input.receivedDate ? new Date(input.receivedDate) : new Date();
    const dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (Number.isNaN(receivedDate.getTime()) || (dueDate && Number.isNaN(dueDate.getTime()))) throw err("Invalid repair date", "INVALID_REPAIR_DATE");
    const rawStatus = String(input.status || "PENDING").toUpperCase();
    if (!transitions[rawStatus] && rawStatus !== "PENDING") throw err("Invalid repair status", "INVALID_REPAIR_STATUS");
    let created = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        created = await tx.repair.create({ data: {
          repairNumber: await nextNumber(tx), customerId, productId: input.productId || null,
          title: String(input.title || input.problem || "إصلاح").trim(), description: input.description || input.problem || null,
          itemType: input.itemType ? String(input.itemType).trim() : null,
          problem: input.problem ? String(input.problem).trim() : null,
          diagnosis: input.diagnosis ? String(input.diagnosis).trim() : null,
          receivedDate, dueDate, status: rawStatus, estimatedCost, finalCost, paidAmount: 0, notes: input.notes || null, imageUrl: input.imageUrl || input.image || null,
          parts: { create: parts },
        }, include });
        break;
      } catch (e) { if (e.code !== "P2002" || attempt === 4) throw e; }
    }
    for (const p of parts) await changeStock({ tx, productId: p.productId, quantity: -p.quantity, type: "REPAIR", userId, note: `Repair ${created.repairNumber}` });
    const requestedPaid = Math.min(Math.max(money(input.paidAmount), 0), Math.max(estimatedCost, finalCost));
    if (requestedPaid > 0) {
      await recordPayment({ tx, amount: requestedPaid, type: "REPAIR_PAYMENT", method: String(input.paymentMethod || "CASH").toUpperCase(), source: "admin", customerId, repairId: created.id, createdById: userId, note: `Initial payment for repair ${created.repairNumber}` });
    }
    const after = await tx.repair.findUnique({ where: { id: created.id }, include });
    await tx.notification.create({ data: { title: "صيانة جديدة", message: `تم تسجيل ${after.repairNumber}`, type: "repair", entityType: "repair", entityId: after.id, source: "system" } });
    await writeAudit({ tx, userId, action: "CREATE", entityType: "REPAIR", entityId: created.id, after });
    return serialize(after);
  });
}

export async function updateRepair(id, input, userId = null) {
  return prisma.$transaction(async tx => {
    const before = await tx.repair.findUnique({ where: { id }, include });
    if (!before) throw err("Repair not found", "REPAIR_NOT_FOUND", 404);
    if (["CANCELLED", "DELIVERED", "COMPLETED"].includes(before.status)) throw err("Closed repair cannot be edited", "REPAIR_CLOSED", 409);
    const data = {};
    if (input.customerId !== undefined) data.customerId = input.customerId || null;
    if (input.productId !== undefined) data.productId = input.productId || null;
    if (input.title !== undefined) data.title = String(input.title).trim();
    if (input.description !== undefined || input.problem !== undefined) { data.description = input.description ?? input.problem ?? null; data.problem = input.problem ?? data.problem ?? null; }
    if (input.itemType !== undefined) data.itemType = input.itemType || null;
    if (input.diagnosis !== undefined) data.diagnosis = input.diagnosis || null;
    if (input.receivedDate !== undefined) data.receivedDate = new Date(input.receivedDate);
    if (input.dueDate !== undefined) data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (input.status !== undefined) {
      const next = String(input.status).toUpperCase();
      if (!transitions[before.status]?.includes(next)) throw err(`Invalid repair status transition from ${before.status} to ${next}`, "INVALID_REPAIR_STATUS_TRANSITION", 409);
      data.status = next;
    }
    if (input.notes !== undefined) data.notes = input.notes || null;
    if (input.imageUrl !== undefined || input.image !== undefined) data.imageUrl = input.imageUrl ?? input.image ?? null;
    if (input.estimatedCost !== undefined || input.cost !== undefined) data.estimatedCost = Math.max(0, money(input.estimatedCost ?? input.cost));
    if (input.finalCost !== undefined) data.finalCost = Math.max(0, money(input.finalCost));
    if (data.receivedDate && Number.isNaN(data.receivedDate.getTime())) throw err("Invalid received date", "INVALID_REPAIR_DATE");
    if (data.dueDate && Number.isNaN(data.dueDate.getTime())) throw err("Invalid due date", "INVALID_REPAIR_DATE");

    if (data.status === "CANCELLED" && before.status !== "CANCELLED") {
      for (const part of before.parts || []) {
        await changeStock({ tx, productId: part.productId, quantity: part.quantity, type: "RETURN_IN", userId, note: `Cancel repair ${before.repairNumber}` });
      }
      for (const payment of (before.payments || []).filter((p) => Number(p.amount) > 0 && !p.reversedPaymentId)) {
        await reversePayment({ tx, originalPaymentId: payment.id, createdById: userId, source: "admin", note: `Cancel repair ${before.repairNumber}` });
      }
    }

    if (input.parts !== undefined && data.status !== "CANCELLED") {
      const oldByProduct = new Map(); for (const p of before.parts) oldByProduct.set(p.productId, (oldByProduct.get(p.productId)||0) + p.quantity);
      const nextParts = await prepareParts(tx, input.parts, oldByProduct);
      const nextByProduct = new Map(); for (const p of nextParts) nextByProduct.set(p.productId, (nextByProduct.get(p.productId)||0) + p.quantity);
      for (const productId of new Set([...oldByProduct.keys(), ...nextByProduct.keys()])) {
        const delta = (nextByProduct.get(productId)||0) - (oldByProduct.get(productId)||0);
        if (delta > 0) await changeStock({ tx, productId, quantity: -delta, type: "REPAIR", userId, note: `Update repair ${before.repairNumber}` });
        if (delta < 0) await changeStock({ tx, productId, quantity: Math.abs(delta), type: "RETURN_IN", userId, note: `Update repair ${before.repairNumber}` });
      }
      await tx.repairPart.deleteMany({ where: { repairId: id } });
      if (nextParts.length) await tx.repairPart.createMany({ data: nextParts.map(p => ({ ...p, repairId: id })) });
    }

    await tx.repair.update({ where: { id }, data });
    await syncRepairPaymentState(tx, id);
    const fresh = await tx.repair.findUnique({ where: { id }, include });
    await writeAudit({ tx, userId, action: "UPDATE", entityType: "REPAIR", entityId: id, before, after: fresh });
    return serialize(fresh);
  });
}

export async function deleteRepair(id, userId = null) {
  return prisma.$transaction(async tx => {
    const before = await tx.repair.findUnique({ where: { id }, include });
    if (!before) throw err("Repair not found", "REPAIR_NOT_FOUND", 404);
    if (["DELIVERED", "COMPLETED"].includes(before.status)) throw err("Delivered repair cannot be deleted", "REPAIR_DELIVERED", 409);
    if (before.status !== "CANCELLED") {
      for (const p of before.parts || []) await changeStock({ tx, productId: p.productId, quantity: p.quantity, type: "RETURN_IN", userId, note: `Cancel repair ${before.repairNumber}` });
    }
    for (const payment of (before.payments || []).filter(p => Number(p.amount) > 0 && !p.reversedPaymentId)) {
      await reversePayment({ tx, originalPaymentId: payment.id, createdById: userId, source: "admin", note: `Delete repair ${before.repairNumber}` });
    }
    await tx.repair.delete({ where: { id } });
    await writeAudit({ tx, userId, action: "DELETE", entityType: "REPAIR", entityId: id, before });
    return { id };
  });
}
