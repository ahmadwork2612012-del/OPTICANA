import prisma from "../lib/prisma.js";


/* =====================================
   SERIALIZER
===================================== */

function serializeCustomer(
  customer
) {
  if (!customer) {
    return null;
  }

  return {
    id:
      customer.id,

    name:
      customer.name,

    phone:
      customer.phone ||
      null,

    whatsapp:
      customer.whatsapp ||
      null,

    email:
      customer.email ||
      null,

    address:
      customer.address ||
      null,

    notes:
      customer.notes ||
      null,

    isActive:
      customer.isActive ===
      true,

    ordersCount:
      customer._count?.orders ??
      customer.summary
        ?.ordersCount ??
      undefined,

    repairsCount:
      customer._count?.repairs ??
      customer.summary
        ?.repairsCount ??
      undefined,

    summary:
      customer.summary
        ? {
            ordersCount:
              Number(
                customer.summary
                  .ordersCount ||
                  0
              ),

            ordersTotal:
              Number(
                customer.summary
                  .ordersTotal ||
                  0
              ),

            ordersPaid:
              Number(
                customer.summary
                  .ordersPaid ||
                  0
              ),

            ordersRemaining:
              Number(
                customer.summary
                  .ordersRemaining ||
                  0
              ),

            repairsCount:
              Number(
                customer.summary
                  .repairsCount ||
                  0
              ),

            repairsTotal:
              Number(
                customer.summary
                  .repairsTotal ||
                  0
              ),

            repairsPaid:
              Number(
                customer.summary
                  .repairsPaid ||
                  0
              ),

            repairsRemaining:
              Number(
                customer.summary
                  .repairsRemaining ||
                  0
              ),

            paymentsTotal:
              Number(
                customer.summary
                  .paymentsTotal ||
                  0
              ),

            totalSpend:
              Number(
                customer.summary
                  .totalSpend ||
                  0
              ),

            totalPaid:
              Number(
                customer.summary
                  .totalPaid ||
                  0
              ),

            totalRemaining:
              Number(
                customer.summary
                  .totalRemaining ||
                  0
              ),

            lastInteraction:
              customer.summary
                .lastInteraction ||
              null,
          }
        : null,

    orders:
      Array.isArray(
        customer.orders
      )
        ? customer.orders.map(
            (order) => ({
              id:
                order.id,

              orderNumber:
                order.orderNumber,

              status:
                order.status,

              total:
                Number(
                  order.total ||
                    0
                ),

              createdAt:
                order.createdAt,
            })
          )
        : [],

    repairs:
      Array.isArray(
        customer.repairs
      )
        ? customer.repairs.map(
            (repair) => ({
              id:
                repair.id,

              repairNumber:
                repair.repairNumber,

              title:
                repair.title,

              status:
                repair.status,

              estimatedCost:
                Number(
                  repair.estimatedCost ||
                    0
                ),

              finalCost:
                Number(
                  repair.finalCost ||
                    0
                ),

              paidAmount:
                Number(
                  repair.paidAmount ||
                    0
                ),

              createdAt:
                repair.createdAt,
            })
          )
        : [],

    createdAt:
      customer.createdAt,

    updatedAt:
      customer.updatedAt,
  };
}


/* =====================================
   CUSTOMER SUMMARY
===================================== */

