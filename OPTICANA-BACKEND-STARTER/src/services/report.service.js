import prisma from "../lib/prisma.js";

function n(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function rangeWhere(from, to) {
  if (!from && !to) return {};
  return {
    createdAt: {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    },
  };
}

function ledgerPaid(records) {
  return records.reduce((sum, payment) => sum + n(payment.amount), 0);
}

export async function getReportSummary({ from, to } = {}) {
  const where = rangeWhere(from, to);

  const [sales, orders, repairs, expenses, products, customers, suppliers, purchases] = await Promise.all([
    prisma.order.findMany({
      where: { ...where, status: "COMPLETED" },
      include: { items: true, payments: true, customer: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5000,
    }),
    prisma.order.findMany({
      where,
      select: { id: true, status: true, total: true, createdAt: true },
      take: 5000,
    }),
    prisma.repair.findMany({
      where: { ...where, status: { not: "CANCELLED" } },
      select: { id: true, status: true, estimatedCost: true, finalCost: true, createdAt: true, customerId: true, payments: { select: { amount: true } } },
      take: 5000,
    }),
    prisma.expense.findMany({
      where,
      select: { id: true, category: true, amount: true, createdAt: true },
      take: 5000,
    }),
    prisma.product.findMany({
      select: { id: true, name: true, price: true, purchasePrice: true, stock: true, reorderLevel: true, showOnStore: true, status: true },
    }),
    prisma.customer.findMany({ select: { id: true, name: true } }),
    prisma.supplier.findMany({ select: { id: true, name: true } }),
    prisma.purchase.findMany({
      where: { status: { not: "VOID" }, ...where },
      select: { id: true, supplierId: true, total: true, payments: { select: { amount: true } } },
      take: 5000,
    }),
  ]);

  const saleRevenue = sales.reduce((sum, order) => sum + n(order.total), 0);
  const salePaid = sales.reduce((sum, order) => sum + ledgerPaid(order.payments || []), 0);
  const saleReceivables = sales.reduce((sum, order) => sum + Math.max(n(order.total) - ledgerPaid(order.payments || []), 0), 0);
  const cogs = sales.reduce((sum, order) => sum + (order.items || []).reduce((inner, item) => inner + n(item.costPrice) * n(item.quantity), 0), 0);
  const expensesTotal = expenses.reduce((sum, expense) => sum + n(expense.amount), 0);
  const grossProfit = saleRevenue - cogs;

  const repairRows = repairs.map((repair) => {
    const total = n(repair.finalCost) > 0 ? n(repair.finalCost) : n(repair.estimatedCost);
    const paid = ledgerPaid(repair.payments || []);
    return { ...repair, total, paid };
  });
  const repairsTotal = repairRows.reduce((sum, repair) => sum + repair.total, 0);
  const repairsPaid = repairRows.reduce((sum, repair) => sum + repair.paid, 0);
  const inventoryUnits = products.reduce((sum, product) => sum + n(product.stock), 0);
  const inventoryCost = products.reduce((sum, product) => sum + n(product.stock) * n(product.purchasePrice), 0);
  const inventoryRetail = products.reduce((sum, product) => sum + n(product.stock) * n(product.price), 0);

  const byMethod = { CASH: 0, CARD: 0, WHATSAPP: 0, ONLINE: 0, OTHER: 0 };
  sales.flatMap((order) => order.payments || []).forEach((payment) => {
    byMethod[payment.method] = (byMethod[payment.method] || 0) + n(payment.amount);
  });

  const storeRevenue = sales.filter((order) => order.source === "store").reduce((sum, order) => sum + n(order.total), 0);
  const posRevenue = sales.filter((order) => order.source === "pos").reduce((sum, order) => sum + n(order.total), 0);
  const adminRevenue = sales.filter((order) => order.source !== "store" && order.source !== "pos").reduce((sum, order) => sum + n(order.total), 0);
  const repairReceivable = repairRows.reduce((sum, repair) => sum + Math.max(repair.total - repair.paid, 0), 0);
  const debtorIds = new Set([
    ...sales.filter((order) => Math.max(n(order.total) - ledgerPaid(order.payments || []), 0) > 0 && order.customerId).map((order) => order.customerId),
    ...repairRows.filter((repair) => Math.max(repair.total - repair.paid, 0) > 0 && repair.customerId).map((repair) => repair.customerId),
  ]);
  const customerReceivables = saleReceivables + repairReceivable;

  const supplierOutstanding = purchases.reduce((sum, purchase) => sum + Math.max(n(purchase.total) - ledgerPaid(purchase.payments || []), 0), 0);

  return {
    generatedAt: new Date().toISOString(),
    range: { from: from || null, to: to || null },
    sales: {
      count: sales.length,
      total: saleRevenue,
      revenue: saleRevenue,
      collected: salePaid,
      receivables: saleReceivables,
      cogs,
      grossProfit,
      netProfit: grossProfit - expensesTotal,
      averageSale: sales.length ? saleRevenue / sales.length : 0,
    },
    orders: {
      total: orders.length,
      pending: orders.filter((order) => order.status === "PENDING").length,
      completed: orders.filter((order) => order.status === "COMPLETED").length,
      revenue: orders.reduce((sum, order) => sum + n(order.total), 0),
    },
    repairs: {
      total: repairRows.length,
      revenue: repairsTotal,
      collected: repairsPaid,
      receivables: Math.max(repairsTotal - repairsPaid, 0),
      pending: repairRows.filter((repair) => ["PENDING", "RECEIVED"].includes(repair.status)).length,
      active: repairRows.filter((repair) => ["DIAGNOSING", "WAITING", "IN_PROGRESS"].includes(repair.status)).length,
      ready: repairRows.filter((repair) => repair.status === "READY").length,
      completed: repairRows.filter((repair) => ["DELIVERED", "COMPLETED"].includes(repair.status)).length,
    },
    expenses: { total: expensesTotal, count: expenses.length },
    profit: { gross: grossProfit, net: grossProfit - expensesTotal },
    channels: { store: storeRevenue, pos: posRevenue, admin: adminRevenue },
    paymentMethods: byMethod,
    inventory: {
      products: products.length,
      units: inventoryUnits,
      costValue: inventoryCost,
      retailValue: inventoryRetail,
      potentialProfit: inventoryRetail - inventoryCost,
      lowStock: products.filter((product) => n(product.stock) > 0 && n(product.stock) <= n(product.reorderLevel)).length,
      outOfStock: products.filter((product) => n(product.stock) === 0).length,
    },
    customers: { total: customers.length, debtors: debtorIds.size, receivables: customerReceivables },
    suppliers: { total: suppliers.length, outstanding: supplierOutstanding },
  };
}
