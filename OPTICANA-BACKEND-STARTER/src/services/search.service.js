import prisma from "../lib/prisma.js";

export async function globalSearch(query, limit = 24) {
  const q = String(query || "").trim();
  if (!q) return [];
  const take = Math.min(Math.max(Number(limit) || 24, 1), 50);

  const [products, customers, orders, suppliers, purchases, repairs] = await Promise.all([
    prisma.product.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] },
      select: { id: true, name: true, sku: true }, take: 5, orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] },
      select: { id: true, name: true, phone: true }, take: 5, orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { OR: [{ id: { contains: q, mode: "insensitive" } }, { orderNumber: { contains: q, mode: "insensitive" } } ] },
      select: { id: true, orderNumber: true, status: true, customer: { select: { name: true, phone: true } } }, take: 5, orderBy: { createdAt: "desc" },
    }),
    prisma.supplier.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q, mode: "insensitive" } }] },
      select: { id: true, name: true, phone: true }, take: 5, orderBy: { createdAt: "desc" },
    }),
    prisma.purchase.findMany({
      where: { invoiceNumber: { contains: q, mode: "insensitive" } },
      select: { id: true, invoiceNumber: true, status: true, supplier: { select: { name: true } } }, take: 5, orderBy: { createdAt: "desc" },
    }),
    prisma.repair.findMany({
      where: { OR: [{ repairNumber: { contains: q, mode: "insensitive" } }, { title: { contains: q, mode: "insensitive" } }, { problem: { contains: q, mode: "insensitive" } }] },
      select: { id: true, repairNumber: true, title: true, customer: { select: { name: true } } }, take: 5, orderBy: { createdAt: "desc" },
    }),
  ]);

  return [
    ...products.map((item) => ({ id: `product-${item.id}`, type: "product", title: item.name, description: item.sku || "منتج", path: "/products" })),
    ...customers.map((item) => ({ id: `customer-${item.id}`, type: "customer", title: item.name, description: item.phone || "عميل", path: "/customers" })),
    ...orders.map((item) => ({ id: `order-${item.id}`, type: "order", title: item.orderNumber || item.id, description: item.customer?.name || "طلب", path: "/orders" })),
    ...orders.filter((item) => item.status === "COMPLETED").map((item) => ({ id: `sale-${item.id}`, type: "sale", title: item.orderNumber || item.id, description: item.customer?.name || "مبيعات", path: "/sales" })),
    ...suppliers.map((item) => ({ id: `supplier-${item.id}`, type: "supplier", title: item.name, description: item.phone || "مورد", path: "/suppliers" })),
    ...purchases.map((item) => ({ id: `purchase-${item.id}`, type: "purchase", title: item.invoiceNumber, description: item.supplier?.name || "مشتريات", path: "/purchases" })),
    ...repairs.map((item) => ({ id: `repair-${item.id}`, type: "repair", title: item.repairNumber, description: item.customer?.name || item.title || "صيانة", path: "/repairs" })),
  ].slice(0, take);
}
