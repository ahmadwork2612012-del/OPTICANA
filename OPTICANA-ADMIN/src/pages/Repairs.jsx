import {
  Search,
  Plus,
  Wrench,
  User,
  Phone,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  X,
  Pencil,
  Trash2,
  Eye,
  CreditCard,
  Banknote,
  Package,
  ImagePlus,
  WalletCards,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import useRepairStore from "../store/repairStore";
import useCustomerStore from "../store/customerStore";
import useProductStore from "../store/productStore";
import useInventoryStore from "../store/inventoryStore";


/* =====================================
   STATUS
===================================== */

const STATUS_CONFIG = {
  pending: {
    label: "قيد الانتظار",
    className:
      "bg-orange-50 text-orange-600",
    icon: Clock3,
  },

  diagnosing: {
    label: "جاري الفحص",
    className:
      "bg-blue-50 text-blue-700",
    icon: AlertTriangle,
  },

  waiting: {
    label: "بانتظار القرار",
    className: "bg-amber-50 text-amber-700",
    icon: Clock3,
  },

  repairing: {
    label: "قيد الصيانة",
    className:
      "bg-violet-50 text-violet-700",
    icon: Wrench,
  },

  ready: {
    label: "جاهزة للاستلام",
    className:
      "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  },

  completed: {
    label: "مكتملة",
    className:
      "bg-slate-100 text-slate-700",
    icon: CheckCircle2,
  },

  cancelled: {
    label: "ملغاة",
    className:
      "bg-red-50 text-red-600",
    icon: X,
  },
};


const STATUS_OPTIONS = [
  "pending",
  "diagnosing",
  "waiting",
  "repairing",
  "ready",
  "completed",
  "cancelled",
];


const ITEM_TYPES = [
  "نظارة طبية",
  "نظارة شمسية",
  "عدسات",
  "إطار",
  "أخرى",
];


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


/* =====================================
   PAGE
===================================== */

function Repairs() {
  const repairs =
    useRepairStore(
      (state) => state.repairs
    );

  const addRepair =
    useRepairStore(
      (state) => state.addRepair
    );

  const updateRepair =
    useRepairStore(
      (state) => state.updateRepair
    );

  const deleteRepair =
    useRepairStore(
      (state) => state.deleteRepair
    );

  const fetchRepairs =
    useRepairStore(
      (state) => state.fetchRepairs
    );

  const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  useEffect(() => {
    Promise.all([
      fetchRepairs(),
      fetchCustomers(),
      fetchProducts(),
    ]).catch((error) => {
      toast.error(error?.message || "تعذر تحميل بيانات الصيانة");
    });
  }, [fetchRepairs, fetchCustomers, fetchProducts]);


  const customers =
    useCustomerStore(
      (state) => state.customers
    );

  const products =
    useProductStore(
      (state) => state.products
    );

  const adjustStock =
    useProductStore(
      (state) => state.adjustStock
    );

  const addMovement =
    useInventoryStore(
      (state) =>
        state.addMovement
    );


  /* =====================================
     UI
  ===================================== */

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [paymentFilter, setPaymentFilter] =
    useState("all");

  const [showAllRepairs, setShowAllRepairs] =
    useState(false);

  const toggleView = () => {
    setShowAllRepairs((current) => !current);
  };

  const [showForm, setShowForm] =
    useState(false);

  const [editingRepair, setEditingRepair] =
    useState(null);

  const [selectedRepair, setSelectedRepair] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
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
     FILTERED
  ===================================== */

  const filteredRepairs =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      return [
        ...repairs,
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
          (repair) => {
            const matchesSearch =
              !value ||
              repair.id
                ?.toLowerCase()
                .includes(
                  value
                ) ||
              repair.customerName
                ?.toLowerCase()
                .includes(
                  value
                ) ||
              repair.phone
                ?.toLowerCase()
                .includes(
                  value
                ) ||
              repair.itemType
                ?.toLowerCase()
                .includes(
                  value
                ) ||
              repair.problem
                ?.toLowerCase()
                .includes(
                  value
                );

            const matchesStatus =
              statusFilter ===
                "all" ||
              repair.status ===
                statusFilter;

            const matchesPayment =
              paymentFilter ===
                "all" ||
              getRepairPaymentStatus(
                repair
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
      repairs,
      search,
      statusFilter,
      paymentFilter,
    ]);


  /* =====================================
     LAST 24 HOURS
  ===================================== */

  const recentRepairs =
    useMemo(() => {
      return filteredRepairs.filter(
        (repair) => {
          if (
            !repair.createdAt
          ) {
            return false;
          }

          const date =
            new Date(
              repair.createdAt
            );

          return (
            date >=
              last24HoursStart &&
            date <= now
          );
        }
      );
    }, [
      filteredRepairs,
      last24HoursStart,
      now,
    ]);


  const visibleRepairs =
    showAllRepairs
      ? filteredRepairs
      : recentRepairs;


  /* =====================================
     GROUP FULL HISTORY
  ===================================== */

  const groupedRepairs =
    useMemo(() => {
      if (
        !showAllRepairs
      ) {
        return [];
      }

      const groups =
        {};

      filteredRepairs.forEach(
        (
          repair
        ) => {
          const key =
            getDateKey(
              repair.createdAt
            );

          if (
            !groups[key]
          ) {
            groups[key] =
              [];
          }

          groups[key].push(
            repair
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
      filteredRepairs,
      showAllRepairs,
    ]);


  /* =====================================
     GLOBAL STATS
  ===================================== */

  const activeRepairs =
    repairs.filter(
      (repair) =>
        repair.status ===
          "pending" ||
        repair.status ===
          "diagnosing" ||
        repair.status ===
          "repairing"
    ).length;


  const readyRepairs =
    repairs.filter(
      (repair) =>
        repair.status ===
        "ready"
    ).length;


  const completedRepairs =
    repairs.filter(
      (repair) =>
        repair.status ===
        "completed"
    ).length;


  const cancelledRepairs =
    repairs.filter(
      (repair) =>
        repair.status ===
        "cancelled"
    ).length;


  const repairRevenue =
    repairs
      .filter(
        (repair) =>
          repair.status !==
          "cancelled"
      )
      .reduce(
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


  const repairPaid =
    repairs
      .filter(
        (repair) =>
          repair.status !==
          "cancelled"
      )
      .reduce(
        (
          sum,
          repair
        ) =>
          sum +
          Number(
            repair.paidAmount ||
              0
          ),
        0
      );


  const repairRemaining =
    Math.max(
      repairRevenue -
        repairPaid,
      0
    );


  const unpaidRepairs =
    repairs.filter(
      (repair) =>
        repair.status !==
          "cancelled" &&
        Number(
          getRepairRemaining(
            repair
          )
        ) >
          0
    ).length;


  /* =====================================
     CURRENT 24H STATS
  ===================================== */

  const recentRevenue =
    recentRepairs.reduce(
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


  const recentPaid =
    recentRepairs.reduce(
      (
        sum,
        repair
      ) =>
        sum +
        Number(
          repair.paidAmount ||
            0
        ),
      0
    );


  const recentRemaining =
    recentRepairs.reduce(
      (
        sum,
        repair
      ) =>
        sum +
        getRepairRemaining(
          repair
        ),
      0
    );


  /* =====================================
     ACTIONS
  ===================================== */

  const openAddForm =
    () => {
      setEditingRepair(
        null
      );

      setShowForm(
        true
      );
    };


  const openEditForm =
    (
      repair
    ) => {
      setEditingRepair(
        repair
      );

      setShowForm(
        true
      );
    };


  const closeForm =
    () => {
      setShowForm(
        false
      );

      setEditingRepair(
        null
      );
    };


  const handleSubmit = async (repairData) => {
    try {
      if (editingRepair) {
        await updateRepair(editingRepair.id, repairData);
        toast.success("تم تحديث بيانات الصيانة");
      } else {
        await addRepair(repairData);
        toast.success("تم تسجيل عملية الصيانة والقطع المستهلكة");
      }
      closeForm();
    } catch (error) {
      toast.error(error?.message || "تعذر حفظ عملية الصيانة");
    }
  };


  const changeStatus =
    async (
      repair,
      status
    ) => {
      try {
        await updateRepair(
          repair.id,
          { status }
        );

      setSelectedRepair(
        (
          current
        ) =>
          current?.id ===
          repair.id
            ? {
                ...current,
                status,
              }
            : current
      );

        toast.success(
          `تم تحديث الحالة إلى ${getStatusLabel(status)}`
        );
      } catch (error) {
        toast.error(error?.message || "تعذر تحديث حالة الصيانة");
      }
    };


  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRepair(deleteTarget.id);
      if (selectedRepair?.id === deleteTarget.id) {
        setSelectedRepair(null);
      }
      toast.success("تم حذف عملية الصيانة");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.message || "تعذر حذف عملية الصيانة");
    }
  };


  return (
    <div className="space-y-6">

      {/* =================================
          HEADER
      ================================= */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-black text-violet-700">
            <Wrench
              size={
                15
              }
            />

            مركز الصيانة
          </div>


          <h1 className="text-3xl font-black text-slate-900">
            الصيانة
          </h1>


          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            إدارة عمليات الصيانة من الاستلام حتى التسليم،
            مع متابعة العميل والتكلفة والقطع المستخدمة وحالة الدفع.
          </p>

        </div>


        <button
          type="button"
          onClick={
            openAddForm
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-800"
        >
          <Plus
            size={
              18
            }
          />

          تسجيل صيانة
        </button>

      </div>


      {/* =================================
          SUMMARY
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <SummaryCard
          icon={
            Wrench
          }
          title="الصيانة النشطة"
          value={
            activeRepairs
          }
          accent="blue"
        />


        <SummaryCard
          icon={
            CheckCircle2
          }
          title="جاهزة للاستلام"
          value={
            readyRepairs
          }
          accent="green"
        />


        <SummaryCard
          icon={
            WalletCards
          }
          title="إيرادات الصيانة"
          value={`${repairRevenue.toLocaleString()} ج.م`}
          accent="purple"
        />


        <SummaryCard
          icon={
            CreditCard
          }
          title="المحصل"
          value={`${repairPaid.toLocaleString()} ج.م`}
          accent="green"
        />


        <SummaryCard
          icon={
            WalletCards
          }
          title="المتبقي"
          value={`${repairRemaining.toLocaleString()} ج.م`}
          accent="orange"
        />

      </div>


      {/* =================================
          SECONDARY
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <MiniStat
          label="إجمالي العمليات"
          value={
            repairs.length
          }
          icon={
            ClipboardListIcon
          }
        />


        <MiniStat
          label="مكتملة"
          value={
            completedRepairs
          }
          icon={
            CheckCircle2
          }
        />


        <MiniStat
          label="ملغاة"
          value={
            cancelledRepairs
          }
          icon={
            X
          }
        />


        <MiniStat
          label="عليها رصيد"
          value={
            unpaidRepairs
          }
          icon={
            AlertTriangle
          }
        />

      </div>


      {/* =================================
          RECENT SUMMARY
      ================================= */}

      {!showAllRepairs && (
        <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <p className="text-sm font-black text-violet-800">
                نشاط آخر 24 ساعة
              </p>

              <p className="mt-1 text-xs text-violet-600/70">
                ملخص سريع للصيانات التي أضيفت خلال آخر 24 ساعة.
              </p>

            </div>


            <div className="grid grid-cols-3 gap-2">

              <MiniPeriodMetric
                label="عمليات"
                value={
                  recentRepairs.length
                }
              />

              <MiniPeriodMetric
                label="إيرادات"
                value={`${recentRevenue.toLocaleString()} ج.م`}
              />

              <MiniPeriodMetric
                label="متبقي"
                value={`${recentRemaining.toLocaleString()} ج.م`}
                warning={
                  recentRemaining >
                  0
                }
              />

            </div>

          </div>

        </div>
      )}


      {/* =================================
          FILTERS
      ================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-slate-200 p-5">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

              <Search
                size={
                  18
                }
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
                placeholder="ابحث برقم الصيانة أو اسم العميل أو الهاتف أو المشكلة..."
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
                    size={
                      15
                    }
                  />
                </button>
              )}

            </div>


            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event
                    .target
                    .value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-500 lg:w-52"
            >

              <option value="all">
                كل حالات الصيانة
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
                    {
                      getStatusLabel(
                        status
                      )
                    }
                  </option>
                )
              )}

            </select>


            <select
              value={
                paymentFilter
              }
              onChange={(
                event
              ) =>
                setPaymentFilter(
                  event
                    .target
                    .value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-500 lg:w-52"
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


          {/* View */}

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-black text-slate-800">
                {showAllRepairs
                  ? "السجل الكامل"
                  : "آخر 24 ساعة"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {showAllRepairs
                  ? `${visibleRepairs.length} عملية صيانة مطابقة`
                  : `${visibleRepairs.length} عملية خلال آخر 24 ساعة`}
              </p>

            </div>


            <button
              type="button"
              onClick={
                toggleView
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800"
            >

              {showAllRepairs ? (
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
                  عرض كل الصيانات

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

          <table className="w-full min-w-[1400px] text-right">

            <thead>

              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-400">

                <th className="px-6 py-4">
                  العملية
                </th>

                <th className="px-6 py-4">
                  العميل
                </th>

                <th className="px-6 py-4">
                  المشكلة
                </th>

                <th className="px-6 py-4">
                  موعد التسليم
                </th>

                <th className="px-6 py-4">
                  التكلفة
                </th>

                <th className="px-6 py-4">
                  المدفوع
                </th>

                <th className="px-6 py-4">
                  المتبقي
                </th>

                <th className="px-6 py-4">
                  الحالة
                </th>

                <th className="px-6 py-4">
                  الدفع
                </th>

                <th className="px-6 py-4">
                  التفاصيل
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {!showAllRepairs &&
                visibleRepairs.map(
                  (
                    repair
                  ) => (
                    <RepairRow
                      key={
                        repair.id
                      }
                      repair={
                        repair
                      }
                      onOpen={() =>
                        setSelectedRepair(
                          repair
                        )
                      }
                      onEdit={() =>
                        openEditForm(
                          repair
                        )
                      }
                    />
                  )
                )}


              {showAllRepairs &&
                groupedRepairs.map(
                  ([
                    dateKey,
                    dateRepairs,
                  ]) => (
                    <RepairDateGroup
                      key={
                        dateKey
                      }
                      dateKey={
                        dateKey
                      }
                      repairs={
                        dateRepairs
                      }
                      onOpen={
                        (
                          repair
                        ) =>
                          setSelectedRepair(
                            repair
                          )
                      }
                      onEdit={
                        openEditForm
                      }
                    />
                  )
                )}

            </tbody>

          </table>


          {visibleRepairs.length ===
            0 && (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">

              <Wrench
                size={
                  42
                }
                className="text-slate-300"
              />

              <p className="mt-4 font-bold text-slate-700">
                لا توجد عمليات صيانة
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {showAllRepairs
                  ? "لا توجد نتائج مطابقة للفلاتر الحالية."
                  : "لا توجد عمليات خلال آخر 24 ساعة مطابقة للفلاتر الحالية."}
              </p>


              {!search &&
                statusFilter ===
                  "all" &&
                paymentFilter ===
                  "all" && (
                  <button
                    type="button"
                    onClick={
                      openAddForm
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
                  >
                    <Plus
                      size={
                        17
                      }
                    />

                    تسجيل أول صيانة
                  </button>
                )}

            </div>
          )}

        </div>

      </div>


      {/* =================================
          FORM
      ================================= */}

      {showForm && (
        <RepairForm
          repair={
            editingRepair
          }
          customers={
            customers
          }
          products={
            products
          }
          onClose={
            closeForm
          }
          onSubmit={
            handleSubmit
          }
        />
      )}


      {/* =================================
          DETAILS
      ================================= */}

      {selectedRepair && (
        <RepairDetails
          repair={
            selectedRepair
          }
          onClose={() =>
            setSelectedRepair(
              null
            )
          }
          onStatusChange={
            changeStatus
          }
          onEdit={() => {
            setSelectedRepair(
              null
            );

            openEditForm(
              selectedRepair
            );
          }}
          onDelete={() => {
            setDeleteTarget(
              selectedRepair
            );

            setSelectedRepair(
              null
            );
          }}
        />
      )}


      {/* =================================
          DELETE
      ================================= */}

      {deleteTarget && (
        <DeleteModal
          repair={
            deleteTarget
          }
          onClose={() =>
            setDeleteTarget(
              null
            )
          }
          onConfirm={
            confirmDelete
          }
        />
      )}

    </div>
  );
}


/* =====================================
   DATE GROUP
===================================== */

function RepairDateGroup({
  dateKey,
  repairs,
  onOpen,
  onEdit,
}) {
  return (
    <>
      <tr>

        <td
          colSpan={10}
          className="border-y border-slate-200 bg-slate-100 px-6 py-3"
        >

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <CalendarDays
                size={
                  15
                }
                className="text-violet-700"
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
                repairs.length
              }{" "}
              {repairs.length ===
              1
                ? "صيانة"
                : "صيانات"}
            </span>

          </div>

        </td>

      </tr>


      {repairs.map(
        (
          repair
        ) => (
          <RepairRow
            key={
              repair.id
            }
            repair={
              repair
            }
            onOpen={() =>
              onOpen(
                repair
              )
            }
            onEdit={() =>
              onEdit(
                repair
              )
            }
          />
        )
      )}

    </>
  );
}


/* =====================================
   ROW
===================================== */

function RepairRow({
  repair,
  onOpen,
  onEdit,
}) {
  const status =
    STATUS_CONFIG[
      repair.status
    ] ||
    STATUS_CONFIG.pending;

  const StatusIcon =
    status.icon;


  const paymentStatus =
    PAYMENT_STATUS_CONFIG[
      getRepairPaymentStatus(
        repair
      )
    ] ||
    PAYMENT_STATUS_CONFIG.unpaid;

  const PaymentIcon =
    paymentStatus.icon;


  const remaining =
    getRepairRemaining(
      repair
    );


  return (
    <tr className="transition hover:bg-slate-50">

      {/* Repair */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-3">

          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-violet-50 text-violet-700">

            {repair.image ? (
              <img
                src={
                  repair.image
                }
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Wrench
                size={
                  18
                }
              />
            )}

          </div>


          <div>

            <p className="font-black text-slate-800">
              {
                repair.id
              }
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {
                repair.itemType ||
                "—"
              }
            </p>

          </div>

        </div>

      </td>


      {/* Customer */}

      <td className="px-6 py-5">

        <div>

          <p className="font-bold text-slate-700">
            {
              repair.customerName ||
              "—"
            }
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {
              repair.phone ||
              "بدون هاتف"
            }
          </p>

        </div>

      </td>


      {/* Problem */}

      <td className="px-6 py-5">

        <p className="max-w-56 truncate text-sm text-slate-600">
          {
            repair.problem ||
            "بدون وصف"
          }
        </p>

      </td>


      {/* Due */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-2 text-sm text-slate-500">

          <CalendarDays
            size={
              15
            }
          />

          {
            formatDateShort(
              repair.dueDate
            )
          }

        </div>

      </td>


      {/* Cost */}

      <td className="px-6 py-5">

        <span className="font-black text-slate-900">

          {Number(
            repair.cost || 0
          ).toLocaleString()}{" "}
          ج.م

        </span>

      </td>


      {/* Paid */}

      <td className="px-6 py-5">

        <span className="font-black text-emerald-600">

          {Number(
            repair.paidAmount ||
              0
          ).toLocaleString()}{" "}
          ج.م

        </span>

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


      {/* Status */}

      <td className="px-6 py-5">

        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black ${status.className}`}
        >

          <StatusIcon
            size={
              14
            }
          />

          {
            status.label
          }

        </span>

      </td>


      {/* Payment */}

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


      {/* Actions */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-1">

          <button
            type="button"
            onClick={
              onOpen
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
            title="عرض الصيانة"
          >
            <Eye
              size={
                18
              }
            />
          </button>


          <button
            type="button"
            onClick={
              onEdit
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-50 hover:text-violet-700"
            title="تعديل"
          >
            <Pencil
              size={
                17
              }
            />
          </button>

        </div>

      </td>

    </tr>
  );
}


/* =====================================
   FORM
===================================== */

function RepairForm({
  repair,
  customers,
  products,
  onClose,
  onSubmit,
}) {
  const [form, setForm] =
    useState({
      customerId:
        repair?.customerId ||
        "",

      customerName:
        repair?.customerName ||
        "",

      phone:
        repair?.phone || "",

      itemType:
        repair?.itemType ||
        "نظارة طبية",

      problem:
        repair?.problem ||
        "",

      diagnosis:
        repair?.diagnosis ||
        "",

      cost:
        repair?.cost ??
        "",

      paidAmount:
        repair?.paidAmount ??
        "",

      receivedDate:
        repair?.receivedDate ||
        new Date()
          .toISOString()
          .slice(
            0,
            10
          ),

      dueDate:
        repair?.dueDate ||
        "",

      status:
        repair?.status ||
        "pending",

      notes:
        repair?.notes ||
        "",

      parts:
        Array.isArray(
          repair?.parts
        )
          ? repair.parts
          : [],

      image:
        repair?.image ||
        "",
    });


  const [
    partProductId,
    setPartProductId,
  ] =
    useState("");


  const [
    partQuantity,
    setPartQuantity,
  ] =
    useState(1);


  const updateField =
    (
      key,
      value
    ) => {
      setForm(
        (
          current
        ) => ({
          ...current,
          [key]:
            value,
        })
      );
    };


  const selectExistingCustomer =
    (
      customerId
    ) => {
      const customer =
        customers.find(
          (
            item
          ) =>
            String(
              item.id
            ) ===
            String(
              customerId
            )
        );

      if (
        !customer
      ) {
        updateField(
          "customerId",
          ""
        );

        return;
      }


      setForm(
        (
          current
        ) => ({
          ...current,

          customerId:
            customer.id,

          customerName:
            customer.name ||
            "",

          phone:
            customer.phone ||
            "",
        })
      );
    };


  const addPart =
    () => {
      const product =
        products.find(
          (
            item
          ) =>
            String(
              item.id
            ) ===
            String(
              partProductId
            )
        );


      if (
        !product
      ) {
        toast.error(
          "اختر قطعة من المخزون"
        );

        return;
      }


      const quantity =
        Number(
          partQuantity
        );


      if (
        !quantity ||
        quantity <=
          0
      ) {
        toast.error(
          "أدخل كمية صحيحة"
        );

        return;
      }


      if (
        quantity >
        Number(
          product.stock ||
            0
        )
      ) {
        toast.error(
          "الكمية المطلوبة أكبر من المخزون"
        );

        return;
      }


      const existingQuantity =
        form.parts.find(
          (
            part
          ) =>
            part.productId ===
            product.id
        )?.quantity ||
        0;


      if (
        existingQuantity +
          quantity >
        Number(
          product.stock ||
            0
        )
      ) {
        toast.error(
          "إجمالي كمية القطعة أكبر من المخزون المتاح"
        );

        return;
      }


      const exists =
        form.parts.find(
          (
            part
          ) =>
            part.productId ===
            product.id
        );


      if (
        exists
      ) {
        setForm(
          (
            current
          ) => ({
            ...current,

            parts:
              current.parts.map(
                (
                  part
                ) =>
                  part.productId ===
                  product.id
                    ? {
                        ...part,
                        quantity:
                          part.quantity +
                          quantity,
                      }
                    : part
              ),
          })
        );
      } else {
        setForm(
          (
            current
          ) => ({
            ...current,

            parts: [
              ...current.parts,

              {
                productId:
                  product.id,

                productName:
                  product.name,

                quantity,
              },
            ],
          })
        );
      }


      setPartProductId(
        ""
      );

      setPartQuantity(
        1
      );
    };


  const removePart =
    (
      productId
    ) => {
      setForm(
        (
          current
        ) => ({
          ...current,

          parts:
            current.parts.filter(
              (
                part
              ) =>
                part.productId !==
                productId
            ),
        })
      );
    };


  const submit =
    (
      event
    ) => {
      event.preventDefault();


      const customerName =
        form.customerName.trim();


      if (
        !customerName
      ) {
        toast.error(
          "أدخل اسم العميل"
        );

        return;
      }


      if (
        !form.problem.trim()
      ) {
        toast.error(
          "اكتب وصف المشكلة"
        );

        return;
      }


      const cost =
        Math.max(
          Number(
            form.cost || 0
          ),
          0
        );


      const paidAmount =
        Math.min(
          Math.max(
            Number(
              form.paidAmount ||
                0
            ),
            0
          ),
          cost
        );


      onSubmit({
        ...form,

        customerName,

        phone:
          form.phone.trim(),

        problem:
          form.problem.trim(),

        diagnosis:
          form.diagnosis.trim(),

        notes:
          form.notes.trim(),

        cost,

        paidAmount,

        remaining:
          Math.max(
            cost -
              paidAmount,
            0
          ),

        customerId:
          form.customerId ||
          null,

        image:
          form.image ||
          null,
      });
    };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div>

            <p className="text-xs font-bold text-violet-600">
              مركز الصيانة
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {repair
                ? "تعديل عملية الصيانة"
                : "تسجيل صيانة جديدة"}
            </h2>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X
              size={
                20
              }
            />
          </button>

        </div>


        <form
          onSubmit={
            submit
          }
          className="overflow-y-auto"
        >

          <div className="grid gap-6 p-6 lg:grid-cols-2">

            {/* Customer */}

            <FormSection title="العميل">

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  عميل مسجل
                </label>


                <select
                  value={
                    form.customerId
                  }
                  onChange={(
                    event
                  ) =>
                    selectExistingCustomer(
                      event
                        .target
                        .value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="">
                    عميل جديد / بدون تسجيل
                  </option>


                  {customers.map(
                    (
                      customer
                    ) => (
                      <option
                        key={
                          customer.id
                        }
                        value={
                          customer.id
                        }
                      >
                        {
                          customer.name
                        }

                        {customer.phone
                          ? ` • ${customer.phone}`
                          : ""}
                      </option>
                    )
                  )}

                </select>

              </div>


              <div className="grid gap-4 sm:grid-cols-2">

                <TextField
                  label="اسم العميل"
                  value={
                    form.customerName
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "customerName",
                      value
                    )
                  }
                  placeholder="اسم العميل"
                />


                <TextField
                  label="رقم الهاتف"
                  value={
                    form.phone
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "phone",
                      value
                    )
                  }
                  placeholder="01012345678"
                />

              </div>

            </FormSection>


            {/* Item */}

            <FormSection title="المنتج / الحالة">

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  نوع المنتج
                </label>

                <select
                  value={
                    form.itemType
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "itemType",
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
                >

                  {ITEM_TYPES.map(
                    (
                      type
                    ) => (
                      <option
                        key={
                          type
                        }
                        value={
                          type
                        }
                      >
                        {
                          type
                        }
                      </option>
                    )
                  )}

                </select>

              </div>


              <TextArea
                label="المشكلة"
                value={
                  form.problem
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "problem",
                    value
                  )
                }
                placeholder="مثال: كسر في الذراع اليسرى للنظارة..."
              />


              <TextArea
                label="التشخيص"
                value={
                  form.diagnosis
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "diagnosis",
                    value
                  )
                }
                placeholder="نتيجة الفحص أو سبب العطل..."
              />

            </FormSection>


            {/* Dates */}

            <FormSection title="المواعيد والحالة">

              <div className="grid gap-4 sm:grid-cols-2">

                <DateField
                  label="تاريخ الاستلام"
                  value={
                    form.receivedDate
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "receivedDate",
                      value
                    )
                  }
                />


                <DateField
                  label="موعد التسليم"
                  value={
                    form.dueDate
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "dueDate",
                      value
                    )
                  }
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  الحالة
                </label>


                <select
                  value={
                    form.status
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "status",
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
                >

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
                        {
                          getStatusLabel(
                            status
                          )
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

            </FormSection>


            {/* Financial */}

            <FormSection title="التكلفة والدفع">

              <div className="grid gap-4 sm:grid-cols-2">

                <NumberField
                  label="تكلفة الصيانة"
                  value={
                    form.cost
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "cost",
                      value
                    )
                  }
                />


                <NumberField
                  label="المدفوع"
                  value={
                    form.paidAmount
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "paidAmount",
                      value
                    )
                  }
                />

              </div>


              <div className="rounded-xl bg-slate-50 p-4">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-slate-500">
                    المتبقي
                  </span>

                  <span className="font-black text-orange-600">

                    {Math.max(
                      Number(
                        form.cost ||
                          0
                      ) -
                        Number(
                          form.paidAmount ||
                            0
                        ),
                      0
                    ).toLocaleString()}{" "}
                    ج.م

                  </span>

                </div>

              </div>

            </FormSection>


            {/* Parts */}

            <div className="rounded-2xl border border-slate-200 p-5 lg:col-span-2">

              <div className="mb-4">

                <h3 className="font-black text-slate-900">
                  قطع مستخدمة من المخزون
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  عند إنشاء العملية سيتم خصم القطع من المخزون.
                </p>

              </div>


              <div className="grid gap-3 lg:grid-cols-[1fr_150px_auto]">

                <select
                  value={
                    partProductId
                  }
                  onChange={(
                    event
                  ) =>
                    setPartProductId(
                      event
                        .target
                        .value
                    )
                  }
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >

                  <option value="">
                    اختر قطعة
                  </option>


                  {products.map(
                    (
                      product
                    ) => (
                      <option
                        key={
                          product.id
                        }
                        value={
                          product.id
                        }
                        disabled={
                          Number(
                            product.stock ||
                              0
                          ) <=
                          0
                        }
                      >
                        {
                          product.name
                        }{" "}
                        —{" "}
                        {
                          product.stock
                        }{" "}
                        متاح
                      </option>
                    )
                  )}

                </select>


                <input
                  type="number"
                  min="1"
                  value={
                    partQuantity
                  }
                  onChange={(
                    event
                  ) =>
                    setPartQuantity(
                      event.target
                        .value
                    )
                  }
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  placeholder="الكمية"
                />


                <button
                  type="button"
                  onClick={
                    addPart
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-200"
                >
                  <Plus
                    size={
                      17
                    }
                  />

                  إضافة قطعة
                </button>

              </div>


              <div className="mt-4 space-y-2">

                {form.parts.length >
                0 ? (
                  form.parts.map(
                    (
                      part
                    ) => (
                      <div
                        key={
                          part.productId
                        }
                        className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                      >

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-400">
                            <Package
                              size={
                                16
                              }
                            />
                          </div>


                          <div>

                            <p className="text-sm font-bold text-slate-800">
                              {
                                part.productName
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              الكمية:{" "}
                              {
                                part.quantity
                              }
                            </p>

                          </div>

                        </div>


                        <button
                          type="button"
                          onClick={() =>
                            removePart(
                              part.productId
                            )
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <X
                            size={
                              16
                            }
                          />
                        </button>

                      </div>
                    )
                  )
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">

                    <Package
                      size={
                        25
                      }
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-xs font-bold text-slate-500">
                      لا توجد قطع مرتبطة بالصيانة
                    </p>

                  </div>
                )}

              </div>

            </div>


            {/* Notes + Image */}

            <FormSection
              title="ملاحظات وصور"
            >

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  صورة الصيانة
                </label>


                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm font-bold text-slate-500 hover:bg-slate-100">

                  <ImagePlus
                    size={
                      20
                    }
                  />

                  {form.image
                    ? "تغيير الصورة"
                    : "إضافة صورة"}


                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(
                      event
                    ) => {
                      const file =
                        event
                          .target
                          .files?.[0];

                      if (
                        !file
                      ) {
                        return;
                      }


                      if (
                        !file.type.startsWith(
                          "image/"
                        )
                      ) {
                        toast.error(
                          "اختر صورة صحيحة"
                        );

                        return;
                      }


                      const reader =
                        new FileReader();


                      reader.onload =
                        () => {
                          updateField(
                            "image",
                            reader.result
                          );
                        };


                      reader.readAsDataURL(
                        file
                      );
                    }}
                  />

                </label>


                {form.image && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">

                    <img
                      src={
                        form.image
                      }
                      alt="صورة الصيانة"
                      className="h-44 w-full object-cover"
                    />

                  </div>
                )}

              </div>


              <TextArea
                label="ملاحظات"
                value={
                  form.notes
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "notes",
                    value
                  )
                }
                placeholder="أي ملاحظات مهمة عن العملية..."
              />

            </FormSection>

          </div>


          {/* Footer */}

          <div className="flex gap-3 border-t border-slate-200 bg-slate-50 p-6">

            <button
              type="button"
              onClick={
                onClose
              }
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-black text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>


            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white hover:bg-blue-800"
            >
              {repair
                ? "حفظ التعديلات"
                : "تسجيل الصيانة"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =====================================
   DETAILS
===================================== */

function RepairDetails({
  repair,
  onClose,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  const status =
    STATUS_CONFIG[
      repair.status
    ] ||
    STATUS_CONFIG.pending;

  const StatusIcon =
    status.icon;


  const paymentStatus =
    PAYMENT_STATUS_CONFIG[
      getRepairPaymentStatus(
        repair
      )
    ] ||
    PAYMENT_STATUS_CONFIG.unpaid;

  const PaymentIcon =
    paymentStatus.icon;


  const remaining =
    getRepairRemaining(
      repair
    );


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-violet-50 text-violet-700">

              {repair.image ? (
                <img
                  src={
                    repair.image
                  }
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <Wrench
                  size={
                    21
                  }
                />
              )}

            </div>


            <div>

              <p className="text-xs font-bold text-violet-600">
                عملية صيانة
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                {
                  repair.id
                }
              </h2>

            </div>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
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

          <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center">

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
                  حالة الصيانة
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
                repair.status
              }
              onChange={(
                event
              ) =>
                onStatusChange(
                  repair,
                  event.target
                    .value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
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


          {/* Payment */}

          <div className="mb-6 rounded-2xl border border-slate-200 p-5">

            <div className="flex items-center justify-between gap-4">

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


              <div className="text-left">

                <p className="text-xs font-bold text-slate-400">
                  المتبقي
                </p>

                <p
                  className={`mt-1 text-xl font-black ${
                    remaining >
                    0
                      ? "text-orange-600"
                      : "text-emerald-600"
                  }`}
                >
                  {
                    remaining.toLocaleString()
                  }{" "}
                  ج.م
                </p>

              </div>

            </div>


            <div className="mt-5 grid gap-3 sm:grid-cols-3">

              <DetailMetric
                label="التكلفة"
                value={`${Number(
                  repair.cost ||
                    0
                ).toLocaleString()} ج.م`}
                icon={
                  WalletCards
                }
              />


              <DetailMetric
                label="المدفوع"
                value={`${Number(
                  repair.paidAmount ||
                    0
                ).toLocaleString()} ج.م`}
                icon={
                  CreditCard
                }
              />


              <DetailMetric
                label="المتبقي"
                value={`${remaining.toLocaleString()} ج.م`}
                icon={
                  Banknote
                }
              />

            </div>

          </div>


          {/* Main info */}

          <div className="grid gap-4 lg:grid-cols-2">

            <InfoCard title="العميل">

              <InfoLine
                icon={
                  User
                }
                label="الاسم"
                value={
                  repair.customerName ||
                  "—"
                }
              />


              <InfoLine
                icon={
                  Phone
                }
                label="الهاتف"
                value={
                  repair.phone ||
                  "بدون هاتف"
                }
              />

            </InfoCard>


            <InfoCard title="العملية">

              <InfoLine
                icon={
                  Wrench
                }
                label="نوع المنتج"
                value={
                  repair.itemType ||
                  "—"
                }
              />


              <InfoLine
                icon={
                  CalendarDays
                }
                label="تاريخ الاستلام"
                value={formatDateShort(
                  repair.receivedDate
                )}
              />


              <InfoLine
                icon={
                  CalendarDays
                }
                label="موعد التسليم"
                value={formatDateShort(
                  repair.dueDate
                )}
              />

            </InfoCard>

          </div>


          {/* Problem */}

          <div className="mt-6 grid gap-4 lg:grid-cols-2">

            <TextBlock
              title="المشكلة"
              value={
                repair.problem ||
                "—"
              }
            />


            <TextBlock
              title="التشخيص"
              value={
                repair.diagnosis ||
                "لم يتم التشخيص بعد"
              }
            />

          </div>


          {/* Image */}

          {repair.image && (
            <div className="mt-6">

              <h3 className="mb-3 font-black text-slate-900">
                صورة الحالة
              </h3>

              <div className="overflow-hidden rounded-2xl border border-slate-200">

                <img
                  src={
                    repair.image
                  }
                  alt="الصيانة"
                  className="max-h-80 w-full object-cover"
                />

              </div>

            </div>
          )}


          {/* Parts */}

          <div className="mt-6">

            <h3 className="mb-3 font-black text-slate-900">
              القطع المستخدمة
            </h3>


            {repair.parts
              ?.length ? (
              <div className="space-y-2">

                {repair.parts.map(
                  (
                    part
                  ) => (
                    <div
                      key={
                        part.productId
                      }
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-400">
                          <Package
                            size={
                              16
                            }
                          />
                        </div>


                        <span className="text-sm font-bold text-slate-700">
                          {
                            part.productName
                          }
                        </span>

                      </div>


                      <span className="font-black text-slate-900">
                        ×{" "}
                        {
                          part.quantity
                        }
                      </span>

                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">
                لا توجد قطع مستخدمة.
              </div>
            )}

          </div>


          {/* Notes */}

          {repair.notes && (
            <div className="mt-6 rounded-xl bg-slate-50 p-5">

              <p className="text-xs font-bold text-slate-400">
                ملاحظات
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {
                  repair.notes
                }
              </p>

            </div>
          )}

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

            حذف
          </button>


          <button
            type="button"
            onClick={
              onEdit
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-100"
          >
            <Pencil
              size={
                16
              }
            />

            تعديل
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
   DELETE
===================================== */

function DeleteModal({
  repair,
  onClose,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <Trash2
            size={
              21
            }
          />
        </div>


        <h2 className="mt-4 text-lg font-black text-slate-900">
          حذف عملية الصيانة؟
        </h2>


        <p className="mt-2 text-sm leading-6 text-slate-500">
          هل تريد حذف العملية{" "}
          <strong className="text-slate-800">
            {
              repair.id
            }
          </strong>
          ؟
        </p>


        <p className="mt-2 text-xs leading-5 text-red-500">
          حذف العملية لا يعكس القطع المصروفة للمخزون تلقائيًا.
          عملية المرتجع ستصبح مستقلة حتى لا تحدث حركة مخزون خاطئة.
        </p>


        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            إلغاء
          </button>


          <button
            type="button"
            onClick={
              onConfirm
            }
            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-black text-white hover:bg-red-700"
          >
            حذف
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

    green:
      "bg-emerald-50 text-emerald-600",

    purple:
      "bg-violet-50 text-violet-600",

    orange:
      "bg-orange-50 text-orange-600",
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


function MiniStat({
  label,
  value,
  icon: Icon,
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


function MiniPeriodMetric({
  label,
  value,
  warning = false,
}) {
  return (
    <div className="rounded-xl bg-white/70 px-3 py-2">

      <p className="text-[10px] font-bold text-violet-500">
        {
          label
        }
      </p>

      <p
        className={`mt-1 text-sm font-black ${
          warning
            ? "text-orange-600"
            : "text-violet-800"
        }`}
      >
        {
          value
        }
      </p>

    </div>
  );
}


function FormSection({
  title,
  children,
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 p-5">

      <h3 className="font-black text-slate-900">
        {
          title
        }
      </h3>


      <div className="space-y-4">
        {
          children
        }
      </div>

    </div>
  );
}


function TextField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">
        {
          label
        }
      </label>


      <input
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />

    </div>
  );
}


function NumberField({
  label,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">
        {
          label
        }
      </label>


      <input
        type="number"
        min="0"
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />

    </div>
  );
}


function DateField({
  label,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">
        {
          label
        }
      </label>


      <input
        type="date"
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />

    </div>
  );
}


function TextArea({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">
        {
          label
        }
      </label>


      <textarea
        rows={
          4
        }
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />

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

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
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


function TextBlock({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">

      <p className="text-xs font-bold text-slate-400">
        {
          title
        }
      </p>


      <p className="mt-2 text-sm leading-6 text-slate-700">
        {
          value
        }
      </p>

    </div>
  );
}


function DetailMetric({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex items-center justify-between">

        <p className="text-xs font-bold text-slate-400">
          {
            label
          }
        </p>


        <div className="rounded-lg bg-white p-2 text-blue-700">
          <Icon
            size={
              15
            }
          />
        </div>

      </div>


      <p className="mt-2 font-black text-slate-900">
        {
          value
        }
      </p>

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


function getRepairRemaining(
  repair
) {
  return Math.max(
    Number(
      repair.cost ||
        0
    ) -
      Number(
        repair.paidAmount ||
          0
      ),
    0
  );
}


function getRepairPaymentStatus(
  repair
) {
  const cost =
    Number(
      repair.cost ||
        0
    );

  const paid =
    Number(
      repair.paidAmount ||
        0
    );

  const remaining =
    getRepairRemaining(
      repair
    );


  if (
    cost <=
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
    Number(
      year
    ),
    Number(
      month
    ) - 1,
    Number(
      day
    )
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


function formatDateShort(
  date
) {
  if (!date) {
    return "—";
  }

  return new Date(
    date
  ).toLocaleDateString(
    "ar-EG"
  );
}


function ClipboardListIcon(
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
        x="8"
        y="3"
        width="8"
        height="4"
        rx="1"
      />

      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />

      <path d="M8 12h8" />
      <path d="M8 16h6" />
    </svg>
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


export default Repairs;