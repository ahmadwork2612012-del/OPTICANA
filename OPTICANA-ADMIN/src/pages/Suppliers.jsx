import {
  Search,
  Plus,
  Truck,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Trash2,
  X,
  Receipt,
  CreditCard,
  WalletCards,
  Eye,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Banknote,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  History,
  CircleDollarSign,
  ShoppingBag,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import useSupplierStore from "../store/supplierStore";
import usePurchaseStore from "../store/purchaseStore";
import usePaymentStore from "../store/paymentStore";


const PAYMENT_STATUS_CONFIG = {
  paid: {
    label: "مسدد بالكامل",
    className:
      "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  },

  partial: {
    label: "مسدد جزئيًا",
    className:
      "bg-orange-50 text-orange-600",
    icon: Clock3,
  },

  unpaid: {
    label: "غير مسدد",
    className:
      "bg-red-50 text-red-600",
    icon: AlertTriangle,
  },
};


function Suppliers() {
  const suppliers =
    useSupplierStore(
      (state) =>
        state.suppliers
    );

  const addSupplier =
    useSupplierStore(
      (state) =>
        state.addSupplier
    );

  const fetchSuppliers =
    useSupplierStore(
      (state) =>
        state.fetchSuppliers
    );

  const updateSupplier =
    useSupplierStore(
      (state) =>
        state.updateSupplier
    );

  const deleteSupplier =
    useSupplierStore(
      (state) =>
        state.deleteSupplier
    );


  const purchases =
    usePurchaseStore(
      (state) =>
        state.purchases
    );

  const fetchPurchases =
    usePurchaseStore(
      (state) =>
        state.fetchPurchases
    );


  const payments =
    usePaymentStore(
      (state) =>
        state.payments
    );

  const addPayment =
    usePaymentStore(
      (state) =>
        state.addPayment
    );

  const fetchSupplierPayments =
    usePaymentStore(
      (state) =>
        state.fetchSupplierPayments
    );


  /* =====================================
     UI
  ===================================== */

  const [search, setSearch] =
    useState("");

  const [
    supplierFilter,
    setSupplierFilter,
  ] = useState("all");

  const [
    showAllSuppliers,
    setShowAllSuppliers,
  ] = useState(false);

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingSupplier,
    setEditingSupplier,
  ] = useState(null);

  const [
    selectedSupplier,
    setSelectedSupplier,
  ] = useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [
    paymentTarget,
    setPaymentTarget,
  ] = useState(null);

  const [
    paymentAmount,
    setPaymentAmount,
  ] = useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("cash");

  useEffect(() => {
    Promise.all([fetchSuppliers(), fetchPurchases()]).catch((error) => {
      toast.error(error?.message || "تعذر تحميل بيانات الموردين");
    });
  }, [fetchSuppliers, fetchPurchases]);


  /* =====================================
     SUPPLIER HELPERS
  ===================================== */

  const getSupplierPurchases =
    (
      supplierId
    ) => {
      return purchases
        .filter(
          (purchase) =>
            String(
              purchase.supplierId
            ) ===
            String(
              supplierId
            )
        )
        .sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
        );
    };


  const getSupplierPayments =
    (
      supplierId
    ) => {
      return payments
        .filter(
          (payment) =>
            payment.type === "purchase_payment" &&
            String(payment.supplierId) === String(supplierId)
        )
        .sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
        );
    };


  const getSupplierStats =
    (
      supplierId
    ) => {
      const supplierPurchases =
        getSupplierPurchases(
          supplierId
        );

      const supplierPayments =
        getSupplierPayments(
          supplierId
        );

      const totalPurchases =
        supplierPurchases.reduce(
          (
            sum,
            purchase
          ) =>
            sum +
            Number(
              purchase.total ||
                0
            ),
          0
        );

      const totalPaid =
        Math.max(
          supplierPayments.reduce(
            (sum, payment) =>
              sum + Number(payment.amount || 0),
            0
          ),
          0
        );

      const remaining =
        Math.max(
          totalPurchases -
            totalPaid,
          0
        );

      return {
        purchases:
          supplierPurchases.length,

        totalPurchases,

        totalPaid,

        remaining,

        paymentCount:
          supplierPayments.length,

        payments:
          supplierPayments,

        lastPurchase:
          supplierPurchases[0] ||
          null,

        lastPayment:
          supplierPayments[0] ||
          null,
      };
    };


  /* =====================================
     FILTER
  ===================================== */

  const filteredSuppliers =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      return suppliers.filter(
        (supplier) => {
          const matchesSearch =
            !value ||
            supplier.name
              ?.toLowerCase()
              .includes(value) ||
            supplier.phone
              ?.toLowerCase()
              .includes(value) ||
            supplier.email
              ?.toLowerCase()
              .includes(value) ||
            supplier.company
              ?.toLowerCase()
              .includes(value);

          const stats =
            getSupplierStats(
              supplier.id
            );

          const matchesFilter =
            supplierFilter ===
              "all"
              ? true
              : supplierFilter ===
                  "debt"
                ? stats.remaining >
                  0
                : supplierFilter ===
                    "clear"
                  ? stats.remaining ===
                    0
                  : true;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      suppliers,
      purchases,
      payments,
      search,
      supplierFilter,
    ]);


  /* =====================================
     LAST 24 HOURS
  ===================================== */

  const recentSuppliers =
    useMemo(() => {
      const cutoff =
        Date.now() -
        24 *
          60 *
          60 *
          1000;

      const activeSupplierIds =
        new Set(
          purchases
            .filter(
              (purchase) =>
                new Date(
                  purchase.createdAt ||
                    0
                ).getTime() >=
                cutoff
            )
            .map(
              (purchase) =>
                String(
                  purchase.supplierId
                )
            )
        );

      return suppliers.filter(
        (supplier) =>
          activeSupplierIds.has(
            String(
              supplier.id
            )
          )
      );
    }, [
      suppliers,
      purchases,
    ]);


  const visibleSuppliers =
    showAllSuppliers
      ? filteredSuppliers
      : filteredSuppliers.filter(
          (supplier) =>
            recentSuppliers.some(
              (recent) =>
                String(
                  recent.id
                ) ===
                String(
                  supplier.id
                )
            )
        );


  /* =====================================
     GLOBAL STATS
  ===================================== */

  const totalSuppliers =
    suppliers.length;


  const totalPurchases =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.total ||
            0
        ),
      0
    );


  const totalPaid =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.paidAmount ||
            0
        ),
      0
    );


  const totalRemaining =
    Math.max(
      totalPurchases -
        totalPaid,
      0
    );


  const suppliersWithDebt =
    suppliers.filter(
      (supplier) =>
        getSupplierStats(
          supplier.id
        ).remaining > 0
    ).length;


  const recentPurchaseValue =
    purchases
      .filter(
        (purchase) =>
          Date.now() -
            new Date(
              purchase.createdAt ||
                0
            ).getTime() <=
          24 *
            60 *
            60 *
            1000
      )
      .reduce(
        (sum, purchase) =>
          sum +
          Number(
            purchase.total ||
              0
          ),
        0
      );


  /* =====================================
     FORM
  ===================================== */

  const openAddForm =
    () => {
      setEditingSupplier(
        null
      );

      setShowForm(
        true
      );
    };


  const openEditForm =
    (
      supplier
    ) => {
      setEditingSupplier(
        supplier
      );

      setShowForm(
        true
      );

      setSelectedSupplier(
        null
      );
    };


  const closeForm =
    () => {
      setShowForm(
        false
      );

      setEditingSupplier(
        null
      );
    };


  const handleSubmit =
    (
      data
    ) => {
      if (
        editingSupplier
      ) {
        updateSupplier(
          editingSupplier.id,
          data
        );

        toast.success(
          "تم تحديث بيانات المورد"
        );
      } else {
        addSupplier(
          data
        );

        toast.success(
          "تمت إضافة المورد بنجاح"
        );
      }

      closeForm();
    };


  /* =====================================
     PAYMENT
  ===================================== */

  const openPaymentModal =
    async (
      supplier
    ) => {
      try {
        await Promise.all([
          fetchPurchases(),
          fetchSupplierPayments(supplier.id),
        ]);
      } catch (error) {
        toast.error(error?.message || "تعذر تحديث رصيد المورد");
        return;
      }

      const stats =
        getSupplierStats(
          supplier.id
        );

      if (
        stats.remaining <=
        0
      ) {
        toast.success(
          "لا يوجد مبلغ مستحق لهذا المورد"
        );

        return;
      }

      setPaymentTarget(
        supplier
      );

      setPaymentAmount(
        ""
      );

      setPaymentMethod(
        "cash"
      );
    };


  const closePaymentModal =
    () => {
      setPaymentTarget(
        null
      );

      setPaymentAmount(
        ""
      );

      setPaymentMethod(
        "cash"
      );
    };


  const handleSupplierPayment = async () => {
    if (!paymentTarget) return;

    const stats = getSupplierStats(paymentTarget.id);
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) { toast.error("أدخل مبلغًا صحيحًا"); return; }
    if (amount > stats.remaining) { toast.error(`المبلغ أكبر من المتبقي ${stats.remaining.toLocaleString()} ج.م`); return; }

    let remainingToApply = amount;
    const affected = getSupplierPurchases(paymentTarget.id)
      .filter((purchase) => String(purchase.status || "").toLowerCase() !== "void")
      .map((purchase) => ({
        purchase,
        remaining: Math.max(Number(purchase.total || 0) - Number(purchase.paidAmount || 0), 0),
      }))
      .filter((entry) => entry.remaining > 0);

    try {
      for (const entry of affected) {
        if (remainingToApply <= 0) break;
        const applied = Math.min(remainingToApply, entry.remaining);
        await addPayment({
          supplierId: paymentTarget.id,
          supplierName: paymentTarget.name,
          purchaseId: entry.purchase.id,
          amount: applied,
          method: paymentMethod,
          type: "purchase_payment",
          source: "admin",
          note: `دفعة للمورد — الفاتورة ${entry.purchase.invoiceNumber || entry.purchase.id}`,
        });
        remainingToApply -= applied;
      }
      if (remainingToApply > 0) {
        throw new Error("تعذر توزيع كامل دفعة المورد على الفواتير المستحقة");
      }
      await Promise.all([
        fetchPurchases(),
        fetchSuppliers(),
        fetchSupplierPayments(paymentTarget.id),
      ]);
      toast.success(`تم تسجيل دفعة ${amount.toLocaleString()} ج.م للمورد`);
      closePaymentModal();
    } catch (error) {
      toast.error(error?.message || "تعذر تسجيل دفعة المورد");
    }
  };

  /* =====================================
     DELETE
  ===================================== */

  const confirmDelete =
    () => {
      if (
        !deleteTarget
      ) {
        return;
      }

      const stats =
        getSupplierStats(
          deleteTarget.id
        );

      if (
        stats.remaining >
        0
      ) {
        toast.error(
          "لا يمكن حذف مورد لديه مبلغ مستحق. قم بتسديد الرصيد أولًا."
        );

        return;
      }

      deleteSupplier(
        deleteTarget.id
      );

      if (
        selectedSupplier?.id ===
        deleteTarget.id
      ) {
        setSelectedSupplier(
          null
        );
      }

      toast.success(
        "تم حذف المورد"
      );

      setDeleteTarget(
        null
      );
    };


  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
            <Truck size={15} />
            إدارة الموردين
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            الموردون
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            إدارة الموردين والمشتريات والأرصدة والمدفوعات
            وسجل التعاملات المالية من مكان واحد.
          </p>

        </div>


        <button
          type="button"
          onClick={
            openAddForm
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-800"
        >
          <Plus size={18} />
          إضافة مورد
        </button>

      </div>


      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <SummaryCard
          icon={
            Truck
          }
          title="إجمالي الموردين"
          value={
            totalSuppliers
          }
        />

        <SummaryCard
          icon={
            Receipt
          }
          title="إجمالي المشتريات"
          value={`${totalPurchases.toLocaleString()} ج.م`}
          accent="purple"
        />

        <SummaryCard
          icon={
            CreditCard
          }
          title="إجمالي المدفوع"
          value={`${totalPaid.toLocaleString()} ج.م`}
          accent="green"
        />

        <SummaryCard
          icon={
            WalletCards
          }
          title="المستحق للموردين"
          value={`${totalRemaining.toLocaleString()} ج.م`}
          accent="orange"
        />

        <SummaryCard
          icon={
            AlertTriangle
          }
          title="عليهم أرصدة"
          value={
            suppliersWithDebt
          }
          accent="red"
        />

      </div>


      {/* Recent Activity */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-white p-2 text-blue-700 shadow-sm">
              <History size={19} />
            </div>

            <div>

              <p className="font-black text-blue-900">
                حركة الموردين
              </p>

              <p className="mt-1 text-xs text-blue-700/70">
                {recentSuppliers.length} مورد لديهم نشاط شراء
                خلال آخر 24 ساعة.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-2 gap-2">

            <MiniPeriod
              label="موردون نشطون"
              value={
                recentSuppliers.length
              }
            />

            <MiniPeriod
              label="قيمة المشتريات"
              value={`${recentPurchaseValue.toLocaleString()} ج.م`}
            />

          </div>

        </div>

      </div>


      {/* Filters */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-3 xl:flex-row">

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
                  event.target.value
                )
              }
              placeholder="ابحث باسم المورد أو الشركة أو الهاتف..."
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


          <select
            value={
              supplierFilter
            }
            onChange={(
              event
            ) =>
              setSupplierFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:border-blue-500 xl:w-52"
          >

            <option value="all">
              كل الموردين
            </option>

            <option value="debt">
              عليهم مستحقات
            </option>

            <option value="clear">
              بدون مستحقات
            </option>

          </select>

        </div>


        <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">

          <div>

            <p className="text-sm font-black text-slate-800">
              {showAllSuppliers
                ? "السجل الكامل"
                : "الموردون ذوو النشاط الأخير"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {
                visibleSuppliers.length
              }{" "}
              مورد مطابق
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              setShowAllSuppliers(
                (value) =>
                  !value
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
          >

            {showAllSuppliers ? (
              <>
                <ChevronUp
                  size={17}
                />

                عرض النشاط الأخير
              </>
            ) : (
              <>
                عرض كل الموردين

                <ChevronDown
                  size={17}
                />
              </>
            )}

          </button>

        </div>

      </div>


      {/* Suppliers */}

      {visibleSuppliers.length ===
      0 ? (
        <EmptySuppliers
          hasFilters={
            Boolean(
              search
            ) ||
            supplierFilter !==
              "all"
          }
          onAdd={
            openAddForm
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {visibleSuppliers.map(
            (
              supplier
            ) => {
              const stats =
                getSupplierStats(
                  supplier.id
                );

              return (
                <SupplierCard
                  key={
                    supplier.id
                  }
                  supplier={
                    supplier
                  }
                  stats={
                    stats
                  }
                  onEdit={() =>
                    openEditForm(
                      supplier
                    )
                  }
                  onView={() =>
                    setSelectedSupplier(
                      supplier
                    )
                  }
                  onPayment={() =>
                    openPaymentModal(
                      supplier
                    )
                  }
                  onDelete={() =>
                    setDeleteTarget(
                      supplier
                    )
                  }
                />
              );
            }
          )}

        </div>
      )}


      {/* Add/Edit */}

      {showForm && (
        <SupplierForm
          supplier={
            editingSupplier
          }
          onClose={
            closeForm
          }
          onSubmit={
            handleSubmit
          }
        />
      )}


      {/* Profile */}

      {selectedSupplier && (
        <SupplierDetails
          supplier={
            selectedSupplier
          }
          purchases={
            getSupplierPurchases(
              selectedSupplier.id
            )
          }
          payments={
            getSupplierPayments(
              selectedSupplier.id
            )
          }
          stats={
            getSupplierStats(
              selectedSupplier.id
            )
          }
          onClose={() =>
            setSelectedSupplier(
              null
            )
          }
          onEdit={() =>
            openEditForm(
              selectedSupplier
            )
          }
          onPayment={() =>
            openPaymentModal(
              selectedSupplier
            )
          }
        />
      )}


      {/* Payment */}

      {paymentTarget && (
        <SupplierPaymentModal
          supplier={
            paymentTarget
          }
          stats={
            getSupplierStats(
              paymentTarget.id
            )
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
            handleSupplierPayment
          }
        />
      )}


      {/* Delete */}

      {deleteTarget && (
        <DeleteModal
          supplier={
            deleteTarget
          }
          stats={
            getSupplierStats(
              deleteTarget.id
            )
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
   CARD
===================================== */

function SupplierCard({
  supplier,
  stats,
  onEdit,
  onView,
  onPayment,
  onDelete,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-start justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-black text-blue-700">
            {supplier.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0">

            <h2 className="truncate font-black text-slate-900">
              {
                supplier.name
              }
            </h2>

            <p className="mt-1 truncate text-xs text-slate-400">
              {
                supplier.company ||
                "مورد مستقل"
              }
            </p>

          </div>

        </div>


        <div className="flex gap-1">

          <button
            type="button"
            onClick={
              onEdit
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700"
            title="تعديل"
          >
            <Pencil
              size={
                16
              }
            />
          </button>


          <button
            type="button"
            onClick={
              onDelete
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
            title="حذف"
          >
            <Trash2
              size={
                16
              }
            />
          </button>

        </div>

      </div>


      <div className="mt-5 space-y-2">

        {supplier.phone && (
          <ContactLine
            icon={
              Phone
            }
            value={
              supplier.phone
            }
          />
        )}

        {supplier.email && (
          <ContactLine
            icon={
              Mail
            }
            value={
              supplier.email
            }
          />
        )}

        {supplier.address && (
          <ContactLine
            icon={
              MapPin
            }
            value={
              supplier.address
            }
          />
        )}

        {!supplier.phone &&
          !supplier.email &&
          !supplier.address && (
            <p className="text-sm text-slate-400">
              لا توجد بيانات تواصل إضافية.
            </p>
          )}

      </div>


      <div className="mt-5 grid grid-cols-2 gap-2">

        <StatBox
          label="الفواتير"
          value={
            stats.purchases
          }
        />

        <StatBox
          label="المشتريات"
          value={`${stats.totalPurchases.toLocaleString()} ج.م`}
          blue
        />

        <StatBox
          label="المدفوع"
          value={`${stats.totalPaid.toLocaleString()} ج.م`}
          green
        />

        <StatBox
          label="المتبقي"
          value={`${stats.remaining.toLocaleString()} ج.م`}
          orange={
            stats.remaining >
            0
          }
        />

      </div>


      {stats.remaining >
      0 ? (
        <div className="mt-4 rounded-xl bg-orange-50 p-3">

          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-2">

              <WalletCards
                size={
                  15
                }
                className="text-orange-600"
              />

              <span className="text-xs font-black text-orange-700">
                رصيد مستحق
              </span>

            </div>

            <span className="text-sm font-black text-orange-700">
              {
                stats.remaining.toLocaleString()
              }{" "}
              ج.م
            </span>

          </div>

        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-emerald-50 p-3">

          <div className="flex items-center gap-2 text-emerald-700">

            <CheckCircle2
              size={
                15
              }
            />

            <span className="text-xs font-black">
              لا توجد مستحقات
            </span>

          </div>

        </div>
      )}


      <div className="mt-4 border-t border-slate-100 pt-4">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-[11px] font-bold text-slate-400">
              آخر عملية شراء
            </p>

            <p className="mt-1 text-xs font-bold text-slate-600">
              {stats.lastPurchase
                ? stats
                    .lastPurchase
                    .invoiceNumber ||
                  stats
                    .lastPurchase
                    .id
                : "لا توجد"}

            </p>

          </div>


          <div className="text-left">

            {stats.lastPurchase && (
              <p className="text-[11px] text-slate-400">
                {formatDateShort(
                  stats
                    .lastPurchase
                    .createdAt
                )}
              </p>
            )}

          </div>

        </div>

      </div>


      <div className="mt-4 grid grid-cols-2 gap-2">

        <button
          type="button"
          onClick={
            onView
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-sm font-black text-slate-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <Eye
            size={
              16
            }
          />

          الملف
        </button>


        <button
          type="button"
          onClick={
            onPayment
          }
          disabled={
            stats.remaining <=
            0
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-orange-50 py-3 text-sm font-black text-orange-600 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CreditCard
            size={
              16
            }
          />

          تسديد
        </button>

      </div>

    </div>
  );
}


/* =====================================
   DETAILS
===================================== */

function SupplierDetails({
  supplier,
  purchases,
  payments,
  stats,
  onClose,
  onEdit,
  onPayment,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-blue-700">
              {supplier.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <p className="text-xs font-bold text-blue-600">
                ملف المورد
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                {
                  supplier.name
                }
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {
                  supplier.company ||
                  "مورد مستقل"
                }
              </p>

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

          {/* KPIs */}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">

            <DetailMetric
              label="الفواتير"
              value={
                stats.purchases
              }
              icon={
                Receipt
              }
            />

            <DetailMetric
              label="المشتريات"
              value={`${stats.totalPurchases.toLocaleString()} ج.م`}
              icon={
                ShoppingBag
              }
            />

            <DetailMetric
              label="المدفوع"
              value={`${stats.totalPaid.toLocaleString()} ج.م`}
              icon={
                CreditCard
              }
              positive
            />

            <DetailMetric
              label="المتبقي"
              value={`${stats.remaining.toLocaleString()} ج.م`}
              icon={
                WalletCards
              }
              warning={
                stats.remaining >
                0
              }
            />

            <DetailMetric
              label="دفعات"
              value={
                stats.paymentCount
              }
              icon={
                Banknote
              }
            />

          </div>


          {/* Contact */}

          <div className="mt-6 grid gap-4 lg:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-black text-slate-900">
                    بيانات المورد
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    بيانات التواصل الأساسية.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    onEdit
                  }
                  className="rounded-xl bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 hover:bg-blue-100"
                >
                  تعديل
                </button>

              </div>


              <div className="mt-5 space-y-3">

                <ContactLine
                  icon={
                    UserRoundIcon
                  }
                  value={
                    supplier.name
                  }
                />

                {supplier.phone && (
                  <ContactLine
                    icon={
                      Phone
                    }
                    value={
                      supplier.phone
                    }
                  />
                )}

                {supplier.email && (
                  <ContactLine
                    icon={
                      Mail
                    }
                    value={
                      supplier.email
                    }
                  />
                )}

                {supplier.address && (
                  <ContactLine
                    icon={
                      MapPin
                    }
                    value={
                      supplier.address
                    }
                  />
                )}

              </div>

            </div>


            <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold text-orange-500">
                    الرصيد المستحق
                  </p>

                  <p className="mt-1 text-3xl font-black text-orange-700">
                    {
                      stats.remaining.toLocaleString()
                    }{" "}
                    ج.م
                  </p>

                </div>


                <WalletCards
                  size={
                    24
                  }
                  className="text-orange-600"
                />

              </div>


              <button
                type="button"
                onClick={
                  onPayment
                }
                disabled={
                  stats.remaining <=
                  0
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-black text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                <CreditCard
                  size={
                    17
                  }
                />

                تسجيل دفعة للمورد
              </button>

            </div>

          </div>


          {/* Purchase history */}

          <div className="mt-6 rounded-2xl border border-slate-200 overflow-hidden">

            <div className="border-b border-slate-200 p-5">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                  <Receipt
                    size={
                      18
                    }
                  />
                </div>

                <div>

                  <h3 className="font-black text-slate-900">
                    سجل المشتريات
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    جميع فواتير الشراء المرتبطة بهذا المورد.
                  </p>

                </div>

              </div>

            </div>


            {purchases.length ===
            0 ? (
              <div className="p-10 text-center text-sm text-slate-400">
                لا توجد مشتريات لهذا المورد.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">

                {purchases.map(
                  (
                    purchase
                  ) => {
                    const remaining =
                      Math.max(
                        Number(
                          purchase.total ||
                            0
                        ) -
                          Number(
                            purchase.paidAmount ||
                              0
                          ),
                        0
                      );

                    return (
                      <div
                        key={
                          purchase.id
                        }
                        className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                      >

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                            <Receipt
                              size={
                                17
                              }
                            />
                          </div>

                          <div>

                            <p className="font-black text-slate-800">
                              {
                                purchase.invoiceNumber ||
                                purchase.id
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {
                                getPurchaseQuantity(
                                  purchase
                                )
                              }{" "}
                              قطعة •{" "}
                              {formatDateShort(
                                purchase.createdAt
                              )}
                            </p>

                          </div>

                        </div>


                        <div className="text-left">

                          <p className="font-black text-slate-900">
                            {Number(
                              purchase.total ||
                                0
                            ).toLocaleString()}{" "}
                            ج.م
                          </p>

                          <p
                            className={`mt-1 text-xs font-bold ${
                              remaining >
                              0
                                ? "text-orange-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {remaining >
                            0
                              ? `متبقي ${remaining.toLocaleString()} ج.م`
                              : "مدفوع بالكامل"}
                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>


          {/* Payment history */}

          <div className="mt-6 rounded-2xl border border-slate-200 overflow-hidden">

            <div className="border-b border-slate-200 p-5">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                  <History
                    size={
                      18
                    }
                  />
                </div>

                <div>

                  <h3 className="font-black text-slate-900">
                    سجل المدفوعات
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    جميع الدفعات المسجلة لهذا المورد.
                  </p>

                </div>

              </div>

            </div>


            {payments.length ===
            0 ? (
              <div className="p-10 text-center text-sm text-slate-400">
                لا توجد دفعات مسجلة لهذا المورد.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">

                {payments.map(
                  (
                    payment
                  ) => (
                    <div
                      key={
                        payment.id
                      }
                      className="flex items-center justify-between gap-4 p-5"
                    >

                      <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                          {payment.method ===
                          "card" ? (
                            <CreditCard
                              size={
                                17
                              }
                            />
                          ) : (
                            <Banknote
                              size={
                                17
                              }
                            />
                          )}
                        </div>


                        <div>

                          <p className="font-black text-slate-800">
                            دفعة للمورد
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(
                              payment.createdAt
                            )}
                          </p>

                        </div>

                      </div>


                      <div className="text-left">

                        <p className="font-black text-emerald-600">
                          +{" "}
                          {Number(
                            payment.amount ||
                              0
                          ).toLocaleString()}{" "}
                          ج.م
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {payment.method ===
                          "card"
                            ? "بطاقة"
                            : "كاش"}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>


          {/* Notes */}

          {supplier.notes && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold text-slate-400">
                ملاحظات
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {
                  supplier.notes
                }
              </p>

            </div>
          )}

        </div>


        <div className="border-t border-slate-200 bg-slate-50 p-5">

          <button
            type="button"
            onClick={
              onClose
            }
            className="w-full rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white hover:bg-blue-800"
          >
            إغلاق ملف المورد
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   PAYMENT MODAL
===================================== */

function SupplierPaymentModal({
  supplier,
  stats,
  amount,
  setAmount,
  method,
  setMethod,
  onClose,
  onSubmit,
}) {
  const numericAmount =
    Math.min(
      Math.max(
        Number(
          amount
        ) || 0,
        0
      ),
      stats.remaining
    );

  const afterPayment =
    Math.max(
      stats.remaining -
        numericAmount,
      0
    );


  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div>

            <p className="text-xs font-bold text-orange-600">
              تحصيل / سداد
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-900">
              دفعة للمورد
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {
                supplier.name
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
            <X
              size={
                20
              }
            />
          </button>

        </div>


        <div className="space-y-5 p-6">

          <div className="grid grid-cols-2 gap-3">

            <FinancialBox
              label="المستحق"
              value={`${stats.remaining.toLocaleString()} ج.م`}
              warning
            />

            <FinancialBox
              label="بعد الدفعة"
              value={`${afterPayment.toLocaleString()} ج.م`}
              positive={
                numericAmount >
                  0 &&
                afterPayment ===
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
                      stats.remaining
                    )
                  )
                }
                className="text-xs font-black text-orange-600"
              >
                تسديد كامل
              </button>

            </div>


            <input
              type="number"
              min="0"
              max={
                stats.remaining
              }
              value={
                amount
              }
              onChange={(
                event
              ) =>
                setAmount(
                  event.target.value
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
                  size={
                    17
                  }
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
                  size={
                    17
                  }
                />

                بطاقة
              </button>

            </div>

          </div>


          <div className="rounded-xl bg-slate-50 p-4">

            <div className="flex items-center justify-between text-sm">

              <span className="text-slate-500">
                حالة المورد
              </span>

              <span
                className={`font-black ${
                  afterPayment ===
                  0
                    ? "text-emerald-600"
                    : "text-orange-600"
                }`}
              >
                {afterPayment ===
                0
                  ? "مسدد بالكامل"
                  : "يوجد رصيد"}
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
              size={
                17
              }
            />

            تسجيل الدفعة
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   FORM
===================================== */

function SupplierForm({
  supplier,
  onClose,
  onSubmit,
}) {
  const [form, setForm] =
    useState({
      name:
        supplier?.name ||
        "",

      company:
        supplier?.company ||
        "",

      phone:
        supplier?.phone ||
        "",

      email:
        supplier?.email ||
        "",

      address:
        supplier?.address ||
        "",

      notes:
        supplier?.notes ||
        "",
    });


  const updateField =
    (
      key,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,
          [key]:
            value,
        })
      );
    };


  const submit =
    (
      event
    ) => {
      event.preventDefault();

      const name =
        form.name.trim();

      if (!name) {
        toast.error(
          "أدخل اسم المورد"
        );

        return;
      }

      onSubmit({
        ...form,

        name,

        company:
          form.company.trim(),

        phone:
          form.phone.trim(),

        email:
          form.email.trim(),

        address:
          form.address.trim(),

        notes:
          form.notes.trim(),
      });
    };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div>

            <p className="text-xs font-bold text-blue-600">
              قاعدة الموردين
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {supplier
                ? "تعديل المورد"
                : "إضافة مورد"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              بيانات المورد الأساسية.
            </p>

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
          className="max-h-[78vh] space-y-4 overflow-y-auto p-6"
        >

          <TextField
            label="اسم المورد"
            value={
              form.name
            }
            onChange={(
              value
            ) =>
              updateField(
                "name",
                value
              )
            }
            required
            placeholder="مثال: شركة النور"
          />


          <TextField
            label="اسم الشركة"
            value={
              form.company
            }
            onChange={(
              value
            ) =>
              updateField(
                "company",
                value
              )
            }
            placeholder="اسم الشركة"
          />


          <div className="grid gap-4 sm:grid-cols-2">

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


            <TextField
              label="البريد الإلكتروني"
              value={
                form.email
              }
              onChange={(
                value
              ) =>
                updateField(
                  "email",
                  value
                )
              }
              placeholder="supplier@email.com"
            />

          </div>


          <TextField
            label="العنوان"
            value={
              form.address
            }
            onChange={(
              value
            ) =>
              updateField(
                "address",
                value
              )
            }
            placeholder="عنوان المورد"
          />


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
            placeholder="ملاحظات إضافية..."
          />


          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={
                onClose
              }
              className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              إلغاء
            </button>


            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white hover:bg-blue-800"
            >
              {supplier
                ? "حفظ التعديلات"
                : "إضافة المورد"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =====================================
   DELETE
===================================== */

function DeleteModal({
  supplier,
  stats,
  onClose,
  onConfirm,
}) {
  const hasHistory =
    stats.purchases >
      0 ||
    stats.paymentCount >
      0;

  const hasDebt =
    stats.remaining >
    0;


  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <Trash2
            size={
              21
            }
          />
        </div>


        <h2 className="mt-4 text-lg font-black text-slate-900">
          حذف المورد؟
        </h2>


        <p className="mt-2 text-sm leading-6 text-slate-500">
          هل تريد حذف المورد{" "}
          <strong className="text-slate-800">
            {
              supplier.name
            }
          </strong>
          ؟
        </p>


        {hasDebt && (
          <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold leading-5 text-red-700">
            لا يمكن حذف المورد حاليًا لأن عليه رصيدًا
            مستحقًا قدره{" "}
            {
              stats.remaining.toLocaleString()
            }{" "}
            ج.م. قم بتسديده أولًا.
          </div>
        )}


        {!hasDebt &&
          hasHistory && (
            <div className="mt-3 rounded-xl bg-orange-50 p-3 text-xs font-bold leading-5 text-orange-700">
              لدى المورد تاريخ مالي في النظام.
              سيتم حذف ملف المورد فقط، ولن يتم حذف
              فواتير الشراء أو سجلات الدفعات السابقة.
            </div>
          )}


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
            disabled={
              hasDebt
            }
            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            حذف المورد
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   EMPTY
===================================== */

function EmptySuppliers({
  hasFilters,
  onAdd,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
        <Truck
          size={
            32
          }
        />
      </div>


      <h2 className="mt-4 font-black text-slate-700">
        {hasFilters
          ? "لا يوجد مورد مطابق"
          : "لا يوجد موردون حتى الآن"}
      </h2>


      <p className="mt-2 text-sm text-slate-400">
        {hasFilters
          ? "جرّب تغيير البحث أو الفلاتر."
          : "أضف أول مورد إلى النظام."}
      </p>


      {!hasFilters && (
        <button
          type="button"
          onClick={
            onAdd
          }
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
        >
          <Plus
            size={
              17
            }
          />

          إضافة مورد
        </button>
      )}

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

    purple:
      "bg-violet-50 text-violet-600",

    green:
      "bg-emerald-50 text-emerald-600",

    orange:
      "bg-orange-50 text-orange-600",

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
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors[accent]}`}
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


function DetailMetric({
  label,
  value,
  icon: Icon,
  positive = false,
  warning = false,
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        warning
          ? "border-orange-100 bg-orange-50"
          : positive
            ? "border-emerald-100 bg-emerald-50"
            : "border-slate-200 bg-white"
      }`}
    >

      <div className="flex items-center justify-between">

        <p
          className={`text-xs font-bold ${
            warning
              ? "text-orange-500"
              : positive
                ? "text-emerald-500"
                : "text-slate-400"
          }`}
        >
          {
            label
          }
        </p>


        <div
          className={`rounded-lg p-2 ${
            warning
              ? "bg-white text-orange-600"
              : positive
                ? "bg-white text-emerald-600"
                : "bg-blue-50 text-blue-700"
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
        className={`mt-3 text-lg font-black ${
          warning
            ? "text-orange-700"
            : positive
              ? "text-emerald-700"
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


function StatBox({
  label,
  value,
  blue = false,
  green = false,
  orange = false,
}) {
  let className =
    "bg-slate-50 text-slate-800";


  if (blue) {
    className =
      "bg-blue-50 text-blue-700";
  }


  if (green) {
    className =
      "bg-emerald-50 text-emerald-600";
  }


  if (orange) {
    className =
      "bg-orange-50 text-orange-600";
  }


  return (
    <div
      className={`rounded-xl p-3 ${className}`}
    >

      <p className="text-[10px] font-bold opacity-70">
        {
          label
        }
      </p>

      <p className="mt-1 text-sm font-black">
        {
          value
        }
      </p>

    </div>
  );
}


function MiniPeriod({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-white/75 px-3 py-2">

      <p className="text-[10px] font-bold text-slate-400">
        {
          label
        }
      </p>

      <p className="mt-1 text-sm font-black text-slate-800">
        {
          value
        }
      </p>

    </div>
  );
}


function FinancialBox({
  label,
  value,
  positive = false,
  warning = false,
}) {
  return (
    <div
      className={`rounded-xl p-4 ${
        warning
          ? "bg-orange-50"
          : positive
            ? "bg-emerald-50"
            : "bg-slate-50"
      }`}
    >

      <p
        className={`text-xs font-bold ${
          warning
            ? "text-orange-500"
            : positive
              ? "text-emerald-500"
              : "text-slate-400"
        }`}
      >
        {
          label
        }
      </p>


      <p
        className={`mt-2 font-black ${
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


function ContactLine({
  icon: Icon,
  value,
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">

      <Icon
        size={
          15
        }
        className="shrink-0 text-slate-400"
      />

      <span className="truncate">
        {
          value
        }
      </span>

    </div>
  );
}


function TextField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">

        {
          label
        }

        {required && (
          <span className="mr-1 text-red-500">
            *
          </span>
        )}

      </label>


      <input
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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
          3
        }
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
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


/* =====================================
   HELPERS
===================================== */

function getPurchaseQuantity(
  purchase
) {
  return (
    purchase.items?.reduce(
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


function UserRoundIcon(
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
      <circle
        cx="12"
        cy="8"
        r="4"
      />

      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}


export default Suppliers;