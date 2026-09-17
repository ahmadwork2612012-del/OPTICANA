import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Users,
  Wrench,
  WalletCards,
  Truck,
  CalendarDays,
  FileText,
  Download,
  Image,
  Banknote,
  CreditCard,
  Store,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CircleDollarSign,
  Receipt,
  Boxes,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import useSalesStore from "../store/salesStore";
import useOrderStore from "../store/orderStore";
import useProductStore from "../store/productStore";
import useCustomerStore from "../store/customerStore";
import useRepairStore from "../store/repairStore";
import useExpenseStore from "../store/expenseStore";
import useSupplierStore from "../store/supplierStore";
import useReportStore from "../store/reportStore";


/* =====================================
   PERIODS
===================================== */

const PERIODS = {
  today: "اليوم",
  week: "آخر 7 أيام",
  month: "هذا الشهر",
  year: "هذا العام",
  all: "كل الفترة",
};


/* =====================================
   MAIN
===================================== */

function Reports() {
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

  const suppliers =
    useSupplierStore(
      (state) => state.suppliers
    );

  const reportSummary =
    useReportStore(
      (state) => state.summary
    );

  const fetchReportSummary =
    useReportStore(
      (state) => state.fetchSummary
    );

  const fetchSales =
    useSalesStore(
      (state) => state.fetchSales
    );

  const fetchOrders =
    useOrderStore(
      (state) => state.fetchOrders
    );

  const fetchProducts =
    useProductStore(
      (state) => state.fetchProducts
    );

  const fetchCustomers =
    useCustomerStore(
      (state) => state.fetchCustomers
    );

  const fetchRepairs =
    useRepairStore(
      (state) => state.fetchRepairs
    );

  const fetchExpenses =
    useExpenseStore(
      (state) => state.fetchExpenses
    );

  const fetchSuppliers =
    useSupplierStore(
      (state) => state.fetchSuppliers
    );


  /* =====================================
     PERIOD STATE
  ===================================== */

  const [period, setPeriod] =
    useState("today");


  /* =====================================
     DATE RANGE
  ===================================== */

  const today =
    new Date();

  const endDate =
    endOfDay(today);

  const startDate =
    getPeriodStart(
      period,
      today
    );


  useEffect(() => {
    const requestToday = new Date();
    const requestEnd = endOfDay(requestToday);
    const requestStart = getPeriodStart(period, requestToday);
    const from = requestStart ? requestStart.toISOString() : null;
    const to = requestEnd ? requestEnd.toISOString() : null;

    Promise.all([
      fetchReportSummary({ from, to }),
      fetchSales(),
      fetchOrders(),
      fetchProducts(),
      fetchCustomers(),
      fetchRepairs(),
      fetchExpenses(),
      fetchSuppliers(),
    ]).catch((error) => {
      toast.error(error?.message || "تعذر تحميل بيانات التقارير");
    });
  }, [
    period,
    fetchReportSummary,
    fetchSales,
    fetchOrders,
    fetchProducts,
    fetchCustomers,
    fetchRepairs,
    fetchExpenses,
    fetchSuppliers,
  ]);


  /* =====================================
     FILTERED DATA
  ===================================== */

  const filteredSales =
    useMemo(() => {
      return sales.filter(
        (sale) =>
          isWithinRange(
            sale.createdAt,
            startDate,
            endDate
          )
      );
    }, [
      sales,
      startDate,
      endDate,
    ]);


  const filteredOrders =
    useMemo(() => {
      return orders.filter(
        (order) =>
          isWithinRange(
            order.createdAt,
            startDate,
            endDate
          )
      );
    }, [
      orders,
      startDate,
      endDate,
    ]);


  const filteredRepairs =
    useMemo(() => {
      return repairs.filter(
        (repair) =>
          isWithinRange(
            repair.createdAt,
            startDate,
            endDate
          )
      );
    }, [
      repairs,
      startDate,
      endDate,
    ]);


  const filteredExpenses =
    useMemo(() => {
      return expenses.filter(
        (expense) =>
          isWithinRange(
            expense.createdAt,
            startDate,
            endDate
          )
      );
    }, [
      expenses,
      startDate,
      endDate,
    ]);


  /* =====================================
     SALES FINANCIALS
  ===================================== */

  const totalSalesLocal =
    useMemo(() => {
      return filteredSales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.total || 0
          ),
        0
      );
    }, [
      filteredSales,
    ]);


  const totalCollectedLocal =
    useMemo(() => {
      return filteredSales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.paidAmount || 0
          ),
        0
      );
    }, [
      filteredSales,
    ]);


  const totalReceivablesLocal =
    useMemo(() => {
      return filteredSales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.remainingAmount ||
              0
          ),
        0
      );
    }, [
      filteredSales,
    ]);


  const totalCOGSLocal =
    useMemo(() => {
      return filteredSales.reduce(
        (sum, sale) =>
          sum +
          getSaleCOGS(
            sale
          ),
        0
      );
    }, [
      filteredSales,
    ]);


  const grossProfitLocal =
    useMemo(() => {
      return filteredSales.reduce(
        (
          sum,
          sale
        ) => {
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
      filteredSales,
    ]);


  const averageSale =
  filteredSales.length
    ? (
        reportSummary?.sales?.revenue ??
        totalSalesLocal
      ) / filteredSales.length
    : 0;


  /* =====================================
     EXPENSES
  ===================================== */

  const totalExpensesLocal =
    useMemo(() => {
      return filteredExpenses.reduce(
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
      filteredExpenses,
    ]);


  const totalSales =
    reportSummary?.sales?.revenue ?? totalSalesLocal;

  const totalCollected =
    reportSummary?.sales?.collected ?? totalCollectedLocal;

  const totalReceivables =
    reportSummary?.sales?.receivables ?? totalReceivablesLocal;

  const totalCOGS =
    reportSummary?.sales?.cogs ?? totalCOGSLocal;

  const grossProfit =
    reportSummary?.sales?.grossProfit ?? grossProfitLocal;

  const totalExpenses =
    reportSummary?.expenses?.total ?? totalExpensesLocal;

  const netProfit =
    grossProfit -
    totalExpenses;


  /* =====================================
     CHANNELS
  ===================================== */

  const storeSales =
    filteredSales.filter(
      (sale) =>
        sale.source ===
        "store"
    );


  const onlineSales =
    filteredSales.filter(
      (sale) =>
        sale.source ===
        "online"
    );


  const storeRevenue =
    storeSales.reduce(
      (
        sum,
        sale
      ) =>
        sum +
        Number(
          sale.total || 0
        ),
      0
    );


  const onlineRevenue =
    onlineSales.reduce(
      (
        sum,
        sale
      ) =>
        sum +
        Number(
          sale.total || 0
        ),
      0
    );


  /* =====================================
     PAYMENT METHODS
  ===================================== */

  const cashCollected =
    filteredSales
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


  const cardCollected =
    filteredSales
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
     ORDERS
  ===================================== */

  const pendingOrdersLocal =
    filteredOrders.filter(
      (order) =>
        order.status ===
        "pending"
    ).length;


  const completedOrdersLocal =
    filteredOrders.filter(
      (order) =>
        order.status ===
        "completed"
    ).length;


  const orderRevenueLocal =
    filteredOrders.reduce(
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


  const pendingOrders = reportSummary?.orders?.pending ?? pendingOrdersLocal;
  const completedOrders = reportSummary?.orders?.completed ?? completedOrdersLocal;
  const orderRevenue = reportSummary?.orders?.revenue ?? orderRevenueLocal;

  /* =====================================
     REPAIRS
  ===================================== */

  const repairRevenueLocal =
    filteredRepairs.reduce(
      (
        sum,
        repair
      ) =>
        sum +
        Number(
          repair.cost || 0
        ),
      0
    );


  const repairCollectedLocal =
    filteredRepairs.reduce(
      (
        sum,
        repair
      ) =>
        sum +
        Number(
          repair.paidAmount || 0
        ),
      0
    );





  const pendingRepairsLocal =
    filteredRepairs.filter(
      (repair) =>
        repair.status ===
        "pending"
    ).length;


  const activeRepairsLocal =
    filteredRepairs.filter(
      (repair) =>
        repair.status ===
          "repairing" ||
        repair.status ===
          "pending"
    ).length;


  const readyRepairsLocal =
    filteredRepairs.filter(
      (repair) =>
        repair.status ===
        "ready"
    ).length;


  const completedRepairsLocal =
    filteredRepairs.filter(
      (repair) =>
        repair.status ===
        "completed"
    ).length;


  const repairRevenue = reportSummary?.repairs?.revenue ?? repairRevenueLocal;
  const repairCollected = reportSummary?.repairs?.collected ?? repairCollectedLocal;
  const repairReceivables = reportSummary?.repairs?.receivables ?? Math.max(repairRevenueLocal - repairCollectedLocal, 0);
  const pendingRepairs = reportSummary?.repairs?.pending ?? pendingRepairsLocal;
  const activeRepairs = reportSummary?.repairs?.active ?? activeRepairsLocal;
  const readyRepairs = reportSummary?.repairs?.ready ?? readyRepairsLocal;
  const completedRepairs = reportSummary?.repairs?.completed ?? completedRepairsLocal;

  /* =====================================
     INVENTORY
     Current state, not period-filtered.
  ===================================== */

  const totalUnits =
    products.reduce(
      (
        sum,
        product
      ) =>
        sum +
        Number(
          product.stock || 0
        ),
      0
    );


  const inventoryCostValue =
    products.reduce(
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
            product.stock || 0
          ),
      0
    );


  const inventoryRetailValue =
    products.reduce(
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
            product.stock || 0
          ),
      0
    );


  const inventoryPotentialProfit =
    inventoryRetailValue -
    inventoryCostValue;


  const lowStockProducts =
    products.filter(
      (product) =>
        Number(
          product.stock || 0
        ) >
          0 &&
        Number(
          product.stock || 0
        ) <=
          Number(
            product.reorderLevel ||
              0
          )
    );


  const outOfStockProducts =
    products.filter(
      (product) =>
        Number(
          product.stock || 0
        ) === 0
    );


  /* =====================================
     CUSTOMER BALANCES
     Current state.
  ===================================== */

  const customerBalances =
    useMemo(() => {
      return customers
        .map(
          (
            customer
          ) => {
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
                (
                  repair
                ) =>
                  repair.customerId ===
                    customer.id ||
                  (
                    !repair.customerId &&
                    repair.customerName
                      ?.trim()
                      .toLowerCase() ===
                      customer.name
                        ?.trim()
                        .toLowerCase()
                  )
              );

            const salesRemaining =
              customerSales.reduce(
                (
                  sum,
                  sale
                ) =>
                  sum +
                  Number(
                    sale.remainingAmount ||
                      0
                  ),
                0
              );

            const repairRemaining =
              customerRepairs.reduce(
                (
                  sum,
                  repair
                ) =>
                  sum +
                  Math.max(
                    Number(
                      repair.cost ||
                        0
                    ) -
                      Number(
                        repair.paidAmount ||
                          0
                      ),
                    0
                  ),
                0
              );

            return {
              id:
                customer.id,

              name:
                customer.name,

              phone:
                customer.phone,

              balance:
                salesRemaining +
                repairRemaining,
            };
          }
        )
        .filter(
          (
            customer
          ) =>
            customer.balance >
            0
        )
        .sort(
          (
            a,
            b
          ) =>
            b.balance -
            a.balance
        );
    }, [
      customers,
      sales,
      repairs,
    ]);


  const totalCustomerReceivables =
    customerBalances.reduce(
      (
        sum,
        customer
      ) =>
        sum +
        customer.balance,
      0
    );


  /* =====================================
     TOP PRODUCTS
  ===================================== */

  const topProducts =
    useMemo(() => {
      const map = {};

      filteredSales.forEach(
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
                  id:
                    key,

                  name:
                    item.name ||
                    "منتج",

                  quantity:
                    0,

                  revenue:
                    0,

                  profit:
                    0,
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
                  item.costPrice ??
                    item.purchasePrice ??
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
      filteredSales,
    ]);


  /* =====================================
     EXPENSE SUMMARY
  ===================================== */

  const expenseSummary =
    useMemo(() => {
      const map = {};

      filteredExpenses.forEach(
        (
          expense
        ) => {
          const key =
            expense.category ||
            "غير مصنف";

          if (
            !map[key]
          ) {
            map[key] = {
              label:
                key,

              amount:
                0,

              count:
                0,
            };
          }

          map[key].amount +=
            getExpenseAmount(
              expense
            );

          map[key].count +=
            1;
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
            b.amount -
            a.amount
        )
        .slice(
          0,
          6
        );
    }, [
      filteredExpenses,
    ]);


  /* =====================================
     SUMMARY EXPORT
  ===================================== */

  const buildCompactReport =
    () => {
      return {
        generatedAt:
          new Date().toISOString(),

        period:
          PERIODS[period],

        financial: {
          sales:
            totalSales,

          collected:
            totalCollected,

          receivables:
            totalReceivables,

          cogs:
            totalCOGS,

          grossProfit,
          expenses:
            totalExpenses,

          netProfit,

          averageSale,
        },

        channels: {
          store:
            storeRevenue,

          online:
            onlineRevenue,
        },

        payments: {
          cash:
            cashCollected,

          card:
            cardCollected,
        },

        inventory: {
          products:
            products.length,

          units:
            totalUnits,

          costValue:
            inventoryCostValue,

          retailValue:
            inventoryRetailValue,

          potentialProfit:
            inventoryPotentialProfit,

          lowStock:
            lowStockProducts.length,

          outOfStock:
            outOfStockProducts.length,
        },

        orders: {
          total:
            filteredOrders.length,

          pending:
            pendingOrders,

          completed:
            completedOrders,

          revenue:
            orderRevenue,
        },

        repairs: {
          total:
            filteredRepairs.length,

          revenue:
            repairRevenue,

          collected:
            repairCollected,

          receivables:
            repairReceivables,

          pending:
            pendingRepairs,

          active:
            activeRepairs,

          ready:
            readyRepairs,

          completed:
            completedRepairs,
        },

        customers: {
          total:
            reportSummary?.customers?.total ?? customers.length,

          debtors:
            reportSummary?.customers?.debtors ?? customerBalances.length,

          receivables:
            reportSummary?.customers?.receivables ?? totalCustomerReceivables,
        },

        suppliers: {
          total:
            reportSummary?.suppliers?.total ?? suppliers.length,

          outstanding:
            reportSummary?.suppliers?.outstanding ?? 0,
        },

        topProducts:
          topProducts.map(
            (
              product
            ) => ({
              name:
                product.name,

              quantity:
                product.quantity,

              revenue:
                product.revenue,

              profit:
                product.profit,
            })
          ),

        topExpenses:
          expenseSummary.map(
            (
              expense
            ) => ({
              category:
                expense.label,

              amount:
                expense.amount,

              count:
                expense.count,
            })
          ),
      };
    };


  /* =====================================
     EXPORT JSON
  ===================================== */

  const exportReport =
    () => {
      try {
        const report =
          buildCompactReport();

        const blob =
          new Blob(
            [
              JSON.stringify(
                report,
                null,
                2
              ),
            ],
            {
              type:
                "application/json",
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href =
          url;

        link.download =
          `OPTICANA-report-${getFileDate()}.json`;

        link.click();

        URL.revokeObjectURL(
          url
        );

        toast.success(
          "تم تصدير التقرير المختصر"
        );
      } catch (error) {
        console.error(
          error
        );

        toast.error(
          "تعذر تصدير التقرير"
        );
      }
    };


  /* =====================================
     EXPORT IMAGE
     Compact share card.
  ===================================== */

  const exportReportImage =
    () => {
      try {
        const canvas =
          document.createElement(
            "canvas"
          );

        const width =
          1200;

        const height =
          820;

        canvas.width =
          width;

        canvas.height =
          height;

        const ctx =
          canvas.getContext(
            "2d"
          );

        if (!ctx) {
          throw new Error(
            "Canvas unavailable"
          );
        }


        /* Background */

        ctx.fillStyle =
          "#ffffff";

        ctx.fillRect(
          0,
          0,
          width,
          height
        );


        /* Header */

        ctx.fillStyle =
          "#0f172a";

        ctx.fillRect(
          0,
          0,
          width,
          150
        );


        ctx.fillStyle =
          "#ffffff";

        ctx.font =
          "900 42px Arial";

        ctx.textAlign =
          "right";

        ctx.fillText(
          "OPTICANA",
          1080,
          58
        );

        ctx.font =
          "700 24px Arial";

        ctx.fillText(
          `تقرير ${PERIODS[period]}`,
          1080,
          102
        );


        /* Helper */

        const drawValue =
          (
            label,
            value,
            x,
            y,
            accent = "#0f172a"
          ) => {
            ctx.fillStyle =
              "#64748b";

            ctx.font =
              "600 20px Arial";

            ctx.textAlign =
              "right";

            ctx.fillText(
              label,
              x,
              y
            );

            ctx.fillStyle =
              accent;

            ctx.font =
              "900 30px Arial";

            ctx.fillText(
              value,
              x,
              y + 38
            );
          };


        /* Main values */

        drawValue(
          "المبيعات",
          `${formatCompactNumber(totalSales)} ج.م`,
          1080,
          215,
          "#2563eb"
        );

        drawValue(
          "المحصل",
          `${formatCompactNumber(totalCollected)} ج.م`,
          780,
          215,
          "#059669"
        );

        drawValue(
          "المستحقات",
          `${formatCompactNumber(totalReceivables)} ج.م`,
          480,
          215,
          "#ea580c"
        );

        drawValue(
          "صافي الربح",
          `${formatCompactNumber(netProfit)} ج.م`,
          180,
          215,
          netProfit >=
            0
            ? "#059669"
            : "#dc2626"
        );


        /* Divider */

        ctx.fillStyle =
          "#e2e8f0";

        ctx.fillRect(
          100,
          300,
          1000,
          2
        );


        drawValue(
          "تكلفة البضاعة",
          `${formatCompactNumber(totalCOGS)} ج.م`,
          1080,
          355
        );

        drawValue(
          "المصاريف",
          `${formatCompactNumber(totalExpenses)} ج.م`,
          780,
          355,
          "#dc2626"
        );

        drawValue(
          "قيمة المخزون",
          `${formatCompactNumber(inventoryCostValue)} ج.م`,
          480,
          355
        );

        drawValue(
          "عملاء مدينون",
          `${customerBalances.length}`,
          180,
          355,
          "#ea580c"
        );


        ctx.fillStyle =
          "#f8fafc";

        ctx.fillRect(
          100,
          470,
          1000,
          230
        );


        ctx.fillStyle =
          "#0f172a";

        ctx.font =
          "900 24px Arial";

        ctx.textAlign =
          "right";

        ctx.fillText(
          "أهم الأرقام التشغيلية",
          1040,
          510
        );


        drawValue(
          "الطلبات",
          `${filteredOrders.length}`,
          1040,
          545
        );

        drawValue(
          "الصيانة",
          `${filteredRepairs.length}`,
          760,
          545
        );

        drawValue(
          "المنتجات",
          `${products.length}`,
          480,
          545
        );

        drawValue(
          "الموردون",
          `${suppliers.length}`,
          200,
          545
        );


        ctx.fillStyle =
          "#64748b";

        ctx.font =
          "600 18px Arial";

        ctx.textAlign =
          "right";

        ctx.fillText(
          "التقرير مختصر للمشاركة — OPTICANA",
          1080,
          760
        );


        canvas.toBlob(
          (
            blob
          ) => {
            if (!blob) {
              throw new Error(
                "Image generation failed"
              );
            }

            const url =
              URL.createObjectURL(
                blob
              );

            const link =
              document.createElement(
                "a"
              );

            link.href =
              url;

            link.download =
              `OPTICANA-report-${getFileDate()}.png`;

            link.click();

            URL.revokeObjectURL(
              url
            );

            toast.success(
              "تم تجهيز صورة التقرير المختصرة"
            );
          },
          "image/png"
        );
      } catch (error) {
        console.error(
          error
        );

        toast.error(
          "تعذر إنشاء صورة التقرير"
        );
      }
    };


  /* =====================================
     DISPLAY DATE
  ===================================== */

  const periodLabel =
    PERIODS[period];


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
            مركز التحليلات
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            التقارير والتحليلات
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            تقرير شامل ومختصر عن الأداء المالي والتشغيلي في OPTICANA.
          </p>

        </div>


        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={
              exportReport
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            <Download
              size={17}
            />
            ملف مختصر
          </button>


          <button
            type="button"
            onClick={
              exportReportImage
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Image
              size={17}
            />
            صورة مختصرة
          </button>

        </div>

      </div>


      {/* =================================
          PERIOD FILTER
      ================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
              <CalendarDays
                size={18}
              />
            </div>

            <div>

              <p className="text-sm font-black text-slate-800">
                الفترة
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {
                  periodLabel
                }
              </p>

            </div>

          </div>


          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">

            {Object.entries(
              PERIODS
            ).map(
              ([
                key,
                label,
              ]) => (
                <button
                  key={
                    key
                  }
                  type="button"
                  onClick={() =>
                    setPeriod(
                      key
                    )
                  }
                  className={`rounded-xl px-4 py-2.5 text-xs font-black transition ${
                    period ===
                    key
                      ? "bg-blue-700 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {
                    label
                  }
                </button>
              )
            )}

          </div>

        </div>

      </div>


      {/* =================================
          MAIN FINANCIAL
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={
            CircleDollarSign
          }
          title="إجمالي المبيعات"
          value={`${totalSales.toLocaleString()} ج.م`}
          description={`${filteredSales.length} عملية بيع`}
          accent="blue"
        />


        <StatCard
          icon={
            CheckCircle2
          }
          title="المحصل"
          value={`${totalCollected.toLocaleString()} ج.م`}
          description="المبالغ المحصلة فعليًا"
          accent="green"
        />


        <StatCard
          icon={
            WalletCards
          }
          title="المستحقات"
          value={`${totalReceivables.toLocaleString()} ج.م`}
          description={`${filteredSales.filter(
            (sale) =>
              Number(
                sale.remainingAmount ||
                  0
              ) > 0
          ).length} فاتورة`}
          accent="orange"
        />


        <StatCard
          icon={
            netProfit >=
            0
              ? TrendingUp
              : TrendingDown
          }
          title="صافي الربح"
          value={`${netProfit.toLocaleString()} ج.م`}
          description="الربح الإجمالي - المصاريف"
          accent={
            netProfit >=
            0
              ? "green"
              : "red"
          }
        />

      </div>


      {/* =================================
          PROFIT WATERFALL
      ================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
            <TrendingUp
              size={18}
            />
          </div>

          <div>

            <h2 className="font-black text-slate-900">
              التحليل المالي
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              كيف وصلنا إلى صافي الربح.
            </p>

          </div>

        </div>


        <div className="mt-5 grid gap-3 md:grid-cols-4">

          <FinancialStep
            label="المبيعات"
            value={`${totalSales.toLocaleString()} ج.م`}
            tone="blue"
          />

          <FinancialStep
            label="تكلفة البضاعة"
            value={`- ${totalCOGS.toLocaleString()} ج.م`}
            tone="red"
          />

          <FinancialStep
            label="الربح الإجمالي"
            value={`${grossProfit.toLocaleString()} ج.م`}
            tone="green"
          />

          <FinancialStep
            label="بعد المصاريف"
            value={`${netProfit.toLocaleString()} ج.م`}
            tone={
              netProfit >=
              0
                ? "green"
                : "red"
            }
          />

        </div>


        <div className="mt-4 grid gap-3 sm:grid-cols-3">

          <MiniFinancial
            label="هامش الربح الإجمالي"
            value={
              totalSales > 0
                ? `${(
                    (grossProfit /
                      totalSales) *
                    100
                  ).toFixed(1)}%`
                : "0%"
            }
          />

          <MiniFinancial
            label="متوسط الفاتورة"
            value={`${averageSale.toLocaleString(
              undefined,
              {
                maximumFractionDigits:
                  0,
              }
            )} ج.م`}
          />

          <MiniFinancial
            label="المصاريف"
            value={`${totalExpenses.toLocaleString()} ج.م`}
          />

        </div>

      </section>


      {/* =================================
          CHANNELS / PAYMENTS
      ================================= */}

      <div className="grid gap-6 lg:grid-cols-2">

        <ReportCard
          icon={
            Store
          }
          title="قنوات البيع"
        >

          <ReportLine
            label="المحل"
            value={`${storeRevenue.toLocaleString()} ج.م`}
          />

          <ReportLine
            label="المتجر الإلكتروني"
            value={`${onlineRevenue.toLocaleString()} ج.م`}
          />

          <ReportLine
            label="عدد مبيعات المحل"
            value={
              storeSales.length
            }
          />

          <ReportLine
            label="عدد مبيعات المتجر"
            value={
              onlineSales.length
            }
          />

        </ReportCard>


        <ReportCard
          icon={
            CreditCard
          }
          title="التحصيل"
        >

          <ReportLine
            label="كاش"
            value={`${cashCollected.toLocaleString()} ج.م`}
          />

          <ReportLine
            label="بطاقات"
            value={`${cardCollected.toLocaleString()} ج.م`}
          />

          <ReportLine
            label="إجمالي المحصل"
            value={`${totalCollected.toLocaleString()} ج.م`}
            success
          />

          <ReportLine
            label="المستحق"
            value={`${totalReceivables.toLocaleString()} ج.م`}
            warning={
              totalReceivables >
              0
            }
          />

        </ReportCard>

      </div>


      {/* =================================
          INVENTORY / ORDERS / REPAIRS
      ================================= */}

      <div className="grid gap-6 lg:grid-cols-3">

        <ReportCard
          icon={
            Package
          }
          title="المخزون"
        >

          <ReportLine
            label="إجمالي المنتجات"
            value={
              products.length
            }
          />

          <ReportLine
            label="إجمالي القطع"
            value={
              totalUnits
            }
          />

          <ReportLine
            label="قيمة الشراء"
            value={`${inventoryCostValue.toLocaleString()} ج.م`}
          />

          <ReportLine
            label="قيمة البيع"
            value={`${inventoryRetailValue.toLocaleString()} ج.م`}
          />

          <ReportLine
            label="ربح محتمل"
            value={`${inventoryPotentialProfit.toLocaleString()} ج.م`}
            success
          />

          <ReportLine
            label="مخزون منخفض"
            value={
              lowStockProducts.length
            }
            warning
          />

          <ReportLine
            label="نفد المخزون"
            value={
              outOfStockProducts.length
            }
            danger
          />

        </ReportCard>


        <ReportCard
          icon={
            ShoppingCart
          }
          title="الطلبات"
        >

          <ReportLine
            label="إجمالي الطلبات"
            value={
              filteredOrders.length
            }
          />

          <ReportLine
            label="قيد الانتظار"
            value={
              pendingOrders
            }
            warning
          />

          <ReportLine
            label="مكتملة"
            value={
              completedOrders
            }
            success
          />

          <ReportLine
            label="قيمة الطلبات"
            value={`${orderRevenue.toLocaleString()} ج.م`}
          />

        </ReportCard>


        <ReportCard
          icon={
            Wrench
          }
          title="الصيانة"
        >

          <ReportLine
            label="إجمالي الصيانة"
            value={
              filteredRepairs.length
            }
          />

          <ReportLine
            label="الإيرادات"
            value={`${repairRevenue.toLocaleString()} ج.م`}
          />

          <ReportLine
            label="المحصل"
            value={`${repairCollected.toLocaleString()} ج.م`}
            success
          />

          <ReportLine
            label="المستحق"
            value={`${repairReceivables.toLocaleString()} ج.م`}
            warning={
              repairReceivables >
              0
            }
          />

          <ReportLine
            label="نشطة"
            value={
              activeRepairs
            }
            warning
          />

          <ReportLine
            label="جاهزة"
            value={
              readyRepairs
            }
            success
          />

        </ReportCard>

      </div>


      {/* =================================
          CUSTOMERS / SUPPLIERS
      ================================= */}

      <div className="grid gap-6 lg:grid-cols-2">

        <ReportCard
          icon={
            Users
          }
          title="العملاء"
        >

          <div className="grid gap-3 sm:grid-cols-2">

            <OverviewBox
              icon={
                Users
              }
              label="إجمالي العملاء"
              value={
                customers.length
              }
            />

            <OverviewBox
              icon={
                AlertTriangle
              }
              label="المدينون"
              value={
                customerBalances.length
              }
              warning
            />

            <OverviewBox
              icon={
                WalletCards
              }
              label="إجمالي الذمم"
              value={`${totalCustomerReceivables.toLocaleString()} ج.م`}
              warning
            />

            <OverviewBox
              icon={
                UserRound
              }
              label="عملاء الفترة"
              value={
                new Set(
                  filteredSales
                    .map(
                      (
                        sale
                      ) =>
                        sale.customerId ||
                        sale.customer?.id
                    )
                    .filter(Boolean)
                ).size
              }
            />

          </div>

        </ReportCard>


        <ReportCard
          icon={
            Truck
          }
          title="الموردون"
        >

          <OverviewBox
            icon={
              Truck
            }
            label="إجمالي الموردين"
            value={
              suppliers.length
            }
          />

          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-400">
            حساب المبالغ المستحقة للموردين يحتاج
            إلى سجل مشتريات/دفعات موردين مستقل.
            لذلك لا يتم اختراع رقم غير موجود في البيانات الحالية.
          </p>

        </ReportCard>

      </div>


      {/* =================================
          TOP DEBTORS
      ================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center gap-3 border-b border-slate-200 p-5">

          <div className="rounded-xl bg-orange-50 p-2 text-orange-600">
            <WalletCards
              size={19}
            />
          </div>

          <div>

            <h2 className="font-black text-slate-900">
              أعلى أرصدة العملاء
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              العملاء أصحاب أعلى مبالغ مستحقة حاليًا.
            </p>

          </div>

        </div>


        {customerBalances.length ===
        0 ? (
          <div className="p-10 text-center">

            <CheckCircle2
              size={38}
              className="mx-auto text-emerald-300"
            />

            <p className="mt-3 font-bold text-slate-700">
              لا توجد أرصدة مستحقة
            </p>

          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {customerBalances
              .slice(
                0,
                5
              )
              .map(
                (
                  customer
                ) => (
                  <div
                    key={
                      customer.id
                    }
                    className="flex items-center justify-between gap-4 p-5"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 font-black text-orange-600">
                        {customer.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <p className="font-black text-slate-800">
                          {
                            customer.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {
                            customer.phone ||
                            "بدون هاتف"
                          }
                        </p>

                      </div>

                    </div>


                    <p className="font-black text-orange-600">
                      {customer.balance.toLocaleString()}{" "}
                      ج.م
                    </p>

                  </div>
                )
              )}

          </div>
        )}

      </section>


      {/* =================================
          TOP PRODUCTS
      ================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center gap-3 border-b border-slate-200 p-5">

          <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
            <Package
              size={19}
            />
          </div>

          <div>

            <h2 className="font-black text-slate-900">
              أكثر المنتجات مبيعًا
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              أعلى المنتجات خلال {
                periodLabel
              }.
            </p>

          </div>

        </div>


        {topProducts.length ===
        0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            لا توجد مبيعات كافية خلال الفترة.
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
                  className="flex items-center justify-between gap-4 p-5 transition hover:bg-slate-50"
                >

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-600">
                      {
                        index +
                        1
                      }
                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-black text-slate-800">
                        {
                          product.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {
                          product.quantity
                        }{" "}
                        قطعة
                      </p>

                    </div>

                  </div>


                  <div className="text-left">

                    <p className="font-black text-slate-900">
                      {
                        product.revenue.toLocaleString()
                      }{" "}
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
                      {
                        product.profit.toLocaleString()
                      }{" "}
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
          EXPENSE BREAKDOWN
      ================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center gap-3 border-b border-slate-200 p-5">

          <div className="rounded-xl bg-red-50 p-2 text-red-600">
            <WalletCards
              size={19}
            />
          </div>

          <div>

            <h2 className="font-black text-slate-900">
              توزيع المصاريف
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              أعلى بنود المصروفات في الفترة.
            </p>

          </div>

        </div>


        {expenseSummary.length ===
        0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            لا توجد مصاريف مسجلة في الفترة.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {expenseSummary.map(
              (
                expense
              ) => (
                <div
                  key={
                    expense.label
                  }
                  className="flex items-center justify-between gap-4 p-5"
                >

                  <div>

                    <p className="font-black text-slate-800">
                      {
                        expense.label
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {
                        expense.count
                      }{" "}
                      عملية
                    </p>

                  </div>


                  <p className="font-black text-red-600">
                    {
                      expense.amount.toLocaleString()
                    }{" "}
                    ج.م
                  </p>

                </div>
              )
            )}

          </div>
        )}

      </section>


      {/* =================================
          FOOTER SUMMARY
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <MiniStatCard
          icon={
            Boxes
          }
          label="المنتجات"
          value={
            products.length
          }
        />

        <MiniStatCard
          icon={
            Users
          }
          label="العملاء"
          value={
            customers.length
          }
        />

        <MiniStatCard
          icon={
            ShoppingCart
          }
          label="الطلبات"
          value={
            filteredOrders.length
          }
        />

        <MiniStatCard
          icon={
            Wrench
          }
          label="الصيانة"
          value={
            filteredRepairs.length
          }
        />

        <MiniStatCard
          icon={
            Truck
          }
          label="الموردون"
          value={
            suppliers.length
          }
        />

      </div>

    </div>
  );
}


/* =====================================
   COMPONENTS
===================================== */

function StatCard({
  icon: Icon,
  title,
  value,
  description,
  accent = "blue",
}) {
  const styles = {
    blue:
      "bg-blue-50 text-blue-700",

    green:
      "bg-emerald-50 text-emerald-600",

    orange:
      "bg-orange-50 text-orange-600",

    red:
      "bg-red-50 text-red-600",
  };


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

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
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles[accent]}`}
        >
          <Icon
            size={
              21
            }
          />
        </div>

      </div>

    </div>
  );
}


function FinancialStep({
  label,
  value,
  tone,
}) {
  const styles = {
    blue:
      "bg-blue-50 text-blue-700",

    red:
      "bg-red-50 text-red-600",

    green:
      "bg-emerald-50 text-emerald-600",
  };


  return (
    <div
      className={`rounded-xl p-4 ${styles[tone]}`}
    >

      <p className="text-xs font-bold opacity-70">
        {
          label
        }
      </p>

      <p className="mt-2 text-lg font-black">
        {
          value
        }
      </p>

    </div>
  );
}


function MiniFinancial({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-bold text-slate-400">
        {
          label
        }
      </p>

      <p className="mt-1 text-lg font-black text-slate-800">
        {
          value
        }
      </p>

    </div>
  );
}


function ReportCard({
  icon: Icon,
  title,
  children,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="mb-5 flex items-center gap-3">

        <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
          <Icon
            size={
              19
            }
          />
        </div>

        <h2 className="font-black text-slate-900">
          {
            title
          }
        </h2>

      </div>

      <div className="space-y-3">
        {
          children
        }
      </div>

    </div>
  );
}


function ReportLine({
  label,
  value,
  warning = false,
  danger = false,
  success = false,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

      <span className="text-sm font-semibold text-slate-500">
        {
          label
        }
      </span>

      <span
        className={`font-black ${
          danger
            ? "text-red-600"
            : warning
              ? "text-orange-600"
              : success
                ? "text-emerald-600"
                : "text-slate-900"
        }`}
      >
        {
          value
        }
      </span>

    </div>
  );
}


function OverviewBox({
  icon: Icon,
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

      <div className="flex items-center justify-between">

        <p className="text-xs font-bold text-slate-400">
          {
            label
          }
        </p>

        <Icon
          size={
            17
          }
          className={
            warning
              ? "text-orange-600"
              : "text-blue-700"
          }
        />

      </div>

      <p
        className={`mt-2 text-xl font-black ${
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


function MiniStatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <div>

        <p className="text-xs font-bold text-slate-400">
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


      <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
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
   DATA HELPERS
===================================== */

function getExpenseAmount(
  expense
) {
  return Number(
    expense.amount ??
      expense.total ??
      0
  );
}


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


function startOfDay(
  date
) {
  const value =
    new Date(
      date
    );

  value.setHours(
    0,
    0,
    0,
    0
  );

  return value;
}


function endOfDay(
  date
) {
  const value =
    new Date(
      date
    );

  value.setHours(
    23,
    59,
    59,
    999
  );

  return value;
}


function getPeriodStart(
  period,
  date
) {
  const value =
    startOfDay(
      date
    );

  if (
    period ===
    "today"
  ) {
    return value;
  }

  if (
    period ===
    "week"
  ) {
    value.setDate(
      value.getDate() -
        6
    );

    return value;
  }

  if (
    period ===
    "month"
  ) {
    value.setDate(
      1
    );

    return value;
  }

  if (
    period ===
    "year"
  ) {
    value.setMonth(
      0,
      1
    );

    return value;
  }

  return new Date(
    0
  );
}


function isWithinRange(
  date,
  start,
  end
) {
  if (!date) {
    return false;
  }

  const value =
    new Date(
      date
    );

  return (
    value >=
      start &&
    value <=
      end
  );
}


function getFileDate() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function formatCompactNumber(
  value
) {
  return Number(
    value || 0
  ).toLocaleString(
    "ar-EG"
  );
}


export default Reports;