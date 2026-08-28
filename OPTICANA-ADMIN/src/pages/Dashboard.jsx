import {
  ArrowLeft,
  BarChart3,
  Bell,
  Boxes,
  ClipboardList,
  CreditCard,
  Package,
  ShoppingCart,
  Store,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
  Wrench,
  AlertTriangle,
  Plus,
  CircleDollarSign,
  CheckCircle2,
  Clock3,
  Receipt,
} from "lucide-react";

import {
  useEffect,
  useMemo,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import useSalesStore from "../store/salesStore";
import useOrderStore from "../store/orderStore";
import useProductStore from "../store/productStore";
import useCustomerStore from "../store/customerStore";
import useRepairStore from "../store/repairStore";
import useExpenseStore from "../store/expenseStore";


function Dashboard() {
  const navigate =
    useNavigate();


  /* =====================================
     STORES
  ===================================== */

  const sales =
    useSalesStore(
      (state) => state.sales
    );

  const orders =
    useOrderStore(
      (state) => state.orders
    );

  const products =
    useProductStore(
      (state) => state.products
    );

  const customers =
    useCustomerStore(
      (state) => state.customers
    );

  const repairs =
    useRepairStore(
      (state) => state.repairs
    );

  const expenses =
    useExpenseStore(
      (state) => state.expenses
    );

  const fetchSales = useSalesStore((state) => state.fetchSales);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);
  const fetchRepairs = useRepairStore((state) => state.fetchRepairs);
  const fetchExpenses = useExpenseStore((state) => state.fetchExpenses);

  useEffect(() => {
    Promise.all([fetchSales(), fetchOrders(), fetchProducts(), fetchCustomers(), fetchRepairs(), fetchExpenses()]).catch(() => {});
  }, [fetchSales, fetchOrders, fetchProducts, fetchCustomers, fetchRepairs, fetchExpenses]);


  /* =====================================
     DATE
  ===================================== */

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const currentMonth =
    today.slice(
      0,
      7
    );


  /* =====================================
     TODAY SALES
  ===================================== */

  const todaySales =
    useMemo(() => {
      return sales.filter(
        (sale) =>
          sale.createdAt?.slice(
            0,
            10
          ) === today
      );
    }, [
      sales,
      today,
    ]);


  const todayRevenue =
    useMemo(() => {
      return todaySales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.total || 0
          ),
        0
      );
    }, [
      todaySales,
    ]);


  const todayCollected =
    useMemo(() => {
      return todaySales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.paidAmount || 0
          ),
        0
      );
    }, [
      todaySales,
    ]);


  const todayReceivables =
    useMemo(() => {
      return todaySales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.remainingAmount ||
              0
          ),
        0
      );
    }, [
      todaySales,
    ]);


  const todayCOGS =
    useMemo(() => {
      return todaySales.reduce(
        (sum, sale) =>
          sum +
          getSaleCOGS(
            sale
          ),
        0
      );
    }, [
      todaySales,
    ]);


  const todayGrossProfit =
    todayRevenue -
    todayCOGS;


  /* =====================================
     ALL SALES
  ===================================== */

  const totalRevenue =
    useMemo(() => {
      return sales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.total || 0
          ),
        0
      );
    }, [
      sales,
    ]);


  const totalCollected =
    useMemo(() => {
      return sales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.paidAmount || 0
          ),
        0
      );
    }, [
      sales,
    ]);


  const totalReceivables =
    useMemo(() => {
      return sales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.remainingAmount ||
              0
          ),
        0
      );
    }, [
      sales,
    ]);


  const totalCOGS =
    useMemo(() => {
      return sales.reduce(
        (sum, sale) =>
          sum +
          getSaleCOGS(
            sale
          ),
        0
      );
    }, [
      sales,
    ]);


  const totalGrossProfit =
    useMemo(() => {
      return sales.reduce(
        (sum, sale) => {
          if (
            sale.grossProfit !==
            undefined
          ) {
            return (
              sum +
              Number(
                sale.grossProfit ||
                  0
              )
            );
          }

          return (
            sum +
            Number(
              sale.total || 0
            ) -
            getSaleCOGS(
              sale
            )
          );
        },
        0
      );
    }, [
      sales,
    ]);


  /* =====================================
     EXPENSES
  ===================================== */

  const getExpenseAmount =
    (
      expense
    ) =>
      Number(
        expense.amount ??
          expense.total ??
          0
      );


  const todayExpenses =
    useMemo(() => {
      return expenses
        .filter(
          (
            expense
          ) =>
            expense.createdAt?.slice(
              0,
              10
            ) ===
            today
        )
        .reduce(
          (
            sum,
            expense
          ) =>
            sum +
            getExpenseAmount(
              expense
            ),
          0
        );
    }, [
      expenses,
      today,
    ]);


  const totalExpenses =
    useMemo(() => {
      return expenses.reduce(
        (
          sum,
          expense
        ) =>
          sum +
          getExpenseAmount(
            expense
          ),
        0
      );
    }, [
      expenses,
    ]);


  const thisMonthRevenue =
    useMemo(() => {
      return sales
        .filter(
          (sale) =>
            sale.createdAt?.slice(
              0,
              7
            ) ===
            currentMonth
        )
        .reduce(
          (
            sum,
            sale
          ) =>
            sum +
            Number(
              sale.total ||
                0
            ),
          0
        );
    }, [
      sales,
      currentMonth,
    ]);


  const thisMonthExpenses =
    useMemo(() => {
      return expenses
        .filter(
          (
            expense
          ) =>
            expense.createdAt?.slice(
              0,
              7
            ) ===
            currentMonth
        )
        .reduce(
          (
            sum,
            expense
          ) =>
            sum +
            getExpenseAmount(
              expense
            ),
          0
        );
    }, [
      expenses,
      currentMonth,
    ]);


  /*
    صافي الربح هنا:
    الإيرادات - تكلفة البضاعة - المصاريف
  */

  const netProfit =
    totalRevenue -
    totalCOGS -
    totalExpenses;


  const todayNetProfit =
    todayRevenue -
    todayCOGS -
    todayExpenses;


  const thisMonthNetProfit =
    thisMonthRevenue -
    sales
      .filter(
        (sale) =>
          sale.createdAt?.slice(
            0,
            7
          ) ===
          currentMonth
      )
      .reduce(
        (
          sum,
          sale
        ) =>
          sum +
          getSaleCOGS(
            sale
          ),
        0
      ) -
    thisMonthExpenses;


  /* =====================================
     INVENTORY
  ===================================== */

  const totalUnits =
    useMemo(() => {
      return products.reduce(
        (
          sum,
          product
        ) =>
          sum +
          Number(
            product.stock ||
              0
          ),
        0
      );
    }, [
      products,
    ]);


  const lowStockProducts =
    useMemo(() => {
      return products.filter(
        (
          product
        ) =>
          Number(
            product.stock ||
              0
          ) >
            0 &&
          Number(
            product.stock ||
              0
          ) <=
            Number(
              product.reorderLevel ||
                0
            )
      );
    }, [
      products,
    ]);


  const outOfStockProducts =
    useMemo(() => {
      return products.filter(
        (
          product
        ) =>
          Number(
            product.stock ||
              0
          ) ===
          0
      );
    }, [
      products,
    ]);


  const inventoryValue =
    useMemo(() => {
      return products.reduce(
        (
          sum,
          product
        ) =>
          sum +
          Number(
            product.purchasePrice ||
              0
          ) *
            Number(
              product.stock ||
                0
            ),
        0
      );
    }, [
      products,
    ]);


  const inventoryRetailValue =
    useMemo(() => {
      return products.reduce(
        (
          sum,
          product
        ) =>
          sum +
          Number(
            product.sellingPrice ||
              0
          ) *
            Number(
              product.stock ||
                0
            ),
        0
      );
    }, [
      products,
    ]);


  /* =====================================
     ORDERS
  ===================================== */

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "pending"
    ).length;


  const completedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "completed"
    ).length;


  /* =====================================
     REPAIRS
  ===================================== */

  const activeRepairs =
    repairs.filter(
      (repair) =>
        repair.status ===
          "pending" ||
        repair.status ===
          "repairing"
    ).length;


  const readyRepairs =
    repairs.filter(
      (repair) =>
        repair.status ===
        "ready"
    ).length;


  /* =====================================
     CUSTOMER BALANCES
  ===================================== */

  const debtorCustomers =
    useMemo(() => {
      return customers
        .map(
          (customer) => {
            const customerSales =
              sales.filter(
                (sale) =>
                  sale.customerId ===
                    customer.id ||
                  sale.customer?.id ===
                    customer.id
              );

            const customerRepairs =
              repairs.filter(
                (repair) =>
                  repair.customerId === customer.id ||
                  (
                    !repair.customerId &&
                    repair.customerName?.trim().toLowerCase() ===
                      customer.name?.trim().toLowerCase()
                  )
              );

            const balance =
              customerSales.reduce(
                (sum, sale) =>
                  sum + Number(sale.remainingAmount || 0),
                0
              ) +
              customerRepairs.reduce(
                (sum, repair) =>
                  sum + Number(repair.remainingAmount || Math.max(Number(repair.cost || 0) - Number(repair.paidAmount || 0), 0)),
                0
              );

            return {
              ...customer,
              balance,
            };
          }
        )
        .filter(
          (customer) =>
            customer.balance >
            0
        )
        .sort(
          (a, b) =>
            b.balance -
            a.balance
        );
    }, [
      customers,
      sales,
      repairs,
    ]);


  const totalCustomerReceivables =
    debtorCustomers.reduce(
      (
        sum,
        customer
      ) =>
        sum +
        customer.balance,
      0
    );


  /* =====================================
     PAYMENT BREAKDOWN
  ===================================== */

  const cashRevenue =
    todaySales
      .filter(
        (sale) =>
          sale.paymentMethod ===
          "cash"
      )
      .reduce(
        (
          sum,
          sale
        ) =>
          sum +
          Number(
            sale.paidAmount ??
              sale.total ??
              0
          ),
        0
      );


  const cardRevenue =
    todaySales
      .filter(
        (sale) =>
          sale.paymentMethod ===
          "card"
      )
      .reduce(
        (
          sum,
          sale
        ) =>
          sum +
          Number(
            sale.paidAmount ??
              sale.total ??
              0
          ),
        0
      );


  /* =====================================
     TOP PRODUCTS
  ===================================== */

  const topProducts =
    useMemo(() => {
      const map =
        {};

      sales.forEach(
        (
          sale
        ) => {
          sale.items?.forEach(
            (
              item
            ) => {
              const key =
                item.productId ??
                item.sku ??
                item.name;

              if (
                !map[key]
              ) {
                map[key] = {
                  id: key,

                  name:
                    item.name ||
                    "منتج",

                  quantity: 0,

                  revenue: 0,

                  profit: 0,
                };
              }

              const quantity =
                Number(
                  item.quantity ||
                    0
                );

              const revenue =
                Number(
                  item.total ||
                    0
                );

              const cost =
                Number(
                  item.purchasePrice ||
                    0
                ) *
                quantity;

              map[key].quantity +=
                quantity;

              map[key].revenue +=
                revenue;

              map[key].profit +=
                revenue -
                cost;
            }
          );
        }
      );

      return Object.values(
        map
      )
        .sort(
          (
            a,
            b
          ) =>
            b.quantity -
            a.quantity
        )
        .slice(
          0,
          5
        );
    }, [
      sales,
    ]);


  /* =====================================
     RECENT SALES
  ===================================== */

  const recentSales =
    useMemo(() => {
      return [
        ...sales,
      ]
        .sort(
          (
            a,
            b
          ) =>
            new Date(
              b.createdAt ||
                0
            ) -
            new Date(
              a.createdAt ||
                0
            )
        )
        .slice(
          0,
          5
        );
    }, [
      sales,
    ]);


  /* =====================================
     QUICK ACTIONS
  ===================================== */

  const quickActions = [
    {
      label:
        "إضافة منتج",

      icon:
        Plus,

      path:
        "/products",
    },

    {
      label:
        "فتح نقطة البيع",

      icon:
        ShoppingCart,

      path:
        "/pos",
    },

    {
      label:
        "إضافة عميل",

      icon:
        Users,

      path:
        "/customers",
    },

    {
      label:
        "تسجيل مصروف",

      icon:
        WalletCards,

      path:
        "/expenses",
    },
  ];


  return (
    <div className="space-y-6">

      {/* =================================
          HEADER
      ================================= */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
            <BarChart3
              size={15}
            />

            مركز القيادة
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            لوحة التحكم
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            نظرة مباشرة على الأداء المالي وحالة المخزون
            والعملاء والطلبات والصيانة في OPTICANA.
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            navigate(
              "/reports"
            )
          }
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          التقارير

          <ArrowLeft
            size={17}
          />
        </button>

      </div>


      {/* =================================
          CORE FINANCIAL KPIs
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          title="مبيعات اليوم"
          value={`${todayRevenue.toLocaleString()} ج.م`}
          description={`${todaySales.length} عملية بيع`}
          icon={
            TrendingUp
          }
          accent="blue"
        />


        <MetricCard
          title="المحصل اليوم"
          value={`${todayCollected.toLocaleString()} ج.م`}
          description={`متبقي ${todayReceivables.toLocaleString()} ج.م`}
          icon={
            CreditCard
          }
          accent="green"
        />


        <MetricCard
          title="مستحقات العملاء"
          value={`${totalCustomerReceivables.toLocaleString()} ج.م`}
          description={`${debtorCustomers.length} عميل مدين`}
          icon={
            WalletCards
          }
          accent="orange"
          onClick={() =>
            navigate(
              "/customer-balances"
            )
          }
        />


        <MetricCard
          title="صافي الربح"
          value={`${netProfit.toLocaleString()} ج.م`}
          description={`ربح إجمالي ${totalGrossProfit.toLocaleString()} ج.م`}
          icon={
            netProfit >=
            0
              ? TrendingUp
              : TrendingDown
          }
          accent={
            netProfit >=
            0
              ? "purple"
              : "red"
          }
        />

      </div>


      {/* =================================
          TODAY / MONTH
      ================================= */}

      <div className="grid gap-4 lg:grid-cols-2">

        <PeriodCard
          title="ملخص اليوم"
          items={[
            {
              label:
                "المبيعات",

              value:
                `${todayRevenue.toLocaleString()} ج.م`,
            },

            {
              label:
                "المحصل",

              value:
                `${todayCollected.toLocaleString()} ج.م`,
            },

            {
              label:
                "تكلفة البضاعة",

              value:
                `${todayCOGS.toLocaleString()} ج.م`,
            },

            {
              label:
                "المصاريف",

              value:
                `${todayExpenses.toLocaleString()} ج.م`,
            },

            {
              label:
                "صافي الربح",

              value:
                `${todayNetProfit.toLocaleString()} ج.م`,

              highlight:
                true,

              positive:
                todayNetProfit >=
                0,
            },
          ]}
        />


        <PeriodCard
          title="ملخص الشهر الحالي"
          items={[
            {
              label:
                "المبيعات",

              value:
                `${thisMonthRevenue.toLocaleString()} ج.م`,
            },

            {
              label:
                "المصاريف",

              value:
                `${thisMonthExpenses.toLocaleString()} ج.م`,
            },

            {
              label:
                "الربح الإجمالي",

              value:
                `${sales
                  .filter(
                    (
                      sale
                    ) =>
                      sale.createdAt?.slice(
                        0,
                        7
                      ) ===
                      currentMonth
                  )
                  .reduce(
                    (
                      sum,
                      sale
                    ) =>
                      sum +
                      Number(
                        sale.grossProfit ??
                          (
                            Number(
                              sale.total ||
                                0
                            ) -
                            getSaleCOGS(
                              sale
                            )
                          )
                      ),
                    0
                  )
                  .toLocaleString()} ج.م`,
            },

            {
              label:
                "العملاء المدينون",

              value:
                `${debtorCustomers.length} عميل`,
            },

            {
              label:
                "صافي الشهر",

              value:
                `${thisMonthNetProfit.toLocaleString()} ج.م`,

              highlight:
                true,

              positive:
                thisMonthNetProfit >=
                0,
            },
          ]}
        />

      </div>


      {/* =================================
          QUICK ACTIONS
      ================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4">

          <h2 className="font-black text-slate-900">
            إجراءات سريعة
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            أكثر الأشياء التي يحتاج الموظف الوصول إليها بسرعة.
          </p>

        </div>


        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

          {quickActions.map(
            (
              action
            ) => {
              const Icon =
                action.icon;

              return (
                <button
                  key={
                    action.path
                  }
                  type="button"
                  onClick={() =>
                    navigate(
                      action.path
                    )
                  }
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-right transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                    <Icon
                      size={18}
                    />
                  </div>

                  <span className="font-black text-slate-700">
                    {
                      action.label
                    }
                  </span>

                  <ArrowLeft
                    size={15}
                    className="mr-auto text-slate-400"
                  />

                </button>
              );
            }
          )}

        </div>

      </div>


      {/* =================================
          SALES + OPERATIONS
      ================================= */}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="font-black text-slate-900">
                الصورة المالية
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                أهم الأرقام المالية للنظام بالكامل.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/sales"
                )
              }
              className="text-xs font-black text-blue-700 hover:text-blue-800"
            >
              عرض المبيعات
            </button>

          </div>


          <div className="mt-5 grid gap-3 sm:grid-cols-3">

            <SummaryTile
              label="إجمالي المبيعات"
              value={`${totalRevenue.toLocaleString()} ج.م`}
            />

            <SummaryTile
              label="إجمالي المحصل"
              value={`${totalCollected.toLocaleString()} ج.م`}
            />

            <SummaryTile
              label="المستحقات"
              value={`${totalReceivables.toLocaleString()} ج.م`}
              warning={
                totalReceivables >
                0
              }
            />

          </div>


          <div className="mt-6 rounded-xl bg-slate-50 p-4">

            <div className="flex items-center justify-between text-sm">

              <span className="font-bold text-slate-500">
                تكلفة البضاعة
              </span>

              <span className="font-black text-red-600">
                {totalCOGS.toLocaleString()}{" "}
                ج.م
              </span>

            </div>


            <div className="mt-3 flex items-center justify-between text-sm">

              <span className="font-bold text-slate-500">
                المصاريف
              </span>

              <span className="font-black text-red-600">
                {totalExpenses.toLocaleString()}{" "}
                ج.م
              </span>

            </div>


            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">

              <span className="font-black text-slate-900">
                صافي الربح
              </span>

              <span
                className={`font-black ${
                  netProfit >=
                  0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {netProfit.toLocaleString()}{" "}
                ج.م
              </span>

            </div>

          </div>

        </section>


        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div>

            <h2 className="font-black text-slate-900">
              حالة التشغيل
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              الأشياء التي تحتاج انتباهًا الآن.
            </p>

          </div>


          <div className="mt-5 space-y-3">

            <StatusRow
              icon={
                AlertTriangle
              }
              label="مخزون منخفض"
              value={
                lowStockProducts.length
              }
              tone="orange"
              onClick={() =>
                navigate(
                  "/inventory"
                )
              }
            />


            <StatusRow
              icon={
                Package
              }
              label="نفد المخزون"
              value={
                outOfStockProducts.length
              }
              tone="red"
              onClick={() =>
                navigate(
                  "/inventory"
                )
              }
            />


            <StatusRow
              icon={
                Wrench
              }
              label="صيانة نشطة"
              value={
                activeRepairs
              }
              tone="blue"
              onClick={() =>
                navigate(
                  "/repairs"
                )
              }
            />


            <StatusRow
              icon={
                Bell
              }
              label="صيانة جاهزة"
              value={
                readyRepairs
              }
              tone="green"
              onClick={() =>
                navigate(
                  "/repairs"
                )
              }
            />


            <StatusRow
              icon={
                WalletCards
              }
              label="عملاء عليهم أرصدة"
              value={
                debtorCustomers.length
              }
              tone="orange"
              onClick={() =>
                navigate(
                  "/customer-balances"
                )
              }
            />

          </div>

        </section>

      </div>


      {/* =================================
          INVENTORY SNAPSHOT
      ================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="font-black text-slate-900">
              لقطة المخزون
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              قيمة المخزون الحالية بسعر الشراء والبيع.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/inventory"
              )
            }
            className="text-xs font-black text-blue-700"
          >
            إدارة المخزون
          </button>

        </div>


        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <InventoryTile
            label="قيمة الشراء"
            value={`${inventoryValue.toLocaleString()} ج.م`}
            icon={
              Package
            }
          />

          <InventoryTile
            label="قيمة البيع"
            value={`${inventoryRetailValue.toLocaleString()} ج.م`}
            icon={
              TrendingUp
            }
          />

          <InventoryTile
            label="إجمالي القطع"
            value={
              `${totalUnits} قطعة`
            }
            icon={
              Boxes
            }
          />

          <InventoryTile
            label="يحتاج انتباه"
            value={
              lowStockProducts.length +
              outOfStockProducts.length
            }
            icon={
              AlertTriangle
            }
            warning={
              true
            }
          />

        </div>

      </section>


      {/* =================================
          CUSTOMER BALANCES
      ================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 p-5">

          <div>

            <h2 className="font-black text-slate-900">
              أرصدة العملاء
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              العملاء أصحاب أعلى المبالغ المستحقة.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/customer-balances"
              )
            }
            className="text-xs font-black text-blue-700"
          >
            عرض الكل
          </button>

        </div>


        {debtorCustomers.length ===
        0 ? (
          <div className="p-10 text-center">

            <CheckCircle2
              size={38}
              className="mx-auto text-emerald-300"
            />

            <p className="mt-3 font-bold text-slate-700">
              لا توجد أرصدة مستحقة
            </p>

            <p className="mt-1 text-xs text-slate-400">
              جميع العملاء مسددون حاليًا.
            </p>

          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {debtorCustomers
              .slice(
                0,
                5
              )
              .map(
                (
                  customer
                ) => (
                  <button
                    key={
                      customer.id
                    }
                    type="button"
                    onClick={() =>
                      navigate(
                        "/customer-balances"
                      )
                    }
                    className="flex w-full items-center justify-between gap-4 p-5 text-right transition hover:bg-slate-50"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 font-black text-orange-600">
                        {
                          customer.name
                            ?.charAt(
                              0
                            )
                            .toUpperCase()
                        }
                      </div>

                      <div className="min-w-0">

                        <p className="truncate font-black text-slate-800">
                          {
                            customer.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          عليه رصيد مستحق
                        </p>

                      </div>

                    </div>


                    <div className="text-left">

                      <p className="font-black text-orange-600">
                        {customer.balance.toLocaleString()}{" "}
                        ج.م
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        المستحق
                      </p>

                    </div>

                  </button>
                )
              )}

          </div>
        )}

      </section>


      {/* =================================
          RECENT SALES
      ================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 p-5">

          <div>

            <h2 className="font-black text-slate-900">
              آخر المبيعات
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              أحدث الفواتير المسجلة.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/sales"
              )
            }
            className="text-xs font-black text-blue-700"
          >
            عرض المبيعات
          </button>

        </div>


        {recentSales.length ===
        0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            لا توجد مبيعات بعد.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {recentSales.map(
              (
                sale
              ) => (
                <button
                  key={
                    sale.id
                  }
                  type="button"
                  onClick={() =>
                    navigate(
                      "/sales"
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 p-5 text-right transition hover:bg-slate-50"
                >

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <Receipt
                        size={18}
                      />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-black text-slate-800">
                        {
                          sale.invoiceNumber ||
                          sale.id
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {
                          sale.customer
                            ?.name ||
                          "عميل نقدي"
                        }
                      </p>

                    </div>

                  </div>


                  <div className="text-left">

                    <p className="font-black text-slate-900">
                      {Number(
                        sale.total ||
                          0
                      ).toLocaleString()}{" "}
                      ج.م
                    </p>

                    <p
                      className={`mt-1 text-[10px] font-bold ${
                        Number(
                          sale.remainingAmount ||
                            0
                        ) >
                        0
                          ? "text-orange-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {Number(
                        sale.remainingAmount ||
                          0
                      ) >
                      0
                        ? `متبقي ${Number(
                            sale.remainingAmount ||
                              0
                          ).toLocaleString()}`
                        : "مدفوعة"}
                    </p>

                  </div>

                </button>
              )
            )}

          </div>
        )}

      </section>


      {/* =================================
          TOP PRODUCTS
      ================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 p-5">

          <div>

            <h2 className="font-black text-slate-900">
              الأكثر مبيعًا
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              المنتجات ذات أعلى حركة بيع.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/reports"
              )
            }
            className="text-xs font-black text-blue-700"
          >
            التحليلات
          </button>

        </div>


        {topProducts.length ===
        0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            لا توجد مبيعات كافية لعرض المنتجات.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {topProducts.map(
              (
                product,
                index
              ) => (
                <div
                  key={
                    product.id
                  }
                  className="flex items-center justify-between gap-4 p-5"
                >

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-600">
                      {
                        index +
                        1
                      }
                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-bold text-slate-800">
                        {
                          product.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {
                          product.quantity
                        }{" "}
                        قطعة مباعة
                      </p>

                    </div>

                  </div>


                  <div className="text-left">

                    <p className="font-black text-slate-900">
                      {product.revenue.toLocaleString()}{" "}
                      ج.م
                    </p>

                    <p
                      className={`mt-1 text-[11px] font-bold ${
                        product.profit >=
                        0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      ربح{" "}
                      {product.profit.toLocaleString()}{" "}
                      ج.م
                    </p>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>


      {/* =================================
          FOOTER OVERVIEW
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <MiniMetric
          icon={
            Boxes
          }
          label="المنتجات"
          value={
            products.length
          }
          path="/products"
          navigate={
            navigate
          }
        />

        <MiniMetric
          icon={
            Users
          }
          label="العملاء"
          value={
            customers.length
          }
          path="/customers"
          navigate={
            navigate
          }
        />

        <MiniMetric
          icon={
            Store
          }
          label="الطلبات المكتملة"
          value={
            completedOrders
          }
          path="/orders"
          navigate={
            navigate
          }
        />

        <MiniMetric
          icon={
            Wrench
          }
          label="عمليات الصيانة"
          value={
            repairs.length
          }
          path="/repairs"
          navigate={
            navigate
          }
        />

        <MiniMetric
          icon={
            WalletCards
          }
          label="المصاريف"
          value={`${totalExpenses.toLocaleString()} ج.م`}
          path="/expenses"
          navigate={
            navigate
          }
        />

      </div>

    </div>
  );
}


/* =====================================
   METRIC CARD
===================================== */

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "blue",
  onClick,
}) {
  const accentClasses = {
    blue:
      "bg-blue-50 text-blue-700",

    green:
      "bg-emerald-50 text-emerald-600",

    red:
      "bg-red-50 text-red-600",

    orange:
      "bg-orange-50 text-orange-600",

    purple:
      "bg-violet-50 text-violet-600",
  };

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        !onClick
      }
      className={`rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm transition ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
          : "cursor-default"
      }`}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-semibold text-slate-500">
            {
              title
            }
          </p>

          <p className="mt-2 text-2xl font-black text-slate-900">
            {
              value
            }
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {
              description
            }
          </p>

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClasses[accent]}`}
        >
          <Icon
            size={
              21
            }
          />
        </div>

      </div>

    </button>
  );
}


/* =====================================
   PERIOD CARD
===================================== */

function PeriodCard({
  title,
  items,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <h2 className="font-black text-slate-900">
        {
          title
        }
      </h2>

      <div className="mt-4 space-y-3">

        {items.map(
          (
            item
          ) => (
            <div
              key={
                item.label
              }
              className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
            >

              <span className="text-sm font-bold text-slate-500">
                {
                  item.label
                }
              </span>

              <span
                className={`font-black ${
                  item.highlight
                    ? item.positive
                      ? "text-emerald-600"
                      : "text-red-600"
                    : "text-slate-800"
                }`}
              >
                {
                  item.value
                }
              </span>

            </div>
          )
        )}

      </div>

    </section>
  );
}


/* =====================================
   SUMMARY TILE
===================================== */

function SummaryTile({
  label,
  value,
  warning = false,
}) {
  return (
    <div
      className={`rounded-xl p-4 ${
        warning
          ? "bg-orange-50"
          : "bg-slate-50"
      }`}
    >

      <p className="text-xs font-bold text-slate-400">
        {
          label
        }
      </p>

      <p
        className={`mt-2 text-lg font-black ${
          warning
            ? "text-orange-600"
            : "text-slate-900"
        }`}
      >
        {
          value
        }
      </p>

    </div>
  );
}


/* =====================================
   STATUS ROW
===================================== */

function StatusRow({
  icon: Icon,
  label,
  value,
  tone,
  onClick,
}) {
  const styles = {
    orange:
      "bg-orange-50 text-orange-600",

    red:
      "bg-red-50 text-red-600",

    blue:
      "bg-blue-50 text-blue-700",

    green:
      "bg-emerald-50 text-emerald-600",
  };


  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="flex w-full items-center gap-3 rounded-xl bg-slate-50 p-3 text-right transition hover:bg-slate-100"
    >

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles[tone]}`}
      >
        <Icon
          size={
            18
          }
        />
      </div>

      <span className="flex-1 text-sm font-bold text-slate-700">
        {
          label
        }
      </span>

      <span className="font-black text-slate-900">
        {
          value
        }
      </span>

      <ArrowLeft
        size={
          15
        }
        className="text-slate-400"
      />

    </button>
  );
}


