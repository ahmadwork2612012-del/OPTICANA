import {
  Search,
  Receipt,
  Store,
  Globe,
  User,
  CreditCard,
  Banknote,
  Eye,
  X,
  Package,
  CalendarDays,
  TrendingUp,
  CircleDollarSign,
  ShoppingBag,
  WalletCards,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Plus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import useSalesStore from "../store/salesStore";
import usePaymentStore from "../store/paymentStore";


const SOURCE_CONFIG = {
  store: {
    label: "المحل",
    icon: Store,
    className:
      "bg-blue-50 text-blue-700",
  },

  online: {
    label: "المتجر الإلكتروني",
    icon: Globe,
    className:
      "bg-violet-50 text-violet-700",
  },
};


const CUSTOMER_CONFIG = {
  registered: {
    label: "عميل مسجل",
    className:
      "bg-blue-50 text-blue-700",
  },

  walk_in: {
    label: "عميل جديد",
    className:
      "bg-orange-50 text-orange-600",
  },

  anonymous: {
    label: "عميل نقدي",
    className:
      "bg-slate-100 text-slate-600",
  },
};


const PAYMENT_STATUS_CONFIG = {
  paid: {
    label: "مدفوعة بالكامل",
    className:
      "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  },

  partial: {
    label: "مدفوعة جزئيًا",
    className:
      "bg-orange-50 text-orange-600",
    icon: Clock3,
  },

  unpaid: {
    label: "غير مدفوعة",
    className:
      "bg-red-50 text-red-600",
    icon: AlertTriangle,
  },
};


function Sales() {
  /* =====================================
     STORES
  ===================================== */

  const sales =
    useSalesStore(
      (state) => state.sales
    );

  const updateSale =
    useSalesStore(
      (state) => state.updateSale
    );

  const addPayment =
    usePaymentStore(
      (state) => state.addPayment
    );

  const fetchSales =
    useSalesStore(
      (state) => state.fetchSales
    );

  useEffect(() => {
    fetchSales().catch((error) => {
      toast.error(error?.message || "تعذر تحميل المبيعات");
    });
  }, [fetchSales]);


  /* =====================================
     UI STATE
  ===================================== */

  const [search, setSearch] =
    useState("");

  const [sourceFilter, setSourceFilter] =
    useState("all");

  const [paymentMethodFilter, setPaymentMethodFilter] =
    useState("all");

  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState("all");

  const [showAllSales, setShowAllSales] =
    useState(false);

  const [selectedSale, setSelectedSale] =
    useState(null);

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("cash");


  /* =====================================
     DATE HELPERS
  ===================================== */

  const now = new Date();

  const last24HoursStart =
    new Date(
      now.getTime() -
        24 * 60 * 60 * 1000
    );


  /* =====================================
     FILTERED SALES
     All filters are applied first.
  ===================================== */

  const filteredSales =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      return [...sales]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
        )
        .filter((sale) => {
          const matchesSearch =
            !value ||
            sale.id
              ?.toLowerCase()
              .includes(value) ||
            sale.invoiceNumber
              ?.toLowerCase()
              .includes(value) ||
            sale.customer?.name
              ?.toLowerCase()
              .includes(value) ||
            sale.customer?.phone
              ?.toLowerCase()
              .includes(value);

          const matchesSource =
            sourceFilter ===
              "all" ||
            sale.source ===
              sourceFilter;

          const matchesMethod =
            paymentMethodFilter ===
              "all" ||
            sale.paymentMethod ===
              paymentMethodFilter;

          const matchesStatus =
            paymentStatusFilter ===
              "all" ||
            getSalePaymentStatus(
              sale
            ) ===
              paymentStatusFilter;

          return (
            matchesSearch &&
            matchesSource &&
            matchesMethod &&
            matchesStatus
          );
        });
    }, [
      sales,
      search,
      sourceFilter,
      paymentMethodFilter,
      paymentStatusFilter,
    ]);


  /* =====================================
     RECENT 24 HOURS
  ===================================== */

  const recentSales =
    useMemo(() => {
      return filteredSales.filter(
        (sale) => {
          if (
            !sale.createdAt
          ) {
            return false;
          }

          const saleDate =
            new Date(
              sale.createdAt
            );

          return (
            saleDate >=
              last24HoursStart &&
            saleDate <= now
          );
        }
      );
    }, [
      filteredSales,
      last24HoursStart,
      now,
    ]);


  /*
    القائمة الأساسية تعتمد على:
    آخر 24 ساعة أو كل السجل.
  */
  const visibleSales =
    showAllSales
      ? filteredSales
      : recentSales;


  /* =====================================
     GROUP ALL SALES BY DATE
  ===================================== */

  const groupedSales =
    useMemo(() => {
      if (!showAllSales) {
        return [];
      }

      const groups = {};

      filteredSales.forEach(
        (sale) => {
          const key =
            getDateKey(
              sale.createdAt
            );

          if (!groups[key]) {
            groups[key] = [];
          }

          groups[key].push(
            sale
          );
        }
      );

      return Object.entries(
        groups
      ).sort(
        ([dateA], [dateB]) =>
          dateB.localeCompare(
            dateA
          )
      );
    }, [
      filteredSales,
      showAllSales,
    ]);


  /* =====================================
     FINANCIAL METRICS
     These remain GLOBAL.
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
    }, [sales]);


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
    }, [sales]);


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
    }, [sales]);


  const unpaidInvoices =
    useMemo(() => {
      return sales.filter(
        (sale) =>
          Number(
            sale.remainingAmount ||
              0
          ) > 0
      ).length;
    }, [sales]);


  const totalCOGS =
    useMemo(() => {
      return sales.reduce(
        (sum, sale) => {
          if (
            sale.costOfGoods !==
            undefined
          ) {
            return (
              sum +
              Number(
                sale.costOfGoods ||
                  0
              )
            );
          }

          return (
            sum +
            getSaleCOGS(
              sale
            )
          );
        },
        0
      );
    }, [sales]);


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
            (
              Number(
                sale.total || 0
              ) -
              getSaleCOGS(
                sale
              )
            )
          );
        },
        0
      );
    }, [sales]);


  const averageSale =
    sales.length > 0
      ? totalRevenue /
        sales.length
      : 0;


  const storeSales =
    sales.filter(
      (sale) =>
        sale.source ===
        "store"
    );


  const onlineSales =
    sales.filter(
      (sale) =>
        sale.source ===
        "online"
    );


  const cashSales =
    sales
      .filter(
        (sale) =>
          sale.paymentMethod ===
          "cash"
      )
      .reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.paidAmount ??
              sale.total ??
              0
          ),
        0
      );


  const cardSales =
    sales
      .filter(
        (sale) =>
          sale.paymentMethod ===
          "card"
      )
      .reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.paidAmount ??
              sale.total ??
              0
          ),
        0
      );


  /* =====================================
     TODAY
  ===================================== */

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);


  const todaySales =
    sales.filter(
      (sale) =>
        sale.createdAt?.slice(
          0,
          10
        ) === today
    );


  const todayRevenue =
    todaySales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.total || 0
        ),
      0
    );


  const todayCollected =
    todaySales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.paidAmount ||
            0
        ),
      0
    );


  const todayReceivables =
    todaySales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.remainingAmount ||
            0
        ),
      0
    );


  /* =====================================
     FORMATTERS
  ===================================== */

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleString(
      "ar-EG",
      {
        dateStyle:
          "medium",
        timeStyle:
          "short",
      }
    );
  };


  /* =====================================
     PAYMENT MODAL
  ===================================== */

  const openPaymentModal =
    (sale) => {
      const remaining =
        Number(
          sale.remainingAmount ||
            0
        );

      if (
        remaining <= 0
      ) {
        toast.success(
          "هذه الفاتورة مدفوعة بالكامل"
        );

        return;
      }

      setSelectedSale(
        sale
      );

      setPaymentAmount(
        ""
      );

      setPaymentMethod(
        sale.paymentMethod ||
          "cash"
      );

      setShowPaymentModal(
        true
      );
    };


  const closePaymentModal =
    () => {
      setShowPaymentModal(
        false
      );

      setPaymentAmount(
        ""
      );

      setSelectedSale(
        null
      );

      setPaymentMethod(
        "cash"
      );
    };


  /* =====================================
     RECORD PAYMENT
  ===================================== */

  const handleRecordPayment = async () => {
    if (!selectedSale) return;

    const amount = Number(paymentAmount);
    const remaining = Number(selectedSale.remainingAmount || 0);

    if (!amount || amount <= 0) {
      toast.error("أدخل مبلغًا صحيحًا");
      return;
    }
    if (amount > remaining) {
      toast.error(`المبلغ أكبر من المتبقي ${remaining.toLocaleString()} ج.م`);
      return;
    }

    try {
      await addPayment({
        orderId: selectedSale.id,
        customerId: selectedSale.customerId || selectedSale.customer?.id || null,
        amount,
        method: paymentMethod,
        type: "sale_payment",
        source: "admin",
        note: amount === remaining ? "تسديد كامل للفاتورة" : "دفعة جزئية",
      });

      const refreshed = await updateSale(selectedSale.id);
      setSelectedSale(refreshed);

      toast.success(
        amount === remaining
          ? "تم تسديد الفاتورة بالكامل"
          : `تم تسجيل دفعة ${amount.toLocaleString()} ج.م`
      );
      closePaymentModal();
    } catch (error) {
      toast.error(error?.message || "تعذر تسجيل الدفعة");
    }
  };


  /* =====================================
     VIEW TOGGLE
  ===================================== */

  const toggleSalesView =
    () => {
      setShowAllSales(
        (current) =>
          !current
      );
    };


  return (
    <div className="space-y-6">

      {/* =================================
          HEADER
      ================================= */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
            <Receipt size={15} />
            العمليات المالية
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            المبيعات
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            متابعة الفواتير والإيرادات والتحصيل والأرصدة
            المستحقة من جميع قنوات البيع.
          </p>

        </div>

      </div>


      {/* =================================
          MAIN KPIs
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          icon={
            CircleDollarSign
          }
          title="إجمالي المبيعات"
          value={`${totalRevenue.toLocaleString()} ج.م`}
          description={`${sales.length} فاتورة`}
          accent="blue"
        />


        <MetricCard
          icon={
            CheckCircle2
          }
          title="إجمالي المحصل"
          value={`${totalCollected.toLocaleString()} ج.م`}
          description="المبالغ المحصلة فعليًا"
          accent="green"
        />


        <MetricCard
          icon={
            WalletCards
          }
          title="المستحقات"
          value={`${totalReceivables.toLocaleString()} ج.م`}
          description={`${unpaidInvoices} فاتورة عليها رصيد`}
          accent="orange"
        />


        <MetricCard
          icon={
            TrendingUp
          }
          title="الربح الإجمالي"
          value={`${totalGrossProfit.toLocaleString()} ج.م`}
          description={
            totalRevenue >
            0
              ? `${(
                  (totalGrossProfit /
                    totalRevenue) *
                  100
                ).toFixed(1)}% هامش`
              : "0% هامش"
          }
          accent="purple"
        />

      </div>


      {/* =================================
          SECONDARY METRICS
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MiniMetric
          icon={
            Store
          }
          label="مبيعات المحل"
          value={`${storeSales.reduce(
            (sum, sale) =>
              sum +
              Number(
                sale.total || 0
              ),
            0
          ).toLocaleString()} ج.م`}
        />


        <MiniMetric
          icon={
            Globe
          }
          label="مبيعات المتجر"
          value={`${onlineSales.reduce(
            (sum, sale) =>
              sum +
              Number(
                sale.total || 0
              ),
            0
          ).toLocaleString()} ج.م`}
        />


        <MiniMetric
          icon={
            Banknote
          }
          label="المحصل كاش"
          value={`${cashSales.toLocaleString()} ج.م`}
        />


        <MiniMetric
          icon={
            CreditCard
          }
          label="المحصل بطاقات"
          value={`${cardSales.toLocaleString()} ج.م`}
        />

      </div>


      {/* =================================
          TODAY
      ================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="grid gap-4 md:grid-cols-3">

          <TodayMetric
            label="مبيعات اليوم"
            value={`${todayRevenue.toLocaleString()} ج.م`}
            icon={
              CalendarDays
            }
          />


          <TodayMetric
            label="المحصل اليوم"
            value={`${todayCollected.toLocaleString()} ج.م`}
            icon={
              CheckCircle2
            }
          />


          <TodayMetric
            label="المستحق اليوم"
            value={`${todayReceivables.toLocaleString()} ج.م`}
            icon={
              WalletCards
            }
            warning={
              todayReceivables >
              0
            }
          />

        </div>


        <p className="mt-4 text-xs text-slate-400">
          {todaySales.length} عملية بيع مسجلة اليوم.
        </p>

      </div>


      {/* =================================
          FILTERS + VIEW
      ================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-slate-200 p-5">

          <div className="flex flex-col gap-3 xl:flex-row">

            {/* Search */}

            <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

              <Search
                size={18}
                className="text-slate-400"
              />

              <input
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event
                      .target
                      .value
                  )
                }
                placeholder="ابحث برقم الفاتورة أو العميل أو الهاتف..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="rounded-lg p-1 text-slate-400 hover:bg-white"
                >
                  <X size={15} />
                </button>
              )}

            </div>


            {/* Source */}

            <select
              value={
                sourceFilter
              }
              onChange={(
                event
              ) =>
                setSourceFilter(
                  event
                    .target
                    .value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-500 xl:w-48"
            >

              <option value="all">
                كل المصادر
              </option>

              <option value="store">
                المحل
              </option>

              <option value="online">
                المتجر الإلكتروني
              </option>

            </select>


            {/* Method */}

            <select
              value={
                paymentMethodFilter
              }
              onChange={(
                event
              ) =>
                setPaymentMethodFilter(
                  event
                    .target
                    .value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-500 xl:w-48"
            >

              <option value="all">
                كل طرق الدفع
              </option>

              <option value="cash">
                كاش
              </option>

              <option value="card">
                بطاقة
              </option>

            </select>


            {/* Status */}

            <select
              value={
                paymentStatusFilter
              }
              onChange={(
                event
              ) =>
                setPaymentStatusFilter(
                  event
                    .target
                    .value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-500 xl:w-52"
            >

              <option value="all">
                كل حالات الدفع
              </option>

              <option value="paid">
                مدفوعة بالكامل
              </option>

              <option value="partial">
                مدفوعة جزئيًا
              </option>

              <option value="unpaid">
                غير مدفوعة
              </option>

            </select>

          </div>


          {/* View control */}

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-black text-slate-800">
                {showAllSales
                  ? "السجل الكامل"
                  : "آخر 24 ساعة"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {showAllSales
                  ? `${visibleSales.length} فاتورة مطابقة`
                  : `${visibleSales.length} فاتورة خلال آخر 24 ساعة`}
              </p>

            </div>


            <button
              type="button"
              onClick={
                toggleSalesView
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800"
            >

              {showAllSales ? (
                <>
                  <ChevronUp
                    size={17}
                  />
                  عرض آخر 24 ساعة
                </>
              ) : (
                <>
                  عرض كل المبيعات
                  <ChevronDown
                    size={17}
                  />
                </>
              )}

            </button>

          </div>

        </div>


        {/* =================================
            TABLE
        ================================= */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1450px] text-right">

            <thead>

              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-400">

                <th className="px-6 py-4">
                  الفاتورة
                </th>

                <th className="px-6 py-4">
                  المصدر
                </th>

                <th className="px-6 py-4">
                  العميل
                </th>

                <th className="px-6 py-4">
                  التاريخ
                </th>

                <th className="px-6 py-4">
                  طريقة الدفع
                </th>

                <th className="px-6 py-4">
                  الإجمالي
                </th>

                <th className="px-6 py-4">
                  المدفوع
                </th>

                <th className="px-6 py-4">
                  المتبقي
                </th>

                <th className="px-6 py-4">
                  حالة الدفع
                </th>

                <th className="px-6 py-4">
                  الربح
                </th>

                <th className="px-6 py-4">
                  التفاصيل
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {!showAllSales &&
                visibleSales.map(
                  (
                    sale
                  ) => (
                    <SaleRow
                      key={
                        sale.id
                      }
                      sale={
                        sale
                      }
                      onOpen={() =>
                        setSelectedSale(
                          sale
                        )
                      }
                      onPayment={() =>
                        openPaymentModal(
                          sale
                        )
                      }
                      formatDate={
                        formatDate
                      }
                    />
                  )
                )}


              {showAllSales &&
                groupedSales.map(
                  ([
                    dateKey,
                    dateSales,
                  ]) => (
                    <SalesDateGroup
                      key={
                        dateKey
                      }
                      dateKey={
                        dateKey
                      }
                      sales={
                        dateSales
                      }
                      onOpen={
                        (sale) =>
                          setSelectedSale(
                            sale
                          )
                      }
                      onPayment={
                        openPaymentModal
                      }
                      formatDate={
                        formatDate
                      }
                    />
                  )
                )}

            </tbody>

          </table>


          {visibleSales.length ===
            0 && (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">

              <Receipt
                size={42}
                className="text-slate-300"
              />

              <p className="mt-4 font-bold text-slate-700">
                لا توجد مبيعات
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {showAllSales
                  ? "لا توجد نتائج مطابقة للفلاتر الحالية."
                  : "لا توجد مبيعات خلال آخر 24 ساعة مطابقة للفلاتر الحالية."}
              </p>

            </div>
          )}

        </div>

      </div>


      {/* =================================
          SALE DETAILS
      ================================= */}

      {selectedSale &&
        !showPaymentModal && (
          <SaleDetails
            sale={
              selectedSale
            }
            onClose={() =>
              setSelectedSale(
                null
              )
            }
            onPayment={() =>
              openPaymentModal(
                selectedSale
              )
            }
            formatDate={
              formatDate
            }
          />
        )}


      {/* =================================
          PAYMENT MODAL
      ================================= */}

      {showPaymentModal &&
        selectedSale && (
          <PaymentModal
            sale={
              selectedSale
            }
            amount={
              paymentAmount
            }
            setAmount={
              setPaymentAmount
            }
            method={
              paymentMethod
            }
            setMethod={
              setPaymentMethod
            }
            onClose={
              closePaymentModal
            }
            onSubmit={
              handleRecordPayment
            }
          />
        )}

    </div>
  );
}


/* =====================================
   DATE GROUP
===================================== */

function SalesDateGroup({
  dateKey,
  sales,
  onOpen,
  onPayment,
  formatDate,
}) {
  const dateLabel =
    formatGroupDate(
      dateKey
    );


  return (
    <>
      <tr>

        <td
          colSpan={11}
          className="border-y border-slate-200 bg-slate-100 px-6 py-3"
        >

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <CalendarDays
                size={15}
                className="text-blue-700"
              />

              <span className="text-xs font-black text-slate-700">
                {
                  dateLabel
                }
              </span>

            </div>


            <span className="text-[11px] font-bold text-slate-400">
              {
                sales.length
              }{" "}
              {sales.length ===
              1
                ? "فاتورة"
                : "فواتير"}
            </span>

          </div>

        </td>

      </tr>


      {sales.map(
        (sale) => (
          <SaleRow
            key={
              sale.id
            }
            sale={
              sale
            }
            onOpen={() =>
              onOpen(
                sale
              )
            }
            onPayment={() =>
              onPayment(
                sale
              )
            }
            formatDate={
              formatDate
            }
          />
        )
      )}
    </>
  );
}


/* =====================================
   SALE ROW
===================================== */

function SaleRow({
  sale,
  onOpen,
  onPayment,
  formatDate,
}) {
  const source =
    SOURCE_CONFIG[
      sale.source
    ] ||
    SOURCE_CONFIG.store;

  const SourceIcon =
    source.icon;


  const customerType =
    CUSTOMER_CONFIG[
      sale.customerType
    ] ||
    CUSTOMER_CONFIG.anonymous;


  const paymentStatus =
    PAYMENT_STATUS_CONFIG[
      getSalePaymentStatus(
        sale
      )
    ] ||
    PAYMENT_STATUS_CONFIG.unpaid;


  const StatusIcon =
    paymentStatus.icon;


  const profit =
    sale.grossProfit !==
    undefined
      ? Number(
          sale.grossProfit ||
            0
        )
      : Number(
          sale.total || 0
        ) -
        getSaleCOGS(
          sale
        );


  const remaining =
    Number(
      sale.remainingAmount ||
        0
    );


  return (
    <tr className="transition hover:bg-slate-50">

      {/* Invoice */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Receipt size={18} />
          </div>

          <div>

            <p className="font-black text-slate-800">
              {
                sale.invoiceNumber ||
                sale.id
              }
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {sale.items?.length ||
                0}{" "}
              منتجات
            </p>

          </div>

        </div>

      </td>


      {/* Source */}

      <td className="px-6 py-5">

        <span
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-black ${source.className}`}
        >

          <SourceIcon
            size={14}
          />

          {
            source.label
          }

        </span>

      </td>


      {/* Customer */}

      <td className="px-6 py-5">

        <div className="flex items-start gap-2">

          <User
            size={16}
            className="mt-0.5 text-slate-400"
          />

          <div>

            <p className="font-semibold text-slate-700">
              {
                sale.customer
                  ?.name ||
                "عميل نقدي"
              }
            </p>

            <span
              className={`mt-1 inline-flex rounded-md px-2 py-1 text-[10px] font-black ${customerType.className}`}
            >
              {
                customerType.label
              }
            </span>

          </div>

        </div>

      </td>


      {/* Date */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-2 text-sm text-slate-500">

          <CalendarDays
            size={15}
          />

          {formatDate(
            sale.createdAt
          )}

        </div>

      </td>


      {/* Method */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">

          {sale.paymentMethod ===
          "card" ? (
            <CreditCard
              size={16}
            />
          ) : (
            <Banknote
              size={16}
            />
          )}

          {sale.paymentMethod ===
          "card"
            ? "بطاقة"
            : "كاش"}

        </div>

      </td>


      {/* Total */}

      <td className="px-6 py-5">

        <span className="font-black text-slate-900">
          {Number(
            sale.total || 0
          ).toLocaleString()}{" "}
          ج.م
        </span>

      </td>


      {/* Paid */}

      <td className="px-6 py-5">

        <span className="font-black text-emerald-600">
          {Number(
            sale.paidAmount ||
              0
          ).toLocaleString()}{" "}
          ج.م
        </span>

      </td>


      {/* Remaining */}

      <td className="px-6 py-5">

        {remaining > 0 ? (
          <span className="font-black text-orange-600">
            {remaining.toLocaleString()}{" "}
            ج.م
          </span>
        ) : (
          <span className="text-sm font-bold text-slate-400">
            —
          </span>
        )}

      </td>


      {/* Status */}

      <td className="px-6 py-5">

        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black ${paymentStatus.className}`}
        >

          <StatusIcon
            size={14}
          />

          {
            paymentStatus.label
          }

        </span>

      </td>


      {/* Profit */}

      <td className="px-6 py-5">

        <span
          className={`font-black ${
            profit >= 0
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {profit.toLocaleString()}{" "}
          ج.م
        </span>

      </td>


      {/* Details */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-1">

          <button
            type="button"
            onClick={
              onOpen
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
            title="عرض الفاتورة"
          >
            <Eye
              size={18}
            />
          </button>


          {remaining >
            0 && (
            <button
              type="button"
              onClick={
                onPayment
              }
              className="rounded-lg p-2 text-orange-500 transition hover:bg-orange-50 hover:text-orange-600"
              title="تسجيل دفعة"
            >
              <Plus
                size={18}
              />
            </button>
          )}

        </div>

      </td>

    </tr>
  );
}


/* =====================================
   SALE DETAILS
===================================== */

function SaleDetails({
  sale,
  onClose,
  onPayment,
  formatDate,
}) {
  const costOfGoods =
    sale.costOfGoods !==
    undefined
      ? Number(
          sale.costOfGoods ||
            0
        )
      : getSaleCOGS(
          sale
        );


  const grossProfit =
    sale.grossProfit !==
    undefined
      ? Number(
          sale.grossProfit ||
            0
        )
      : Number(
          sale.total || 0
        ) -
        costOfGoods;


  const profitMargin =
    Number(
      sale.total || 0
    ) > 0
      ? (
          (grossProfit /
            Number(
              sale.total || 0
            )) *
          100
        ).toFixed(1)
      : "0.0";


  const remaining =
    Number(
      sale.remainingAmount ||
        0
    );


  const paidAmount =
    Number(
      sale.paidAmount ||
        0
    );


  const paymentStatus =
    PAYMENT_STATUS_CONFIG[
      getSalePaymentStatus(
        sale
      )
    ] ||
    PAYMENT_STATUS_CONFIG.unpaid;


  const StatusIcon =
    paymentStatus.icon;


  const customerType =
    CUSTOMER_CONFIG[
      sale.customerType
    ] ||
    CUSTOMER_CONFIG.anonymous;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div>

            <p className="text-xs font-bold text-blue-600">
              تفاصيل الفاتورة
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {
                sale.invoiceNumber ||
                sale.id
              }
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {formatDate(
                sale.createdAt
              )}
            </p>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>


        <div className="overflow-y-auto p-6">

          {/* Customer + source */}

          <div className="grid gap-3 sm:grid-cols-2">

            <InfoCard
              label="العميل"
              value={
                sale.customer
                  ?.name ||
                "عميل نقدي"
              }
              secondary={
                sale.customer
                  ?.phone ||
                customerType.label
              }
            />

            <InfoCard
              label="المصدر"
              value={
                sale.source ===
                "online"
                  ? "المتجر الإلكتروني"
                  : "المحل"
              }
              secondary={
                sale.paymentMethod ===
                "card"
                  ? "الدفع الأساسي: بطاقة"
                  : "الدفع الأساسي: كاش"
              }
            />

          </div>


          {/* Payment status */}

          <div className="mt-4 rounded-2xl border border-slate-200 p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${paymentStatus.className}`}
                >
                  <StatusIcon
                    size={20}
                  />
                </div>

                <div>

                  <p className="text-xs font-bold text-slate-400">
                    حالة الدفع
                  </p>

                  <p
                    className={`mt-1 font-black ${
                      getSalePaymentStatus(
                        sale
                      ) ===
                      "paid"
                        ? "text-emerald-600"
                        : getSalePaymentStatus(
                              sale
                            ) ===
                            "partial"
                          ? "text-orange-600"
                          : "text-red-600"
                    }`}
                  >
                    {
                      paymentStatus.label
                    }
                  </p>

                </div>

              </div>


              {remaining >
                0 && (
                <button
                  type="button"
                  onClick={
                    onPayment
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
                >
                  <Plus
                    size={17}
                  />
                  تسجيل دفعة
                </button>
              )}

            </div>


            <div className="mt-5 grid gap-3 sm:grid-cols-3">

              <FinancialBox
                label="الإجمالي"
                value={`${Number(
                  sale.total ||
                    0
                ).toLocaleString()} ج.م`}
                accent
              />

              <FinancialBox
                label="المدفوع"
                value={`${paidAmount.toLocaleString()} ج.م`}
                positive
              />

              <FinancialBox
                label="المتبقي"
                value={`${remaining.toLocaleString()} ج.م`}
                warning={
                  remaining >
                  0
                }
              />

            </div>

          </div>


          {/* Items */}

          <div className="mt-6">

            <div className="mb-4 flex items-center justify-between">

              <h3 className="font-black text-slate-900">
                المنتجات
              </h3>

              <span className="text-xs text-slate-400">
                {getTotalQuantity(
                  sale
                )}{" "}
                قطعة
              </span>

            </div>


            <div className="space-y-3">

              {sale.items
                ?.length ? (
                sale.items.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item.productId || item.sku || item.name}-${index}`}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400">
                          <Package
                            size={
                              18
                            }
                          />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate font-bold text-slate-800">
                            {
                              item.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              item.quantity
                            }{" "}
                            ×{" "}
                            {Number(
                              item.price ||
                                0
                            ).toLocaleString()}{" "}
                            ج.م
                          </p>

                        </div>

                      </div>


                      <span className="shrink-0 font-black text-slate-800">
                        {Number(
                          item.total ||
                            Number(
                              item.price ||
                                0
                            ) *
                              Number(
                                item.quantity ||
                                  0
                              )
                        ).toLocaleString()}{" "}
                        ج.م
                      </span>

                    </div>
                  )
                )
              ) : (
                <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-400">
                  لا توجد منتجات.
                </div>
              )}

            </div>

          </div>


          {/* Financial */}

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">

            <h3 className="font-black text-slate-900">
              الملخص المالي
            </h3>


            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

              <FinancialBox
                label="المجموع"
                value={`${Number(
                  sale.subtotal ||
                    0
                ).toLocaleString()} ج.م`}
              />

              <FinancialBox
                label="الخصم"
                value={`- ${Number(
                  sale.discount ||
                    0
                ).toLocaleString()} ج.م`}
                negative
              />

              <FinancialBox
                label="تكلفة البضاعة"
                value={`${costOfGoods.toLocaleString()} ج.م`}
                negative
              />

              <FinancialBox
                label="الربح"
                value={`${grossProfit.toLocaleString()} ج.م`}
                positive
              />

            </div>


            <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 p-4">

              <div>

                <p className="text-xs font-bold text-emerald-600">
                  هامش الربح
                </p>

                <p className="mt-1 text-2xl font-black text-emerald-700">
                  {
                    profitMargin
                  }%
                </p>

              </div>


              <TrendingUp
                size={22}
                className="text-emerald-600"
              />

            </div>

          </div>


          {/* Meta */}

          <div className="mt-4 flex flex-wrap gap-2">

            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              {
                customerType.label
              }
            </span>

            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              {sale.source ===
              "online"
                ? "المتجر الإلكتروني"
                : "المحل"}
            </span>

          </div>

        </div>


        <div className="border-t border-slate-200 bg-slate-50 p-5">

          <button
            type="button"
            onClick={
              onClose
            }
            className="w-full rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white hover:bg-blue-800"
          >
            إغلاق
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   PAYMENT MODAL
===================================== */

function PaymentModal({
  sale,
  amount,
  setAmount,
  method,
  setMethod,
  onClose,
  onSubmit,
}) {
  const remaining =
    Number(
      sale.remainingAmount ||
        0
    );

  const numericAmount =
    Math.min(
      Math.max(
        Number(
          amount
        ) || 0,
        0
      ),
      remaining
    );

  const newRemaining =
    Math.max(
      remaining -
        numericAmount,
      0
    );


  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div>

            <p className="text-xs font-bold text-orange-600">
              تحصيل دفعة
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-900">
              {
                sale.invoiceNumber ||
                sale.id
              }
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              العميل:{" "}
              {
                sale.customer
                  ?.name ||
                "غير محدد"
              }
            </p>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>


        <div className="space-y-5 p-6">

          <div className="grid grid-cols-2 gap-3">

            <FinancialBox
              label="المتبقي الحالي"
              value={`${remaining.toLocaleString()} ج.م`}
              warning
            />

            <FinancialBox
              label="بعد الدفعة"
              value={`${newRemaining.toLocaleString()} ج.م`}
              positive={
                numericAmount >
                  0 &&
                newRemaining ===
                  0
              }
            />

          </div>


          <div>

            <div className="mb-2 flex items-center justify-between">

              <label className="text-sm font-bold text-slate-700">
                مبلغ الدفعة
              </label>

              <button
                type="button"
                onClick={() =>
                  setAmount(
                    String(
                      remaining
                    )
                  )
                }
                className="text-xs font-black text-orange-600"
              >
                تحصيل كامل
              </button>

            </div>


            <input
              type="number"
              min="0"
              max={remaining}
              value={
                amount
              }
              onChange={(
                event
              ) =>
                setAmount(
                  event.target
                    .value
                )
              }
              placeholder="أدخل المبلغ"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
              autoFocus
            />

          </div>


          <div>

            <p className="mb-2 text-sm font-bold text-slate-700">
              طريقة الدفع
            </p>


            <div className="grid grid-cols-2 gap-2">

              <button
                type="button"
                onClick={() =>
                  setMethod(
                    "cash"
                  )
                }
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold ${
                  method ===
                  "cash"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                <Banknote
                  size={17}
                />
                كاش
              </button>


              <button
                type="button"
                onClick={() =>
                  setMethod(
                    "card"
                  )
                }
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold ${
                  method ===
                  "card"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                <CreditCard
                  size={17}
                />
                بطاقة
              </button>

            </div>

          </div>


          <div className="rounded-xl bg-slate-50 p-4">

            <div className="flex items-center justify-between text-sm">

              <span className="text-slate-500">
                حالة الفاتورة بعد الدفعة
              </span>

              <span
                className={`font-black ${
                  newRemaining ===
                  0
                    ? "text-emerald-600"
                    : "text-orange-600"
                }`}
              >
                {newRemaining ===
                0
                  ? "مدفوعة بالكامل"
                  : "متبقي رصيد"}
              </span>

            </div>

          </div>

        </div>


        <div className="flex gap-3 border-t border-slate-200 bg-slate-50 p-5">

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
          >
            إلغاء
          </button>


          <button
            type="button"
            onClick={
              onSubmit
            }
            disabled={
              numericAmount <=
              0
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-black text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <WalletCards
              size={17}
            />
            تسجيل الدفعة
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   UI HELPERS
===================================== */

function MetricCard({
  icon: Icon,
  title,
  value,
  description,
  accent = "blue",
}) {
  const colors = {
    blue:
      "bg-blue-50 text-blue-700",

    green:
      "bg-emerald-50 text-emerald-600",

    orange:
      "bg-orange-50 text-orange-600",

    purple:
      "bg-violet-50 text-violet-600",

    red:
      "bg-red-50 text-red-600",
  };


  return (
    <div className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

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

        <p className="mt-1 text-[11px] text-slate-400">
          {
            description
          }
        </p>

      </div>


      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[accent]}`}
      >
        <Icon
          size={
            21
          }
        />
      </div>

    </div>
  );
}


function MiniMetric({
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

        <p className="mt-1 text-lg font-black text-slate-900">
          {
            value
          }
        </p>

      </div>


      <div className="rounded-xl bg-slate-50 p-2.5 text-slate-500">
        <Icon
          size={
            18
          }
        />
      </div>

    </div>
  );
}


function TodayMetric({
  icon: Icon,
  label,
  value,
  warning = false,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex items-center justify-between">

        <p className="text-xs font-bold text-slate-400">
          {
            label
          }
        </p>


        <div
          className={`rounded-lg p-2 ${
            warning
              ? "bg-orange-50 text-orange-600"
              : "bg-white text-blue-700"
          }`}
        >
          <Icon
            size={
              16
            }
          />
        </div>

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


function InfoCard({
  label,
  value,
  secondary,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-bold text-slate-400">
        {
          label
        }
      </p>

      <p className="mt-1 font-black text-slate-800">
        {
          value
        }
      </p>

      {secondary && (
        <p className="mt-1 text-xs text-slate-400">
          {
            secondary
          }
        </p>
      )}

    </div>
  );
}


function FinancialBox({
  label,
  value,
  accent = false,
  negative = false,
  positive = false,
  warning = false,
}) {
  let background =
    "bg-slate-50";

  let text =
    "text-slate-800";

  let labelColor =
    "text-slate-400";


  if (accent) {
    background =
      "bg-blue-50";
    text =
      "text-blue-700";
    labelColor =
      "text-blue-500";
  }


  if (negative) {
    text =
      "text-red-600";
  }


  if (positive) {
    background =
      "bg-emerald-50";
    text =
      "text-emerald-600";
    labelColor =
      "text-emerald-500";
  }


  if (warning) {
    background =
      "bg-orange-50";
    text =
      "text-orange-600";
    labelColor =
      "text-orange-500";
  }


  return (
    <div
      className={`rounded-xl p-4 ${background}`}
    >

      <p
        className={`text-xs font-bold ${labelColor}`}
      >
        {
          label
        }
      </p>

      <p
        className={`mt-2 font-black ${text}`}
      >
        {
          value
        }
      </p>

    </div>
  );
}


/* =====================================
   DATA HELPERS
===================================== */

function getSaleCOGS(
  sale
) {
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


function getTotalQuantity(
  sale
) {
  return (
    sale.items?.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.quantity ||
            0
        ),
      0
    ) || 0
  );
}


function getSalePaymentStatus(
  sale
) {
  const remaining =
    Number(
      sale.remainingAmount ||
        0
    );

  const paid =
    Number(
      sale.paidAmount ||
        0
    );

  const total =
    Number(
      sale.total || 0
    );


  if (
    total <= 0 ||
    remaining <= 0
  ) {
    return "paid";
  }


  if (paid > 0) {
    return "partial";
  }


  return "unpaid";
}


/* =====================================
   DATE HELPERS
===================================== */

function getDateKey(
  date
) {
  if (!date) {
    return "unknown";
  }

  const value =
    new Date(date);

  const year =
    value.getFullYear();

  const month =
    String(
      value.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      value.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function formatGroupDate(
  dateKey
) {
  if (
    !dateKey ||
    dateKey ===
      "unknown"
  ) {
    return "تاريخ غير معروف";
  }

  const [
    year,
    month,
    day,
  ] =
    dateKey.split(
      "-"
    );

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString(
    "ar-EG",
    {
      weekday:
        "long",
      year:
        "numeric",
      month:
        "long",
      day:
        "numeric",
    }
  );
}


export default Sales;