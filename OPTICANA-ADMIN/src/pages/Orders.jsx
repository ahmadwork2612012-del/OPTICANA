import {
  Search,
  ClipboardList,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  X,
  User,
  Phone,
  MapPin,
  CreditCard,
  Banknote,
  Package,
  Trash2,
  CalendarDays,
  WalletCards,
  AlertTriangle,
  CircleDollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import useOrderStore from "../store/orderStore";


/* =====================================
   STATUS
===================================== */

const STATUS_CONFIG = {
  pending: {
    label: "قيد المراجعة",
    className:
      "bg-orange-50 text-orange-600",
    icon: Clock3,
  },

  confirmed: {
    label: "مؤكد",
    className:
      "bg-blue-50 text-blue-700",
    icon: CheckCircle2,
  },

  processing: {
    label: "قيد التجهيز",
    className:
      "bg-violet-50 text-violet-700",
    icon: Package,
  },

  shipped: {
    label: "تم الشحن",
    className:
      "bg-cyan-50 text-cyan-700",
    icon: Truck,
  },

  completed: {
    label: "مكتمل",
    className:
      "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  },

  cancelled: {
    label: "ملغي",
    className:
      "bg-red-50 text-red-600",
    icon: XCircle,
  },
};


const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];


/* =====================================
   PAYMENT
===================================== */

const PAYMENT_STATUS_CONFIG = {
  paid: {
    label: "مدفوع بالكامل",
    className:
      "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  },

  partial: {
    label: "مدفوع جزئيًا",
    className:
      "bg-orange-50 text-orange-600",
    icon: Clock3,
  },

  unpaid: {
    label: "غير مدفوع",
    className:
      "bg-red-50 text-red-600",
    icon: AlertTriangle,
  },

  unknown: {
    label: "غير محدد",
    className:
      "bg-slate-100 text-slate-500",
    icon: WalletCards,
  },
};


/* =====================================
   PAGE
===================================== */

function Orders() {
  const orders =
    useOrderStore(
      (state) => state.orders
    );

  const fetchOrders =
    useOrderStore(
      (state) => state.fetchOrders
    );

  const isLoading =
    useOrderStore(
      (state) => state.isLoading
    );

  const updateOrderStatus =
    useOrderStore(
      (state) =>
        state.updateOrderStatus
    );

  useEffect(() => {
    fetchOrders().catch((error) => {
      toast.error(
        error?.message ||
          "تفاصيل الطلب"
      );
    });
  }, [fetchOrders]);


  /* =====================================
     UI
  ===================================== */

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [paymentFilter, setPaymentFilter] =
    useState("all");

  const [showAllOrders, setShowAllOrders] =
    useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState(null);
/* =====================================
     DATE
  ===================================== */

  const now =
    new Date();

  const last24HoursStart =
    new Date(
      now.getTime() -
        24 *
          60 *
          60 *
          1000
    );


  /* =====================================
     FILTER
  ===================================== */

  const filteredOrders =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      return [
        ...orders,
      ]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
        )
        .filter(
          (order) => {
            const matchesSearch =
              !value ||
              order.id
                ?.toLowerCase()
                .includes(
                  value
                ) ||
              order.customer?.name
                ?.toLowerCase()
                .includes(
                  value
                ) ||
              order.customer?.phone
                ?.toLowerCase()
                .includes(
                  value
                );

            const matchesStatus =
              statusFilter ===
                "all" ||
              order.status ===
                statusFilter;

            const matchesPayment =
              paymentFilter ===
                "all" ||
              getOrderPaymentStatus(
                order
              ) ===
                paymentFilter;

            return (
              matchesSearch &&
              matchesStatus &&
              matchesPayment
            );
          }
        );
    }, [
      orders,
      search,
      statusFilter,
      paymentFilter,
    ]);


  /* =====================================
     LAST 24 HOURS
  ===================================== */

  const recentOrders =
    useMemo(() => {
      return filteredOrders.filter(
        (order) => {
          if (
            !order.createdAt
          ) {
            return false;
          }

          const date =
            new Date(
              order.createdAt
            );

          return (
            date >=
              last24HoursStart &&
            date <= now
          );
        }
      );
    }, [
      filteredOrders,
      last24HoursStart,
      now,
    ]);


  const visibleOrders =
    showAllOrders
      ? filteredOrders
      : recentOrders;


  /* =====================================
     GROUP FULL HISTORY
  ===================================== */

  const groupedOrders =
    useMemo(() => {
      if (
        !showAllOrders
      ) {
        return [];
      }

      const groups =
        {};

      filteredOrders.forEach(
        (
          order
        ) => {
          const key =
            getDateKey(
              order.createdAt
            );

          if (
            !groups[key]
          ) {
            groups[key] =
              [];
          }

          groups[key].push(
            order
          );
        }
      );

      return Object.entries(
        groups
      ).sort(
        (
          [dateA],
          [dateB]
        ) =>
          dateB.localeCompare(
            dateA
          )
      );
    }, [
      filteredOrders,
      showAllOrders,
    ]);


  /* =====================================
     SUMMARY
  ===================================== */

  const totalOrders =
    orders.length;


  const pendingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "pending"
    ).length;


  const processingOrders =
    orders.filter(
      (order) =>
        order.status ===
          "confirmed" ||
        order.status ===
          "processing"
    ).length;


  const completedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "completed"
    ).length;


  const cancelledOrders =
    orders.filter(
      (order) =>
        order.status ===
        "cancelled"
    ).length;


  const totalValue =
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


  const totalPaid =
    orders.reduce(
      (
        sum,
        order
      ) =>
        sum +
        Number(
          order.paidAmount || 0
        ),
      0
    );


  const totalRemaining =
    orders.reduce(
      (
        sum,
        order
      ) =>
        sum +
        Number(
          order.remainingAmount ||
            0
        ),
      0
    );


  /* =====================================
     STATUS CHANGE
  ===================================== */

  const changeStatus =
    (
      order,
      status
    ) => {
      if (!status) {
        return;
      }

      updateOrderStatus(
        order.id,
        status
      );

      setSelectedOrder(
        (current) =>
          current?.id ===
          order.id
            ? {
                ...current,
                status,
              }
            : current
      );

      toast.success(
        `تم تحديث حالة الطلب إلى ${getStatusLabel(
          status
        )}`
      );
    };

  /* =====================================
     VIEW
  ===================================== */

  const toggleOrdersView =
    () => {
      setShowAllOrders(
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
            <ClipboardList
              size={15}
            />

            إدارة الطلبات
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            الطلبات
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            متابعة طلبات متجر OPTICANA من لحظة وصولها
            حتى التجهيز والشحن والإكمال أو الإلغاء.
          </p>

        </div>

      </div>


      {/* =================================
          SUMMARY
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <SummaryCard
          icon={
            ClipboardList
          }
          title="إجمالي الطلبات"
          value={
            totalOrders
          }
          accent="blue"
        />

        <SummaryCard
          icon={
            Clock3
          }
          title="قيد المراجعة"
          value={
            pendingOrders
          }
          accent="orange"
        />

        <SummaryCard
          icon={
            Package
          }
          title="قيد المعالجة"
          value={
            processingOrders
          }
          accent="purple"
        />

        <SummaryCard
          icon={
            CheckCircle2
          }
          title="مكتملة"
          value={
            completedOrders
          }
          accent="green"
        />

        <SummaryCard
          icon={
            XCircle
          }
          title="ملغاة"
          value={
            cancelledOrders
          }
          accent="red"
        />

      </div>


      {/* =================================
          VALUE
      ================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="grid gap-4 md:grid-cols-3">

          <SummaryValue
            icon={
              CircleDollarSign
            }
            label="قيمة الطلبات"
            value={`${totalValue.toLocaleString()} ج.م`}
          />

          <SummaryValue
            icon={
              CheckCircle2
            }
            label="المدفوع"
            value={`${totalPaid.toLocaleString()} ج.م`}
            positive
          />

          <SummaryValue
            icon={
              WalletCards
            }
            label="المتبقي"
            value={`${totalRemaining.toLocaleString()} ج.م`}
            warning={
              totalRemaining >
              0
            }
          />

        </div>

      </div>


      {/* =================================
          FILTERS
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
                    event.target
                      .value
                  )
                }
                placeholder="ابحث برقم الطلب أو اسم العميل أو الهاتف..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch(
                      ""
                    )
                  }
                  className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                >
                  <X
                    size={15}
                  />
                </button>
              )}

            </div>


            {/* Status */}

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-500 xl:w-48"
            >

              <option value="all">
                كل حالات الطلب
              </option>

              {STATUS_OPTIONS.map(
                (
                  status
                ) => (
                  <option
                    key={
                      status
                    }
                    value={
                      status
                    }
                  >
                    {getStatusLabel(
                      status
                    )}
                  </option>
                )
              )}

            </select>


            {/* Payment */}

            <select
              value={
                paymentFilter
              }
              onChange={(
                event
              ) =>
                setPaymentFilter(
                  event.target
                    .value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-500 xl:w-48"
            >

              <option value="all">
                كل حالات الدفع
              </option>

              <option value="paid">
                مدفوع بالكامل
              </option>

              <option value="partial">
                مدفوع جزئيًا
              </option>

              <option value="unpaid">
                غير مدفوع
              </option>

              <option value="unknown">
                غير محدد
              </option>

            </select>

          </div>


          {/* View */}

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-black text-slate-800">
                {showAllOrders
                  ? "السجل الكامل"
                  : "آخر 24 ساعة"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {showAllOrders
                  ? `${visibleOrders.length} طلب مطابق`
                  : `${visibleOrders.length} طلب خلال آخر 24 ساعة`}
              </p>

            </div>


            <button
              type="button"
              onClick={
                toggleOrdersView
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800"
            >

              {showAllOrders ? (
                <>
                  <ChevronUp
                    size={
                      17
                    }
                  />

                  عرض آخر 24 ساعة
                </>
              ) : (
                <>
                  عرض كل الطلبات

                  <ChevronDown
                    size={
                      17
                    }
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

          <table className="w-full min-w-[1350px] text-right">

            <thead>

              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-400">

                <th className="px-6 py-4">
                  الطلب
                </th>

                <th className="px-6 py-4">
                  العميل
                </th>

                <th className="px-6 py-4">
                  التاريخ
                </th>

                <th className="px-6 py-4">
                  الدفع
                </th>

                <th className="px-6 py-4">
                  الإجمالي
                </th>

                <th className="px-6 py-4">
                  المتبقي
                </th>

                <th className="px-6 py-4">
                  حالة الطلب
                </th>

                <th className="px-6 py-4">
                  حالة الدفع
                </th>

                <th className="px-6 py-4">
                  التفاصيل
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {!showAllOrders &&
                visibleOrders.map(
                  (
                    order
                  ) => (
                    <OrderRow
                      key={
                        order.id
                      }
                      order={
                        order
                      }
                      onOpen={() =>
                        setSelectedOrder(
                          order
                        )
                      }
                      onStatusChange={
                        changeStatus
                      }
                    />
                  )
                )}


              {showAllOrders &&
                groupedOrders.map(
                  ([
                    dateKey,
                    dateOrders,
                  ]) => (
                    <OrderDateGroup
                      key={
                        dateKey
                      }
                      dateKey={
                        dateKey
                      }
                      orders={
                        dateOrders
                      }
                      onOpen={
                        (
                          order
                        ) =>
                          setSelectedOrder(
                            order
                          )
                      }
                      onStatusChange={
                        changeStatus
                      }
                    />
                  )
                )}

            </tbody>

          </table>


          {visibleOrders.length ===
            0 && (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">

              <ClipboardList
                size={42}
                className="text-slate-300"
              />

              <p className="mt-4 font-bold text-slate-700">
                لا توجد طلبات
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {showAllOrders
                  ? "لا توجد نتائج مطابقة للفلاتر الحالية."
                  : "لا توجد طلبات خلال آخر 24 ساعة مطابقة للفلاتر الحالية."}
              </p>

            </div>
          )}

        </div>

      </div>


      {/* =================================
          DETAILS
      ================================= */}

      {selectedOrder && (
        <OrderDetails
          order={
            selectedOrder
          }
          onClose={() =>
            setSelectedOrder(
              null
            )
          }
          onStatusChange={
            changeStatus
          }
        />
      )}


      {/* =================================
          DELETE
      ================================= */}

    </div>
  );
}


/* =====================================
   DATE GROUP
===================================== */

function OrderDateGroup({
  dateKey,
  orders,
  onOpen,
  onStatusChange,
}) {
  return (
    <>
      <tr>

        <td
          colSpan={9}
          className="border-y border-slate-200 bg-slate-100 px-6 py-3"
        >

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <CalendarDays
                size={
                  15
                }
                className="text-blue-700"
              />

              <span className="text-xs font-black text-slate-700">
                {
                  formatGroupDate(
                    dateKey
                  )
                }
              </span>

            </div>

            <span className="text-[11px] font-bold text-slate-400">
              {
                orders.length
              }{" "}
              {orders.length ===
              1
                ? "طلب"
                : "طلبات"}
            </span>

          </div>

        </td>

      </tr>


      {orders.map(
        (
          order
        ) => (
          <OrderRow
            key={
              order.id
            }
            order={
              order
            }
            onOpen={() =>
              onOpen(
                order
              )
            }
            onStatusChange={
              onStatusChange
            }
          />
        )
      )}

    </>
  );
}


/* =====================================
   ORDER ROW
===================================== */

function OrderRow({
  order,
  onOpen,
  onStatusChange,
}) {
  const status =
    STATUS_CONFIG[
      order.status
    ] ||
    STATUS_CONFIG.pending;

  const StatusIcon =
    status.icon;


  const paymentStatus =
    PAYMENT_STATUS_CONFIG[
      getOrderPaymentStatus(
        order
      )
    ] ||
    PAYMENT_STATUS_CONFIG.unknown;

  const PaymentIcon =
    paymentStatus.icon;


  const remaining =
    Number(
      order.remainingAmount ||
        0
    );


  return (
    <tr className="transition hover:bg-slate-50">

      {/* Order */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ClipboardList
              size={
                18
              }
            />
          </div>

          <div>

            <p className="font-black text-slate-800">
              {
                order.id
              }
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {
                order.items
                  ?.length ||
                0
              }{" "}
              منتجات
            </p>

          </div>

        </div>

      </td>


      {/* Customer */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-2 text-sm">

          <User
            size={
              15
            }
            className="text-slate-400"
          />

          <div>

            <p className="font-bold text-slate-700">
              {
                order.customer
                  ?.name ||
                "عميل نقدي"
              }
            </p>

            {order.customer
              ?.phone && (
              <p className="mt-1 text-xs text-slate-400">
                {
                  order.customer
                    .phone
                }
              </p>
            )}

          </div>

        </div>

      </td>


      {/* Date */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-2 text-sm text-slate-500">

          <CalendarDays
            size={
              15
            }
          />

          {
            formatDate(
              order.createdAt
            )
          }

        </div>

      </td>


      {/* Payment Method */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">

          {order.paymentMethod ===
          "card" ? (
            <CreditCard
              size={
                16
              }
            />
          ) : (
            <Banknote
              size={
                16
              }
            />
          )}

          {order.paymentMethod ===
          "card"
            ? "بطاقة"
            : "كاش"}

        </div>

      </td>


      {/* Total */}

      <td className="px-6 py-5">

        <p className="font-black text-slate-900">
          {Number(
            order.total || 0
          ).toLocaleString()}{" "}
          ج.م
        </p>

      </td>


      {/* Remaining */}

      <td className="px-6 py-5">

        {remaining >
        0 ? (
          <span className="font-black text-orange-600">
            {
              remaining.toLocaleString()
            }{" "}
            ج.م
          </span>
        ) : (
          <span className="text-sm font-bold text-slate-400">
            —
          </span>
        )}

      </td>


      {/* Order Status */}

      <td className="px-6 py-5">

        <div className="flex min-w-48 items-center gap-2">

          <div
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-black ${status.className}`}
          >

            <StatusIcon
              size={
                14
              }
            />

            {
              status.label
            }

          </div>


          <select
            value={
              order.status ||
              "pending"
            }
            onChange={(
              event
            ) =>
              onStatusChange(
                order,
                event.target
                  .value
              )
            }
            className="w-9 appearance-none rounded-lg border border-slate-200 bg-white px-2 py-2 text-transparent outline-none focus:border-blue-500"
            title="تغيير الحالة"
          >

            {STATUS_OPTIONS.map(
              (
                item
              ) => (
                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >
                  {
                    getStatusLabel(
                      item
                    )
                  }
                </option>
              )
            )}

          </select>

        </div>

      </td>


      {/* Payment Status */}

      <td className="px-6 py-5">

        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black ${paymentStatus.className}`}
        >

          <PaymentIcon
            size={
              14
            }
          />

          {
            paymentStatus.label
          }

        </span>

      </td>


      {/* Details */}

      <td className="px-6 py-5">

        <button
          type="button"
          onClick={
            onOpen
          }
          className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
          title="عرض الطلب"
        >
          <Eye
            size={
              19
            }
          />
        </button>

      </td>

    </tr>
  );
}


/* =====================================
   DETAILS
===================================== */

function OrderDetails({
  order,
  onClose,
  onStatusChange,
  onDelete,
}) {
  const status =
    STATUS_CONFIG[
      order.status
    ] ||
    STATUS_CONFIG.pending;

  const StatusIcon =
    status.icon;


  const paymentStatus =
    PAYMENT_STATUS_CONFIG[
      getOrderPaymentStatus(
        order
      )
    ] ||
    PAYMENT_STATUS_CONFIG.unknown;

  const PaymentIcon =
    paymentStatus.icon;


  const itemsTotal =
    order.items?.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.total ??
            Number(
              item.price ||
                0
            ) *
              Number(
                item.quantity ||
                  0
              )
        ),
      0
    ) || 0;


  const shipping =
    Number(
      order.shippingFee ||
        order.shipping?.fee ||
        0
    );


  const discount =
    Number(
      order.discount || 0
    );


  const paidAmount =
    Number(
      order.paidAmount || 0
    );


  const remaining =
    Number(
      order.remainingAmount ||
        Math.max(
          Number(
            order.total || 0
          ) -
            paidAmount,
          0
        )
    );


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div>

            <p className="text-xs font-bold text-blue-600">
              تفاصيل الطلب
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {
                order.id
              }
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {
                formatDate(
                  order.createdAt
                )
              }
            </p>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X
              size={
                20
              }
            />
          </button>

        </div>


        <div className="overflow-y-auto p-6">

          {/* Status */}

          <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center">

            <div className="flex items-center gap-3">

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${status.className}`}
              >
                <StatusIcon
                  size={
                    20
                  }
                />
              </div>

              <div>

                <p className="text-xs font-bold text-slate-400">
                  حالة الطلب
                </p>

                <p className="mt-1 font-black text-slate-800">
                  {
                    status.label
                  }
                </p>

              </div>

            </div>


            <select
              value={
                order.status ||
                "pending"
              }
              onChange={(
                event
              ) =>
                onStatusChange(
                  order,
                  event.target
                    .value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:border-blue-500"
            >

              {STATUS_OPTIONS.map(
                (
                  item
                ) => (
                  <option
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {
                      getStatusLabel(
                        item
                      )
                    }
                  </option>
                )
              )}

            </select>

          </div>


          {/* Payment status */}

          <div className="mb-6 rounded-2xl border border-slate-200 p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${paymentStatus.className}`}
                >
                  <PaymentIcon
                    size={
                      20
                    }
                  />
                </div>

                <div>

                  <p className="text-xs font-bold text-slate-400">
                    حالة الدفع
                  </p>

                  <p className="mt-1 font-black text-slate-800">
                    {
                      paymentStatus.label
                    }
                  </p>

                </div>

              </div>


              <div className="grid grid-cols-2 gap-3">

                <SmallMoney
                  label="المدفوع"
                  value={`${paidAmount.toLocaleString()} ج.م`}
                  positive
                />

                <SmallMoney
                  label="المتبقي"
                  value={`${remaining.toLocaleString()} ج.م`}
                  warning={
                    remaining >
                    0
                  }
                />

              </div>

            </div>

          </div>


          {/* Customer / Delivery */}

          <div className="grid gap-4 md:grid-cols-2">

            <InfoCard title="بيانات العميل">

              <InfoLine
                icon={
                  User
                }
                label="الاسم"
                value={
                  order.customer
                    ?.name ||
                  "عميل نقدي"
                }
              />


              {order.customer
                ?.phone && (
                <InfoLine
                  icon={
                    Phone
                  }
                  label="الهاتف"
                  value={
                    order.customer
                      .phone
                  }
                />
              )}


              {order.customer
                ?.email && (
                <InfoLine
                  icon={
                    MailIcon
                  }
                  label="البريد"
                  value={
                    order.customer
                      .email
                  }
                />
              )}

            </InfoCard>


            <InfoCard title="بيانات التوصيل">

              <InfoLine
                icon={
                  MapPin
                }
                label="العنوان"
                value={
                  order.shipping
                    ?.address ||
                  order.address ||
                  "غير محدد"
                }
              />


              <InfoLine
                icon={
                  Truck
                }
                label="الشحن"
                value={
                  shipping >
                  0
                    ? `${shipping} ج.م`
                    : "مجاني"
                }
              />


              <InfoLine
                icon={
                  CreditCard
                }
                label="الدفع"
                value={
                  order.paymentMethod ===
                  "card"
                    ? "بطاقة"
                    : "كاش"
                }
              />

            </InfoCard>

          </div>


          {/* Items */}

          <div className="mt-6">

            <h3 className="mb-4 font-black text-slate-900">
              المنتجات
            </h3>


            <div className="space-y-3">

              {order.items?.length ? (
                order.items.map(
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
                          item.total ??
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
                  لا توجد منتجات مسجلة في الطلب.
                </div>
              )}

            </div>

          </div>


          {/* Totals */}

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">

            <h3 className="font-black text-slate-900">
              الملخص المالي
            </h3>


            <div className="mt-4 space-y-3 text-sm">

              <div className="flex justify-between text-slate-500">

                <span>
                  مجموع المنتجات
                </span>

                <span>
                  {
                    itemsTotal.toLocaleString()
                  }{" "}
                  ج.م
                </span>

              </div>


              <div className="flex justify-between text-slate-500">

                <span>
                  الخصم
                </span>

                <span>
                  -{" "}
                  {
                    discount.toLocaleString()
                  }{" "}
                  ج.م
                </span>

              </div>


              <div className="flex justify-between text-slate-500">

                <span>
                  الشحن
                </span>

                <span>
                  {
                    shipping.toLocaleString()
                  }{" "}
                  ج.م
                </span>

              </div>


              <div className="flex items-center justify-between border-t border-slate-100 pt-4">

                <span className="text-lg font-black text-slate-900">
                  الإجمالي
                </span>

                <span className="text-2xl font-black text-blue-700">
                  {Number(
                    order.total || 0
                  ).toLocaleString()}{" "}
                  ج.م
                </span>

              </div>

            </div>


            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <SmallMoney
                label="المدفوع"
                value={`${paidAmount.toLocaleString()} ج.م`}
                positive
              />

              <SmallMoney
                label="المتبقي"
                value={`${remaining.toLocaleString()} ج.م`}
                warning={
                  remaining >
                  0
                }
              />

            </div>

          </div>

        </div>


        {/* Footer */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row">

          <button
            type="button"
            onClick={
              onDelete
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-5 py-3 text-sm font-black text-red-500 hover:bg-red-50"
          >
            <Trash2
              size={
                16
              }
            />

            حذف الطلب
          </button>


          <button
            type="button"
            onClick={
              onClose
            }
            className="flex-1 rounded-xl bg-blue-700 py-3 text-sm font-black text-white hover:bg-blue-800"
          >
            إغلاق
          </button>

        </div>

      </div>

    </div>
  );
}

/* =====================================
   UI
===================================== */

function SummaryCard({
  icon: Icon,
  title,
  value,
  accent = "blue",
}) {
  const colors = {
    blue:
      "bg-blue-50 text-blue-700",

    orange:
      "bg-orange-50 text-orange-600",

    purple:
      "bg-violet-50 text-violet-600",

    green:
      "bg-emerald-50 text-emerald-600",

    red:
      "bg-red-50 text-red-600",
  };


  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

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


function SummaryValue({
  icon: Icon,
  label,
  value,
  positive = false,
  warning = false,
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl p-4 ${
        warning
          ? "bg-orange-50"
          : positive
            ? "bg-emerald-50"
            : "bg-slate-50"
      }`}
    >

      <div>

        <p className="text-xs font-bold text-slate-400">
          {
            label
          }
        </p>

        <p
          className={`mt-2 text-xl font-black ${
            warning
              ? "text-orange-600"
              : positive
                ? "text-emerald-600"
                : "text-slate-900"
          }`}
        >
          {
            value
          }
        </p>

      </div>


      <Icon
        size={
          20
        }
        className={
          warning
            ? "text-orange-600"
            : positive
              ? "text-emerald-600"
              : "text-blue-700"
        }
      />

    </div>
  );
}


function SmallMoney({
  label,
  value,
  positive = false,
  warning = false,
}) {
  return (
    <div
      className={`rounded-xl p-3 ${
        warning
          ? "bg-orange-50"
          : positive
            ? "bg-emerald-50"
            : "bg-slate-50"
      }`}
    >

      <p className="text-[10px] font-bold text-slate-400">
        {
          label
        }
      </p>

      <p
        className={`mt-1 text-sm font-black ${
          warning
            ? "text-orange-600"
            : positive
              ? "text-emerald-600"
              : "text-slate-800"
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
  title,
  children,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <h3 className="mb-4 font-black text-slate-900">
        {
          title
        }
      </h3>

      <div className="space-y-3">
        {
          children
        }
      </div>

    </div>
  );
}


function InfoLine({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        <Icon
          size={
            15
          }
        />
      </div>


      <div className="min-w-0">

        <p className="text-[11px] font-bold text-slate-400">
          {
            label
          }
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-700">
          {
            value
          }
        </p>

      </div>

    </div>
  );
}


/* =====================================
   HELPERS
===================================== */

function getStatusLabel(
  status
) {
  return (
    STATUS_CONFIG[
      status
    ]?.label ||
    status
  );
}


function getOrderPaymentStatus(
  order
) {
  if (
    order.paymentStatus ===
    "paid" ||
    order.paymentStatus ===
    "partial" ||
    order.paymentStatus ===
    "unpaid"
  ) {
    return order.paymentStatus;
  }


  if (
    order.remainingAmount !==
    undefined
  ) {
    const remaining =
      Number(
        order.remainingAmount ||
          0
      );

    const paid =
      Number(
        order.paidAmount ||
          0
      );

    const total =
      Number(
        order.total || 0
      );


    if (
      total <=
        0 ||
      remaining <=
        0
    ) {
      return "paid";
    }

    if (
      paid >
      0
    ) {
      return "partial";
    }

    return "unpaid";
  }


  /*
    الطلبات القديمة التي لا تحتوي
    على بيانات دفع لا نخمن حالتها.
  */
  return "unknown";
}


function getDateKey(
  date
) {
  if (!date) {
    return "unknown";
  }

  const value =
    new Date(
      date
    );

  const year =
    value.getFullYear();

  const month =
    String(
      value.getMonth() +
        1
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
    Number(month) -
      1,
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


function formatDate(
  date
) {
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
}


function MailIcon(
  props
) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        width="20"
        height="16"
        x="2"
        y="4"
        rx="2"
      />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}


export default Orders;