/* =====================================
   INVENTORY TILE
===================================== */

function InventoryTile({
  label,
  value,
  icon: Icon,
  warning = false,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

      <div>

        <p className="text-xs font-bold text-slate-400">
          {
            label
          }
        </p>

        <p
          className={`mt-1 font-black ${
            warning
              ? "text-orange-600"
              : "text-slate-800"
          }`}
        >
          {
            value
          }
        </p>

      </div>

      <div
        className={`rounded-xl p-2.5 ${
          warning
            ? "bg-orange-50 text-orange-600"
            : "bg-white text-blue-700 shadow-sm"
        }`}
      >
        <Icon
          size={
            18
          }
        />
      </div>

    </div>
  );
}


/* =====================================
   FOOTER MINI
===================================== */

function MiniMetric({
  icon: Icon,
  label,
  value,
  path,
  navigate,
}) {
  return (
    <button
      type="button"
      onClick={() =>
        navigate(
          path
        )
      }
      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon
            size={
              18
            }
          />
        </div>

        <div>

          <p className="text-xs font-semibold text-slate-400">
            {
              label
            }
          </p>

          <p className="mt-1 text-xl font-black text-slate-900">
            {
              value
            }
          </p>

        </div>

      </div>

      <ArrowLeft
        size={
          16
        }
        className="text-slate-400"
      />

    </button>
  );
}


/* =====================================
   DATA HELPERS
===================================== */

function getSaleCOGS(
  sale
) {
  if (
    sale.costOfGoods !==
    undefined
  ) {
    return Number(
      sale.costOfGoods ||
        0
    );
  }

  return (
    sale.items?.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.costPrice ??
            item.purchasePrice ??
            0
        ) *
          Number(
            item.quantity ||
              0
          ),
      0
    ) || 0
  );
}


export default Dashboard;