import prisma from "../lib/prisma.js";


function serializeSupplier(supplier) {
  if (!supplier) {
    return null;
  }

  return {
    id: supplier.id,
    name: supplier.name,
    phone: supplier.phone || null,
    whatsapp: supplier.whatsapp || null,
    email: supplier.email || null,
    address: supplier.address || null,
    notes: supplier.notes || null,
    isActive: supplier.isActive === true,
    purchaseCount:
      supplier._count?.purchases ?? 0,

    summary:
      supplier.summary
        ? {
            purchasesCount:
              Number(
                supplier.summary.purchasesCount || 0
              ),

            purchasesTotal:
              Number(
                supplier.summary.purchasesTotal || 0
              ),

            purchasesPaid:
              Number(
                supplier.summary.purchasesPaid || 0
              ),

            outstanding:
              Number(
                supplier.summary.outstanding || 0
              ),

            lastPurchase:
              supplier.summary.lastPurchase || null,
          }
        : null,

    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  };
}


export async function listSuppliers() {
  const suppliers =
    await prisma.supplier.findMany({
      include: {
        _count: {
          select: {
            purchases: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  if (suppliers.length === 0) {
    return [];
  }

  const supplierIds =
    suppliers.map(
      (supplier) => supplier.id
    );

  const purchases =
    await prisma.purchase.findMany({
      where: {
        supplierId: {
          in: supplierIds,
        },

        status: {
          not: "VOID",
        },
      },

      select: {
        id: true,
        supplierId: true,
        invoiceNumber: true,
        total: true,
        createdAt: true,

        payments: {
          where: {
            type: "PURCHASE_PAYMENT",
          },

          select: {
            amount: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const sumPayments =
    (payments) =>
      payments.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0
          ),
        0
      );

  const purchasesBySupplier =
    new Map();

  for (
    const purchase of purchases
  ) {
    if (
      !purchasesBySupplier.has(
        purchase.supplierId
      )
    ) {
      purchasesBySupplier.set(
        purchase.supplierId,
        []
      );
    }

    purchasesBySupplier
      .get(purchase.supplierId)
      .push(purchase);
  }

  const suppliersWithSummary =
    suppliers.map(
      (supplier) => {
        const supplierPurchases =
          purchasesBySupplier.get(
            supplier.id
          ) || [];

        const purchasesTotal =
          supplierPurchases.reduce(
            (sum, purchase) =>
              sum +
              Number(
                purchase.total || 0
              ),
            0
          );

        const purchasesPaid =
          supplierPurchases.reduce(
            (sum, purchase) =>
              sum +
              Math.max(
                sumPayments(
                  purchase.payments || []
                ),
                0
              ),
            0
          );

        const outstanding =
          supplierPurchases.reduce(
            (sum, purchase) =>
              sum +
              Math.max(
                Number(
                  purchase.total || 0
                ) -
                  Math.max(
                    sumPayments(
                      purchase.payments || []
                    ),
                    0
                  ),
                0
              ),
            0
          );

        const lastPurchase =
          supplierPurchases[0]
            ? {
                id:
                  supplierPurchases[0].id,

                invoiceNumber:
                  supplierPurchases[0].invoiceNumber,

                total:
                  Number(
                    supplierPurchases[0].total || 0
                  ),

                createdAt:
                  supplierPurchases[0].createdAt,
              }
            : null;

        return {
          ...supplier,

          summary: {
            purchasesCount:
              supplierPurchases.length,

            purchasesTotal,

            purchasesPaid,

            outstanding,

            lastPurchase,
          },
        };
      }
    );

  return suppliersWithSummary.map(
    serializeSupplier
  );
}


export async function getSupplierById(
  id
) {
  const supplier =
    await prisma.supplier.findUnique({
      where: {
        id,
      },

      include: {
        _count: {
          select: {
            purchases: true,
          },
        },

        purchases: {
          where: {
            status: {
              not: "VOID",
            },
          },

          orderBy: {
            createdAt: "desc",
          },

          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            status: true,
            createdAt: true,

            payments: {
              where: {
                type: "PURCHASE_PAYMENT",
              },

              select: {
                amount: true,
              },
            },
          },
        },
      },
    });

  if (!supplier) {
    return null;
  }

  const sumPayments =
    (payments) =>
      payments.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0
          ),
        0
      );

  const purchasesTotal =
    supplier.purchases.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.total || 0
        ),
      0
    );

  const purchasesPaid =
    supplier.purchases.reduce(
      (sum, purchase) =>
        sum +
        Math.max(
          sumPayments(
            purchase.payments || []
          ),
          0
        ),
      0
    );

  const outstanding =
    supplier.purchases.reduce(
      (sum, purchase) =>
        sum +
        Math.max(
          Number(
            purchase.total || 0
          ) -
            Math.max(
              sumPayments(
                purchase.payments || []
              ),
              0
            ),
          0
        ),
      0
    );

  const lastPurchase =
    supplier.purchases[0]
      ? {
          id:
            supplier.purchases[0].id,

          invoiceNumber:
            supplier.purchases[0].invoiceNumber,

          total:
            Number(
              supplier.purchases[0].total || 0
            ),

          createdAt:
            supplier.purchases[0].createdAt,
        }
      : null;

  return serializeSupplier({
    ...supplier,

    summary: {
      purchasesCount:
        supplier.purchases.length,

      purchasesTotal,

      purchasesPaid,

      outstanding,

      lastPurchase,
    },
  });
}


export async function createSupplier(
  data
) {
  const supplier =
    await prisma.supplier.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        whatsapp:
          data.whatsapp || null,
        email: data.email || null,
        address:
          data.address || null,
        notes: data.notes || null,
        isActive:
          data.isActive !== false,
      },
      include: {
        _count: {
          select: {
            purchases: true,
          },
        },
      },
    });

  return serializeSupplier(
    supplier
  );
}


export async function updateSupplier(
  id,
  data
) {
  const supplier =
    await prisma.supplier.update({
      where: { id },
      data: {
        ...(data.name !==
        undefined
          ? { name: data.name }
          : {}),

        ...(data.phone !==
        undefined
          ? {
              phone:
                data.phone || null,
            }
          : {}),

        ...(data.whatsapp !==
        undefined
          ? {
              whatsapp:
                data.whatsapp ||
                null,
            }
          : {}),

        ...(data.email !==
        undefined
          ? {
              email:
                data.email || null,
            }
          : {}),

        ...(data.address !==
        undefined
          ? {
              address:
                data.address ||
                null,
            }
          : {}),

        ...(data.notes !==
        undefined
          ? {
              notes:
                data.notes || null,
            }
          : {}),

        ...(data.isActive !==
        undefined
          ? {
              isActive:
                data.isActive ===
                true,
            }
          : {}),
      },
      include: {
        _count: {
          select: {
            purchases: true,
          },
        },
      },
    });

  return serializeSupplier(
    supplier
  );
}


export async function deleteSupplier(
  id
) {
  await prisma.supplier.delete({
    where: { id },
  });

  return { id };
}