async function getCustomerSummary(
  customerId
) {
  const [
    orders,
    ordersCount,
    repairs,
    repairsCount,
    latestOrder,
    latestRepair,
  ] = await Promise.all([
    prisma.order.findMany({
      where: {
        customerId,
        status: {
          not: "CANCELLED",
        },
      },

      select: {
        id: true,
        total: true,
        payments: {
          where: {
            type: "SALE_PAYMENT",
          },
          select: {
            amount: true,
          },
        },
      },
    }),

    prisma.order.count({
      where: {
        customerId,
        status: {
          not: "CANCELLED",
        },
      },
    }),

    prisma.repair.findMany({
      where: {
        customerId,
        status: {
          not: "CANCELLED",
        },
      },

      select: {
        id: true,
        estimatedCost: true,
        finalCost: true,
        payments: {
          where: {
            type: "REPAIR_PAYMENT",
          },
          select: {
            amount: true,
          },
        },
      },
    }),

    prisma.repair.count({
      where: {
        customerId,
        status: {
          not: "CANCELLED",
        },
      },
    }),

    prisma.order.findFirst({
      where: {
        customerId,
        status: {
          not: "CANCELLED",
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        orderNumber: true,
        total: true,
        createdAt: true,
        payments: {
          where: {
            type: "SALE_PAYMENT",
          },
          select: {
            amount: true,
          },
        },
      },
    }),

    prisma.repair.findFirst({
      where: {
        customerId,
        status: {
          not: "CANCELLED",
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        repairNumber: true,
        title: true,
        estimatedCost: true,
        finalCost: true,
        createdAt: true,
        payments: {
          where: {
            type: "REPAIR_PAYMENT",
          },
          select: {
            amount: true,
          },
        },
      },
    }),
  ]);

  const sumPaymentAmounts = (
    payments
  ) =>
    payments.reduce(
      (
        sum,
        payment
      ) =>
        sum +
        Number(
          payment.amount || 0
        ),
      0
    );

  const getOrderPaid = (
    order
  ) =>
    Math.max(
      sumPaymentAmounts(
        order.payments || []
      ),
      0
    );

  const getRepairPaid = (
    repair
  ) =>
    Math.max(
      sumPaymentAmounts(
        repair.payments || []
      ),
      0
    );

  const ordersTotal =
    orders.reduce(
      (
        sum,
        order
      ) =>
        sum +
        Number(
          order.total || 0
        ),
      0
    );

  const ordersPaid =
    orders.reduce(
      (
        sum,
        order
      ) =>
        sum +
        getOrderPaid(order),
      0
    );

  const ordersRemaining =
    orders.reduce(
      (
        sum,
        order
      ) =>
        sum +
        Math.max(
          Number(
            order.total || 0
          ) -
            getOrderPaid(order),
          0
        ),
      0
    );

  const repairsTotal =
    repairs.reduce(
      (
        sum,
        repair
      ) => {
        const cost =
          Number(
            repair.finalCost || 0
          ) > 0
            ? Number(
                repair.finalCost
              )
            : Number(
                repair.estimatedCost || 0
              );

        return sum + cost;
      },
      0
    );

  const repairsPaid =
    repairs.reduce(
      (
        sum,
        repair
      ) =>
        sum +
        getRepairPaid(repair),
      0
    );

  const repairsRemaining =
    repairs.reduce(
      (
        sum,
        repair
      ) => {
        const cost =
          Number(
            repair.finalCost || 0
          ) > 0
            ? Number(
                repair.finalCost
              )
            : Number(
                repair.estimatedCost || 0
              );

        return (
          sum +
          Math.max(
            cost -
              getRepairPaid(
                repair
              ),
            0
          )
        );
      },
      0
    );

  const paymentsTotal =
    ordersPaid +
    repairsPaid;

  const totalSpend =
    ordersTotal +
    repairsTotal;

  const totalPaid =
    ordersPaid +
    repairsPaid;

  const totalRemaining =
    ordersRemaining +
    repairsRemaining;

  let lastInteraction =
    null;

  if (
    latestOrder &&
    latestRepair
  ) {
    if (
      new Date(
        latestOrder.createdAt
      ) >=
      new Date(
        latestRepair.createdAt
      )
    ) {
      const orderAmount =
        Number(
          latestOrder.total || 0
        );

      const orderPaid =
        getOrderPaid(
          latestOrder
        );

      lastInteraction = {
        type:
          "order",

        date:
          latestOrder.createdAt,

        title:
          latestOrder.orderNumber ||
          latestOrder.id,

        description:
          "بيانات العميل غير متاحة",

        amount:
          orderAmount,

        remaining:
          Math.max(
            orderAmount -
              orderPaid,
            0
          ),
      };
    } else {
      const repairAmount =
        Number(
          latestRepair.finalCost || 0
        ) > 0
          ? Number(
              latestRepair.finalCost
            )
          : Number(
              latestRepair.estimatedCost ||
                0
            );

      const repairPaid =
        getRepairPaid(
          latestRepair
        );

      lastInteraction = {
        type:
          "repair",

        date:
          latestRepair.createdAt,

        title:
          latestRepair.repairNumber ||
          latestRepair.id,

        description:
          `صيانة: ${
            latestRepair.title ||
            "بدون عنوان"
          }`,

        amount:
          repairAmount,

        remaining:
          Math.max(
            repairAmount -
              repairPaid,
            0
          ),
      };
    }
  } else if (
    latestOrder
  ) {
    const orderAmount =
      Number(
        latestOrder.total || 0
      );

    const orderPaid =
      getOrderPaid(
        latestOrder
      );

    lastInteraction = {
      type:
        "order",

      date:
        latestOrder.createdAt,

      title:
        latestOrder.orderNumber ||
        latestOrder.id,

      description:
        "بيانات العميل غير متاحة",

      amount:
        orderAmount,

      remaining:
        Math.max(
          orderAmount -
            orderPaid,
          0
        ),
    };
  } else if (
    latestRepair
  ) {
    const repairAmount =
      Number(
        latestRepair.finalCost || 0
      ) > 0
        ? Number(
            latestRepair.finalCost
          )
        : Number(
            latestRepair.estimatedCost ||
              0
          );

    const repairPaid =
      getRepairPaid(
        latestRepair
      );

    lastInteraction = {
      type:
        "repair",

      date:
        latestRepair.createdAt,

      title:
        latestRepair.repairNumber ||
        latestRepair.id,

      description:
        `صيانة: ${
          latestRepair.title ||
          "بدون عنوان"
        }`,

      amount:
        repairAmount,

      remaining:
        Math.max(
          repairAmount -
            repairPaid,
          0
        ),
    };
  }

  return {
    ordersCount,
    ordersTotal,
    ordersPaid,
    ordersRemaining,

    repairsCount,
    repairsTotal,
    repairsPaid,
    repairsRemaining,

    paymentsTotal,

    totalSpend,
    totalPaid,
    totalRemaining,

    lastInteraction,
  };
}


/* =====================================
   ADMIN: LIST CUSTOMERS
===================================== */

export async function listCustomers() {
  const customers =
    await prisma.customer.findMany({
      include: {
        _count: {
          select: {
            orders: true,
            repairs: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  if (customers.length === 0) {
    return [];
  }

  const customerIds =
    customers.map(
      (customer) => customer.id
    );

  const [
    orders,
    repairs,
    latestOrders,
    latestRepairs,
  ] = await Promise.all([
    prisma.order.findMany({
      where: {
        customerId: {
          in: customerIds,
        },

        status: {
          not: "CANCELLED",
        },
      },

      select: {
        id: true,
        customerId: true,
        total: true,

        payments: {
          where: {
            type: "SALE_PAYMENT",
          },

          select: {
            amount: true,
          },
        },
      },
    }),

    prisma.repair.findMany({
      where: {
        customerId: {
          in: customerIds,
        },

        status: {
          not: "CANCELLED",
        },
      },

      select: {
        id: true,
        customerId: true,
        estimatedCost: true,
        finalCost: true,

        payments: {
          where: {
            type: "REPAIR_PAYMENT",
          },

          select: {
            amount: true,
          },
        },
      },
    }),

    prisma.order.findMany({
      where: {
        customerId: {
          in: customerIds,
        },

        status: {
          not: "CANCELLED",
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        customerId: true,
        orderNumber: true,
        total: true,
        createdAt: true,

        payments: {
          where: {
            type: "SALE_PAYMENT",
          },

          select: {
            amount: true,
          },
        },
      },
    }),

    prisma.repair.findMany({
      where: {
        customerId: {
          in: customerIds,
        },

        status: {
          not: "CANCELLED",
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        customerId: true,
        repairNumber: true,
        title: true,
        estimatedCost: true,
        finalCost: true,
        createdAt: true,

        payments: {
          where: {
            type: "REPAIR_PAYMENT",
          },

          select: {
            amount: true,
          },
        },
      },
    }),
  ]);

  const sumPayments = (
    payments
  ) =>
    payments.reduce(
      (
        sum,
        payment
      ) =>
        sum +
        Number(
          payment.amount || 0
        ),
      0
    );

  const ordersByCustomer =
    new Map();

  for (
    const order of orders
  ) {
    if (
      !ordersByCustomer.has(
        order.customerId
      )
    ) {
      ordersByCustomer.set(
        order.customerId,
        []
      );
    }

    ordersByCustomer
      .get(order.customerId)
      .push(order);
  }

  const repairsByCustomer =
    new Map();

  for (
    const repair of repairs
  ) {
    if (
      !repairsByCustomer.has(
        repair.customerId
      )
    ) {
      repairsByCustomer.set(
        repair.customerId,
        []
      );
    }

    repairsByCustomer
      .get(repair.customerId)
      .push(repair);
  }

  const latestOrderByCustomer =
    new Map();

  for (
    const order of latestOrders
  ) {
    if (
      !latestOrderByCustomer.has(
        order.customerId
      )
    ) {
      latestOrderByCustomer.set(
        order.customerId,
        order
      );
    }
  }

  const latestRepairByCustomer =
    new Map();

  for (
    const repair of latestRepairs
  ) {
    if (
      !latestRepairByCustomer.has(
        repair.customerId
      )
    ) {
      latestRepairByCustomer.set(
        repair.customerId,
        repair
      );
    }
  }

  const customersWithSummary =
    customers.map(
      (customer) => {
        const customerOrders =
          ordersByCustomer.get(
            customer.id
          ) || [];

        const customerRepairs =
          repairsByCustomer.get(
            customer.id
          ) || [];

        const ordersTotal =
          customerOrders.reduce(
            (
              sum,
              order
            ) =>
              sum +
              Number(
                order.total || 0
              ),
            0
          );

        const ordersPaid =
          customerOrders.reduce(
            (
              sum,
              order
            ) =>
              sum +
              Math.max(
                sumPayments(
                  order.payments || []
                ),
                0
              ),
            0
          );

        const ordersRemaining =
          customerOrders.reduce(
            (
              sum,
              order
            ) =>
              sum +
              Math.max(
                Number(
                  order.total || 0
                ) -
                  Math.max(
                    sumPayments(
                      order.payments ||
                        []
                    ),
                    0
                  ),
                0
              ),
            0
          );

        const repairsTotal =
          customerRepairs.reduce(
            (
              sum,
              repair
            ) => {
              const cost =
                Number(
                  repair.finalCost || 0
                ) > 0
                  ? Number(
                      repair.finalCost
                    )
                  : Number(
                      repair.estimatedCost ||
                        0
                    );

              return sum + cost;
            },
            0
          );

        const repairsPaid =
          customerRepairs.reduce(
            (
              sum,
              repair
            ) =>
              sum +
              Math.max(
                sumPayments(
                  repair.payments ||
                    []
                ),
                0
              ),
            0
          );

        const repairsRemaining =
          customerRepairs.reduce(
            (
              sum,
              repair
            ) => {
              const cost =
                Number(
                  repair.finalCost || 0
                ) > 0
                  ? Number(
                      repair.finalCost
                    )
                  : Number(
                      repair.estimatedCost ||
                        0
                    );

              const paid =
                Math.max(
                  sumPayments(
                    repair.payments ||
                      []
                  ),
                  0
                );

              return (
                sum +
                Math.max(
                  cost - paid,
                  0
                )
              );
            },
            0
          );

        const latestOrder =
          latestOrderByCustomer.get(
            customer.id
          ) || null;

        const latestRepair =
          latestRepairByCustomer.get(
            customer.id
          ) || null;

        let lastInteraction =
          null;

        if (
          latestOrder &&
          latestRepair
        ) {
          if (
            new Date(
              latestOrder.createdAt
            ) >=
            new Date(
              latestRepair.createdAt
            )
          ) {
            const amount =
              Number(
                latestOrder.total || 0
              );

            const paid =
              Math.max(
                sumPayments(
                  latestOrder.payments ||
                    []
                ),
                0
              );

            lastInteraction = {
              type: "order",

              date:
                latestOrder.createdAt,

              title:
                latestOrder.orderNumber ||
                latestOrder.id,

              description:
                "بيانات العميل غير متاحة",

              amount,

              remaining:
                Math.max(
                  amount - paid,
                  0
                ),
            };
          } else {
            const amount =
              Number(
                latestRepair.finalCost ||
                  0
              ) > 0
                ? Number(
                    latestRepair.finalCost
                  )
                : Number(
                    latestRepair.estimatedCost ||
                      0
                  );

            const paid =
              Math.max(
                sumPayments(
                  latestRepair.payments ||
                    []
                ),
                0
              );

            lastInteraction = {
              type: "repair",

              date:
                latestRepair.createdAt,

              title:
                latestRepair.repairNumber ||
                latestRepair.id,

              description:
                `صيانة: ${
                  latestRepair.title ||
                  "بدون عنوان"
                }`,

              amount,

              remaining:
                Math.max(
                  amount - paid,
                  0
                ),
            };
          }
        } else if (
          latestOrder
        ) {
          const amount =
            Number(
              latestOrder.total || 0
            );

          const paid =
            Math.max(
              sumPayments(
                latestOrder.payments ||
                  []
              ),
              0
            );

          lastInteraction = {
            type: "order",

            date:
              latestOrder.createdAt,

            title:
              latestOrder.orderNumber ||
              latestOrder.id,

            description:
              "بيانات العميل غير متاحة",

            amount,

            remaining:
              Math.max(
                amount - paid,
                0
              ),
          };
        } else if (
          latestRepair
        ) {
          const amount =
            Number(
              latestRepair.finalCost ||
                0
            ) > 0
              ? Number(
                  latestRepair.finalCost
                )
              : Number(
                  latestRepair.estimatedCost ||
                    0
                );

          const paid =
            Math.max(
              sumPayments(
                latestRepair.payments ||
                  []
              ),
              0
            );

          lastInteraction = {
            type: "repair",

            date:
              latestRepair.createdAt,

            title:
              latestRepair.repairNumber ||
              latestRepair.id,

            description:
              `صيانة: ${
                latestRepair.title ||
                "بدون عنوان"
              }`,

            amount,

            remaining:
              Math.max(
                amount - paid,
                0
              ),
          };
        }

        const paymentsTotal =
          ordersPaid +
          repairsPaid;

        return {
          ...customer,

          summary: {
            ordersCount:
              customerOrders.length,

            ordersTotal,

            ordersPaid,

            ordersRemaining,

            repairsCount:
              customerRepairs.length,

            repairsTotal,

            repairsPaid,

            repairsRemaining,

            paymentsTotal,

            totalSpend:
              ordersTotal +
              repairsTotal,

            totalPaid:
              ordersPaid +
              repairsPaid,

            totalRemaining:
              ordersRemaining +
              repairsRemaining,

            lastInteraction,
          },
        };
      }
    );

  return customersWithSummary.map(
    serializeCustomer
  );
}


/* =====================================
   ADMIN: GET CUSTOMER BY ID
===================================== */

export async function getCustomerById(
  id
) {
  const customer =
    await prisma.customer.findUnique({
      where: {
        id,
      },

      include: {
        _count: {
          select: {
            orders:
              true,

            repairs:
              true,
          },
        },

        orders: {
          where: {
            status: {
              not:
                "CANCELLED",
            },
          },

          orderBy: {
            createdAt:
              "desc",
          },

          take: 20,

          select: {
            id:
              true,

            orderNumber:
              true,

            status:
              true,

            total:
              true,

            createdAt:
              true,
          },
        },

        repairs: {
          where: {
            status: {
              not:
                "CANCELLED",
            },
          },

          orderBy: {
            createdAt:
              "desc",
          },

          take: 20,

          select: {
            id:
              true,

            repairNumber:
              true,

            title:
              true,

            status:
              true,

            estimatedCost:
              true,

            finalCost:
              true,

            paidAmount:
              true,

            createdAt:
              true,
          },
        },
      },
    });


  if (!customer) {
    return null;
  }


  const summary =
    await getCustomerSummary(
      customer.id
    );


  return serializeCustomer({
    ...customer,

    summary,
  });
}


/* =====================================
   ADMIN: CREATE CUSTOMER
===================================== */

export async function createCustomer(
  data
) {
  const customer =
    await prisma.customer.create({
      data,
    });


  return serializeCustomer(
    customer
  );
}


/* =====================================
   ADMIN: UPDATE CUSTOMER
===================================== */

export async function updateCustomer(
  id,
  data
) {
  const customer =
    await prisma.customer.update({
      where: {
        id,
      },

      data,
    });


  return serializeCustomer(
    customer
  );
}


/* =====================================
   ADMIN: DELETE CUSTOMER
===================================== */

export async function deleteCustomer(
  id
) {
  await prisma.customer.delete({
    where: {
      id,
    },
  });


  return {
    id,
  };
}