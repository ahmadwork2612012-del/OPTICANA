const DAY =
  24 *
  60 *
  60 *
  1000;

const safeNumber = (value) =>
  Number(value || 0);

const getStableId = (
  type,
  entityType,
  entityId
) =>
  `SYS-${type}-${entityType}-${entityId}`;

const isWithinLast24Hours = (
  date
) => {
  if (!date) {
    return false;
  }

  const time =
    new Date(date).getTime();

  if (
    Number.isNaN(time)
  ) {
    return false;
  }

  return (
    Date.now() - time <= DAY
  );
};

export function buildSystemNotifications({
  products = [],
  sales = [],
  purchases = [],
  orders = [],
  repairs = [],
  expenses = [],
  payments = [],
  customers = [],
  suppliers = [],
}) {
  const notifications = [];

  /*
   * =====================================
   * INVENTORY
   * =====================================
   */

  products.forEach(
    (product) => {
      const stock =
        safeNumber(
          product.stock
        );

      const reorderLevel =
        safeNumber(
          product.reorderLevel
        );

      if (stock === 0) {
        notifications.push({
          id: getStableId(
            "out",
            "product",
            product.id
          ),

          type: "stock",

          title:
            "نفد المخزون",

          message: `المنتج ${
            product.name ||
            "بدون اسم"
          } نفد من المخزون.`,

          entityType:
            "product",

          entityId:
            product.id,

          priority:
            "high",

          source:
            "system",

          createdAt:
            product.updatedAt ||
            new Date().toISOString(),

          metadata: {
            stock,
          },
        });

        return;
      }

      if (
        stock > 0 &&
        stock <= reorderLevel
      ) {
        notifications.push({
          id: getStableId(
            "low",
            "product",
            product.id
          ),

          type: "stock",

          title:
            "مخزون منخفض",

          message: `المنتج ${
            product.name ||
            "بدون اسم"
          } وصل إلى ${
            stock
          } قطعة فقط.`,

          entityType:
            "product",

          entityId:
            product.id,

          priority:
            "high",

          source:
            "system",

          createdAt:
            product.updatedAt ||
            new Date().toISOString(),

          metadata: {
            stock,
            reorderLevel,
          },
        });
      }
    }
  );


  /*
   * =====================================
   * SALES
   * =====================================
   */

  sales.forEach((sale) => {
    const total =
      safeNumber(
        sale.total
      );

    const paid =
      safeNumber(
        sale.paidAmount
      );

    const remaining =
      Math.max(
        total - paid,
        0
      );

    if (
      remaining > 0 &&
      sale.customer?.name
    ) {
      notifications.push({
        id: getStableId(
          "receivable",
          "sale",
          sale.id
        ),

        type:
          "payment",

        title:
          "فاتورة عليها رصيد",

        message: `فاتورة ${
          sale.invoiceNumber ||
          sale.id
        } للعميل ${
          sale.customer.name
        } عليها ${
          remaining.toLocaleString()
        } ج.م متبقية.`,

        entityType:
          "sale",

        entityId:
          sale.id,

        priority:
          "high",

        source:
          "system",

        createdAt:
          sale.createdAt ||
          new Date().toISOString(),

        metadata: {
          total,
          paid,
          remaining,
          customerId:
            sale.customerId ||
            sale.customer?.id ||
            null,
        },
      });
    }

    if (
      isWithinLast24Hours(
        sale.createdAt
      )
    ) {
      notifications.push({
        id: getStableId(
          "new",
          "sale",
          sale.id
        ),

        type:
          "sale",

        title:
          "عملية بيع جديدة",

        message: `تم تسجيل الفاتورة ${
          sale.invoiceNumber ||
          sale.id
        } بقيمة ${
          total.toLocaleString()
        } ج.م.`,

        entityType:
          "sale",

        entityId:
          sale.id,

        priority:
          "normal",

        source:
          "system",

        createdAt:
          sale.createdAt ||
          new Date().toISOString(),

        metadata: {
          total,
          paid,
          remaining,
        },
      });
    }
  });


  /*
   * =====================================
   * PURCHASES
   * =====================================
   */

  purchases.forEach(
    (purchase) => {
      const total =
        safeNumber(
          purchase.total
        );

      const paid =
        safeNumber(
          purchase.paidAmount
        );

      const remaining =
        Math.max(
          total - paid,
          0
        );

      if (
        remaining > 0 &&
        purchase.supplierId
      ) {
        notifications.push({
          id: getStableId(
            "payable",
            "purchase",
            purchase.id
          ),

          type:
            "purchase",

          title:
            "مبلغ مستحق لمورد",

          message: `فاتورة شراء ${
            purchase.invoiceNumber ||
            purchase.id
          } عليها ${
            remaining.toLocaleString()
          } ج.م مستحقة.`,

          entityType:
            "purchase",

          entityId:
            purchase.id,

          priority:
            "high",

          source:
            "system",

          createdAt:
            purchase.createdAt ||
            new Date().toISOString(),

          metadata: {
            total,
            paid,
            remaining,
            supplierId:
              purchase.supplierId,
          },
        });
      }

      if (
        isWithinLast24Hours(
          purchase.createdAt
        )
      ) {
        notifications.push({
          id: getStableId(
            "new",
            "purchase",
            purchase.id
          ),

          type:
            "purchase",

          title:
            "فاتورة شراء جديدة",

          message: `تم تسجيل فاتورة شراء ${
            purchase.invoiceNumber ||
            purchase.id
          } بقيمة ${
            total.toLocaleString()
          } ج.م.`,

          entityType:
            "purchase",

          entityId:
            purchase.id,

          priority:
            "normal",

          source:
            "system",

          createdAt:
            purchase.createdAt ||
            new Date().toISOString(),

          metadata: {
            total,
            paid,
            remaining,
          },
        });
      }
    }
  );


  /*
   * =====================================
   * ORDERS
   * =====================================
   */

  orders.forEach(
    (order) => {
      if (
        order.status ===
        "pending"
      ) {
        notifications.push({
          id: getStableId(
            "pending",
            "order",
            order.id
          ),

          type:
            "order",

          title:
            "طلب يحتاج مراجعة",

          message: `الطلب ${
            order.id
          } ما زال قيد المراجعة.`,

          entityType:
            "order",

          entityId:
            order.id,

          priority:
            "high",

          source:
            "system",

          createdAt:
            order.createdAt ||
            new Date().toISOString(),
        });
      }

      if (
        order.status ===
        "processing"
      ) {
        notifications.push({
          id: getStableId(
            "processing",
            "order",
            order.id
          ),

          type:
            "order",

          title:
            "طلب قيد التجهيز",

          message: `الطلب ${
            order.id
          } موجود في مرحلة التجهيز.`,

          entityType:
            "order",

          entityId:
            order.id,

          priority:
            "normal",

          source:
            "system",

          createdAt:
            order.updatedAt ||
            order.createdAt ||
            new Date().toISOString(),
        });
      }

      if (
        isWithinLast24Hours(
          order.createdAt
        )
      ) {
        notifications.push({
          id: getStableId(
            "new",
            "order",
            order.id
          ),

          type:
            "order",

          title:
            "طلب جديد",

          message: `وصل طلب جديد ${
            order.id
          } من ${
            order.customer?.name ||
            "عميل"
          }.`,

          entityType:
            "order",

          entityId:
            order.id,

          priority:
            "high",

          source:
            "system",

          createdAt:
            order.createdAt ||
            new Date().toISOString(),
        });
      }
    }
  );


  /*
   * =====================================
   * REPAIRS
   * =====================================
   */

  repairs.forEach(
    (repair) => {
      if (
        repair.status ===
        "ready"
      ) {
        notifications.push({
          id: getStableId(
            "ready",
            "repair",
            repair.id
          ),

          type:
            "repair",

          title:
            "صيانة جاهزة للاستلام",

          message: `الصيانة ${
            repair.id
          } أصبحت جاهزة للاستلام.`,

          entityType:
            "repair",

          entityId:
            repair.id,

          priority:
            "high",

          source:
            "system",

          createdAt:
            repair.updatedAt ||
            repair.createdAt ||
            new Date().toISOString(),
        });
      }

      if (
        repair.dueDate &&
        new Date(
          `${repair.dueDate}T23:59:59`
        ).getTime() <=
          Date.now() +
            DAY &&
        repair.status !==
          "completed" &&
        repair.status !==
          "cancelled"
      ) {
        notifications.push({
          id: getStableId(
            "due",
            "repair",
            repair.id
          ),

          type:
            "repair",

          title:
            "موعد صيانة قريب",

          message: `الصيانة ${
            repair.id
          } موعد تسليمها ${
            repair.dueDate
          }.`,

          entityType:
            "repair",

          entityId:
            repair.id,

          priority:
            "high",

          source:
            "system",

          createdAt:
            repair.updatedAt ||
            repair.createdAt ||
            new Date().toISOString(),
        });
      }

      const cost =
        safeNumber(
          repair.cost
        );

      const paid =
        safeNumber(
          repair.paidAmount
        );

      const remaining =
        Math.max(
          cost - paid,
          0
        );

      if (
        remaining > 0 &&
        repair.customerId
      ) {
        notifications.push({
          id: getStableId(
            "balance",
            "repair",
            repair.id
          ),

          type:
            "payment",

          title:
            "صيانة عليها رصيد",

          message: `الصيانة ${
            repair.id
          } عليها ${
            remaining.toLocaleString()
          } ج.م متبقية.`,

          entityType:
            "repair",

          entityId:
            repair.id,

          priority:
            "normal",

          source:
            "system",

          createdAt:
            repair.createdAt ||
            new Date().toISOString(),

          metadata: {
            remaining,
          },
        });
      }
    }
  );


  /*
   * =====================================
   * PAYMENTS
   * =====================================
   */

  payments
    .filter(
      (payment) =>
        isWithinLast24Hours(
          payment.createdAt
        )
    )
    .forEach(
      (payment) => {
        const amount =
          safeNumber(
            payment.amount
          );

        notifications.push({
          id: getStableId(
            "new",
            "payment",
            payment.id
          ),

          type:
            "payment",

          title:
            "تم تسجيل دفعة",

          message: `تم تسجيل دفعة بقيمة ${
            amount.toLocaleString()
          } ج.م.`,

          entityType:
            payment.saleId
              ? "sale"
              : "payment",

          entityId:
            payment.saleId ||
            payment.id,

          priority:
            "normal",

          source:
            "system",

          createdAt:
            payment.createdAt ||
            new Date().toISOString(),

          metadata: {
            amount,
            paymentId:
              payment.id,
            saleId:
              payment.saleId ||
              null,
            customerId:
              payment.customerId ||
              null,
          },
        });
      }
    );


  /*
   * =====================================
   * CUSTOMERS
   * =====================================
   */

  customers
    .filter(
      (customer) =>
        isWithinLast24Hours(
          customer.createdAt
        )
    )
    .forEach(
      (customer) => {
        notifications.push({
          id: getStableId(
            "new",
            "customer",
            customer.id
          ),

          type:
            "customer",

          title:
            "عميل جديد",

          message: `تمت إضافة العميل ${
            customer.name ||
            "بدون اسم"
          } إلى قاعدة العملاء.`,

          entityType:
            "customer",

          entityId:
            customer.id,

          priority:
            "normal",

          source:
            "system",

          createdAt:
            customer.createdAt ||
            new Date().toISOString(),
        });
      }
    );


  /*
   * =====================================
   * SUPPLIERS
   * =====================================
   */

  suppliers
    .filter(
      (supplier) =>
        isWithinLast24Hours(
          supplier.createdAt
        )
    )
    .forEach(
      (supplier) => {
        notifications.push({
          id: getStableId(
            "new",
            "supplier",
            supplier.id
          ),

          type:
            "supplier",

          title:
            "مورد جديد",

          message: `تمت إضافة المورد ${
            supplier.name ||
            "بدون اسم"
          }.`,

          entityType:
            "supplier",

          entityId:
            supplier.id,

          priority:
            "normal",

          source:
            "system",

          createdAt:
            supplier.createdAt ||
            new Date().toISOString(),
        });
      }
    );


  /*
   * =====================================
   * EXPENSES
   * =====================================
   */

  expenses
    .filter(
      (expense) =>
        isWithinLast24Hours(
          expense.createdAt
        )
    )
    .forEach(
      (expense) => {
        const amount =
          safeNumber(
            expense.amount ??
              expense.total
          );

        notifications.push({
          id: getStableId(
            "new",
            "expense",
            expense.id
          ),

          type:
            "payment",

          title:
            "مصروف جديد",

          message: `تم تسجيل مصروف بقيمة ${
            amount.toLocaleString()
          } ج.م.`,

          entityType:
            "expense",

          entityId:
            expense.id,

          priority:
            "normal",

          source:
            "system",

          createdAt:
            expense.createdAt ||
            new Date().toISOString(),

          metadata: {
            amount,
          },
        });
      }
    );


  return notifications;
}