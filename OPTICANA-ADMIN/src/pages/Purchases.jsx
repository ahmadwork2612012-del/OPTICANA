import {
  Search,
  Plus,
  ShoppingBag,
  Truck,
  Package,
  Receipt,
  CreditCard,
  Banknote,
  WalletCards,
  Eye,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  CalendarDays,
  History,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import usePurchaseStore from "../store/purchaseStore";
import useProductStore from "../store/productStore";
import useSupplierStore from "../store/supplierStore";


/* =====================================
   PAYMENT STATUS
===================================== */

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
    label: "آجلة / غير مدفوعة",
    className:
      "bg-red-50 text-red-600",
    icon: AlertTriangle,
  },
};


/* =====================================
   PAGE
===================================== */

function Purchases() {
  /* =====================================
     PURCHASE STORE
  ===================================== */

  const purchases =
    usePurchaseStore(
      (state) =>
        state.purchases
    );

  const addPurchase =
    usePurchaseStore(
      (state) =>
        state.addPurchase
    );

  const createDraftPurchase =
    usePurchaseStore(
      (state) =>
        state.createDraftPurchase
    );

  const receivePurchase =
    usePurchaseStore(
      (state) =>
        state.receivePurchase
    );

  const updatePurchase =
    usePurchaseStore(
      (state) =>
        state.updatePurchase
    );

  const voidPurchase =
    usePurchaseStore(
      (state) =>
        state.voidPurchase
    );

  const fetchPurchases =
    usePurchaseStore(
      (state) =>
        state.fetchPurchases
    );


  /* =====================================
     PRODUCT STORE
     Products are read-only here.
     Stock changes happen in backend.
  ===================================== */

  const products =
    useProductStore(
      (state) =>
        state.products
    );


  /* =====================================
     SUPPLIER STORE
  ===================================== */

  const suppliers =
    useSupplierStore(
      (state) =>
        state.suppliers
    );

  const createSupplier =
    useSupplierStore(
      (state) =>
        state.createSupplier
    );

  const fetchSuppliers =
    useSupplierStore(
      (state) =>
        state.fetchSuppliers
    );


  /* =====================================
     UI STATE
  ===================================== */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    paymentFilter,
    setPaymentFilter,
  ] = useState("all");

  const [
    selectedPurchase,
    setSelectedPurchase,
  ] = useState(null);

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingPurchase,
    setEditingPurchase,
  ] = useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [
    showAllPurchases,
    setShowAllPurchases,
  ] = useState(false);

  const [
    historySearch,
    setHistorySearch,
  ] = useState("");

  const [
    historyPaymentFilter,
    setHistoryPaymentFilter,
  ] = useState("all");


  /* =====================================
     LOAD BACKEND DATA
  ===================================== */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        await Promise.all([
          fetchPurchases(),
          fetchSuppliers(),
        ]);
      } catch (error) {
        if (mounted) {
          console.error(
            "Purchases load error:",
            error
          );

          toast.error(
            error?.message ||
              "تعذر تحميل بيانات المشتريات"
          );
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [
    fetchPurchases,
    fetchSuppliers,
  ]);


  /* =====================================
     SORTED
  ===================================== */

  const sortedPurchases =
    useMemo(() => {
      return [...purchases].sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      );
    }, [purchases]);


  /* =====================================
     FILTERED
  ===================================== */

  const filteredPurchases =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      return sortedPurchases.filter(
        (purchase) => {
          const matchesSearch =
            !value ||
            purchase.id
              ?.toLowerCase()
              .includes(value) ||
            purchase.invoiceNumber
              ?.toLowerCase()
              .includes(value) ||
            purchase.supplier?.name
              ?.toLowerCase()
              .includes(value) ||
            purchase.items?.some(
              (item) =>
                item.name
                  ?.toLowerCase()
                  .includes(value)
            );

          const matchesPayment =
            paymentFilter ===
              "all" ||
            getPurchasePaymentStatus(
              purchase
            ) === paymentFilter;

          return (
            matchesSearch &&
            matchesPayment
          );
        }
      );
    }, [
      sortedPurchases,
      search,
      paymentFilter,
    ]);


  /* =====================================
     LAST 24 HOURS
  ===================================== */

  const recentPurchases =
    useMemo(() => {
      const cutoff =
        Date.now() -
        24 *
          60 *
          60 *
          1000;

      return sortedPurchases.filter(
        (purchase) =>
          new Date(
            purchase.createdAt || 0
          ).getTime() >=
          cutoff
      );
    }, [
      sortedPurchases,
    ]);


  const visiblePurchases =
    showAllPurchases
      ? filteredPurchases
      : filteredPurchases.filter(
          (purchase) =>
            recentPurchases.some(
              (recent) =>
                recent.id ===
                purchase.id
            )
        );


  /* =====================================
     GLOBAL METRICS
  ===================================== */

  const activePurchases =
    useMemo(() => {
      return purchases.filter(
        (purchase) =>
          purchase.status !==
          "void"
      );
    }, [purchases]);


  const totalPurchases =
    useMemo(() => {
      return activePurchases.reduce(
        (sum, purchase) =>
          sum +
          Number(
            purchase.total || 0
          ),
        0
      );
    }, [activePurchases]);


  const totalPaid =
    useMemo(() => {
      return activePurchases.reduce(
        (sum, purchase) =>
          sum +
          Number(
            purchase.paidAmount ||
              0
          ),
        0
      );
    }, [activePurchases]);


  const totalRemaining =
    useMemo(() => {
      return activePurchases.reduce(
        (sum, purchase) =>
          sum +
          Number(
            purchase.remainingAmount ||
              0
          ),
        0
      );
    }, [activePurchases]);


  const unpaidPurchases =
    useMemo(() => {
      return activePurchases.filter(
        (purchase) =>
          Number(
            purchase.remainingAmount ||
              0
          ) > 0
      ).length;
    }, [activePurchases]);


  const todayPurchases =
    useMemo(() => {
      const today =
        new Date()
          .toISOString()
          .slice(0, 10);

      return activePurchases.filter(
        (purchase) =>
          purchase.createdAt?.slice(
            0,
            10
          ) === today
      );
    }, [activePurchases]);


  const todayPurchaseValue =
    todayPurchases.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.total || 0
        ),
      0
    );


  const todayPaid =
    todayPurchases.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.paidAmount ||
            0
        ),
      0
    );


  const recentPurchaseValue =
    recentPurchases
      .filter(
        (purchase) =>
          purchase.status !==
          "void"
      )
      .reduce(
        (sum, purchase) =>
          sum +
          Number(
            purchase.total || 0
          ),
        0
      );


  /* =====================================
     FORM
  ===================================== */

  const openAddForm =
    () => {
      setEditingPurchase(
        null
      );

      setShowForm(
        true
      );
    };


  const openEditForm =
    (purchase) => {
      setEditingPurchase(
        purchase
      );

      setSelectedPurchase(
        null
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

      setEditingPurchase(
        null
      );
    };


  /* =====================================
     SAVE PURCHASE
     Backend is source of truth.
  ===================================== */

  const handleSavePurchase =
    async (
      purchaseData
    ) => {
      try {
        if (
          editingPurchase
        ) {
          const updates = {
            supplierId:
              purchaseData.supplierId,

            discount:
              purchaseData.discount,

            notes:
              purchaseData.notes,
          };

          if (
            editingPurchase.status ===
            "draft"
          ) {
            updates.items =
              purchaseData.items;
          }

          await updatePurchase(
            editingPurchase.id,
            updates
          );

          await Promise.all([
            fetchPurchases(),
            fetchSuppliers(),
          ]);

          toast.success(
            "تم تحديث المشتريات بنجاح"
          );

          closeForm();

          return;
        }

        await addPurchase({
          ...purchaseData,

          source:
            "admin",
        });

        await Promise.all([
          fetchPurchases(),
          fetchSuppliers(),
        ]);

        toast.success(
          "تم تحديث المشتريات بنجاح"
        );

        closeForm();

      } catch (error) {
        console.error(
          "Purchase save error:",
          error
        );

        toast.error(
          error?.message ||
          "تعذر حفظ المشتريات"
        );
      }
    };


  /* =====================================
     SAVE PURCHASE AS DRAFT
  ===================================== */

  const handleSaveDraftPurchase =
    async (
      purchaseData
    ) => {
      try {
        await createDraftPurchase({
          ...purchaseData,

          paidAmount:
            0,

          source:
            "admin",
        });

        await Promise.all([
          fetchPurchases(),
          fetchSuppliers(),
        ]);

        toast.success(
          "تم حفظ المسودة بنجاح"
        );

        closeForm();

      } catch (error) {
        console.error(
          "Draft purchase save error:",
          error
        );

        toast.error(
          error?.message ||
          "تعذر حفظ المسودة"
        );
      }
    };


  /* =====================================
     RECEIVE PURCHASE
  ===================================== */

  const handleReceivePurchase =
    async (
      purchase
    ) => {
      if (
        !purchase ||
        purchase.status !==
          "draft"
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "هل تريد استلام هذه المشتريات؟"
        );

      if (!confirmed) {
        return;
      }

      try {
        await receivePurchase(
          purchase.id,
          {
            paidAmount:
              0,

            paymentMethod:
              purchase.paymentMethod ||
              "CASH",
          }
        );

        await Promise.all([
          fetchPurchases(),
          fetchSuppliers(),
        ]);

        setSelectedPurchase(
          null
        );

        toast.success(
          "تم استلام المشتريات وتحديث المخزون"
        );

      } catch (error) {
        console.error(
          "Purchase receive error:",
          error
        );

        toast.error(
          error?.message ||
          "تعذر استلام المشتريات"
        );
      }
    };


  /* =====================================
     VOID PURCHASE
  ===================================== */

  const confirmVoid =
    async () => {
      if (
        !deleteTarget
      ) {
        return;
      }

      if (
        deleteTarget.status ===
        "void"
      ) {
        setDeleteTarget(
          null
        );

        return;
      }

      try {
        await voidPurchase(
          deleteTarget.id,
          "إلغاء يدوي من المشتريات"
        );

        await fetchPurchases();

        if (
          selectedPurchase?.id ===
          deleteTarget.id
        ) {
          setSelectedPurchase(
            null
          );
        }

        toast.success(
          "تم إلغاء الفاتورة وعكس أثرها على النظام"
        );

        setDeleteTarget(
          null
        );
      } catch (error) {
        console.error(
          "Purchase void error:",
          error
        );

        toast.error(
          error?.message ||
            "تعذر إلغاء الفاتورة"
        );
      }
    };


  /* =====================================
     RETURN
  ===================================== */

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">

            <ShoppingBag
              size={15}
            />

            إدارة المشتريات

          </div>


          <h1 className="text-3xl font-black text-slate-900">
            المشتريات
          </h1>


          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            تسجيل فواتير الشراء وربط الموردين والمخزون
            والمدفوعات والأرصدة من مكان واحد.
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
            size={18}
          />

          فاتورة شراء جديدة

        </button>

      </div>


      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <SummaryCard
          icon={
            Receipt
          }
          title="إجمالي المشتريات"
          value={`${totalPurchases.toLocaleString()} ج.م`}
          accent="blue"
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
          title="المتبقي"
          value={`${totalRemaining.toLocaleString()} ج.م`}
          accent="orange"
        />

        <SummaryCard
          icon={
            AlertTriangle
          }
          title="فواتير عليها رصيد"
          value={
            unpaidPurchases
          }
          accent="red"
        />

        <SummaryCard
          icon={
            CalendarDays
          }
          title="مشتريات اليوم"
          value={`${todayPurchaseValue.toLocaleString()} ج.م`}
          accent="purple"
        />

      </div>


      {/* RECENT ACTIVITY */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-white p-2 text-blue-700 shadow-sm">

              <History
                size={19}
              />

            </div>


            <div>

              <p className="font-black text-blue-900">
                نشاط المشتريات
              </p>


              <p className="mt-1 text-xs text-blue-700/70">

                {
                  recentPurchases.length
                }{" "}
                فاتورة خلال آخر 24 ساعة
                بقيمة{" "}
                {
                  recentPurchaseValue.toLocaleString()
                }{" "}
                ج.م

              </p>

            </div>

          </div>


          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">

            <MiniPeriod
              label="اليوم"
              value={`${todayPurchaseValue.toLocaleString()} ج.م`}
            />

            <MiniPeriod
              label="المحصل اليوم"
              value={`${todayPaid.toLocaleString()} ج.م`}
            />

            <MiniPeriod
              label="الفواتير"
              value={
                todayPurchases.length
              }
            />

          </div>

        </div>

      </div>


      {/* FILTERS */}

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
              placeholder="ابحث برقم الفاتورة أو المورد أو المنتج..."
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

                <X
                  size={15}
                />

              </button>
            )}

          </div>


          <select
            value={
              paymentFilter
            }
            onChange={(
              event
            ) =>
              setPaymentFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:border-blue-500 xl:w-52"
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
              آجلة / غير مدفوعة
            </option>

          </select>

        </div>


        <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">

          <div>

            <p className="text-sm font-black text-slate-800">

              {showAllPurchases
                ? "سجل المشتريات الكامل"
                : "آخر المشتريات"}

            </p>


            <p className="mt-1 text-xs text-slate-400">

              {
                visiblePurchases.length
              }{" "}
              فاتورة ظاهرة

            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              setShowAllPurchases(
                (current) =>
                  !current
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
          >

            {showAllPurchases ? (
              <>

                <ChevronUp
                  size={17}
                />

                آخر 24 ساعة

              </>
            ) : (
              <>

                عرض كل المشتريات

                <ChevronDown
                  size={17}
                />

              </>
            )}

          </button>

        </div>

      </div>


      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1350px] text-right">

            <thead>

              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-400">

                <th className="px-6 py-4">
                  الفاتورة
                </th>

                <th className="px-6 py-4">
                  المورد
                </th>

                <th className="px-6 py-4">
                  التاريخ
                </th>

                <th className="px-6 py-4">
                  المنتجات
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
                  الحالة
                </th>

                <th className="px-6 py-4">
                  الإجراءات
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {visiblePurchases.map(
                (
                  purchase
                ) => (
                  <PurchaseRow
                    key={
                      purchase.id
                    }
                    purchase={
                      purchase
                    }
                    onOpen={() =>
                      setSelectedPurchase(
                        purchase
                      )
                    }
                    onEdit={() =>
                      openEditForm(
                        purchase
                      )
                    }
                    onVoid={() =>
                      setDeleteTarget(
                        purchase
                      )
                    }
                  />
                )
              )}

            </tbody>

          </table>


          {visiblePurchases.length ===
            0 && (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">

              <ShoppingBag
                size={42}
                className="text-slate-300"
              />


              <p className="mt-4 font-black text-slate-700">
                لا توجد فواتير شراء
              </p>


              <p className="mt-1 text-sm text-slate-400">

                {showAllPurchases
                  ? "لا توجد نتائج مطابقة للفلاتر الحالية."
                  : "لا توجد مشتريات خلال آخر 24 ساعة."}

              </p>


              {!search &&
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
                      size={17}
                    />

                    إضافة أول فاتورة

                  </button>
                )}

            </div>
          )}

        </div>

      </div>


      {/* FORM */}

      {showForm && (
        <PurchaseForm
          purchase={
            editingPurchase
          }
          suppliers={
            suppliers
          }
          products={
            products
          }
          onClose={
            closeForm
          }
          onCreateSupplier={
            async (
              supplierData
            ) => {
              return createSupplier(
                supplierData
              );
            }
          }
          onSubmit={
            handleSavePurchase
          }
            onSaveDraft={
              handleSaveDraftPurchase
            }
          
        />
      )}


      {/* DETAILS */}

      {selectedPurchase && (
        <PurchaseDetails
          purchase={
            selectedPurchase
          }
          onClose={() =>
            setSelectedPurchase(
              null
            )
          }
          onEdit={() =>
            openEditForm(
              selectedPurchase
            )
          }
          onVoid={() =>
            setDeleteTarget(
              selectedPurchase
            )
          }
        />
      )}


      {/* VOID */}

      {deleteTarget && (
        <VoidModal
          purchase={
            deleteTarget
          }
          onClose={() =>
            setDeleteTarget(
              null
            )
          }
          onConfirm={
            confirmVoid
          }
        />
      )}


      {/* FULL HISTORY */}

      {showAllPurchases && (
        <PurchaseHistoryModal
          purchases={
            filteredPurchases
          }
          search={
            historySearch
          }
          setSearch={
            setHistorySearch
          }
          paymentFilter={
            historyPaymentFilter
          }
          setPaymentFilter={
            setHistoryPaymentFilter
          }
          onClose={() =>
            setShowAllPurchases(
              false
            )
          }
          onOpen={(
            purchase
          ) => {
            setShowAllPurchases(
              false
            );

            setSelectedPurchase(
              purchase
            );
          }}
        />
      )}

    </div>
  );
}


/* =====================================
   PURCHASE ROW
===================================== */

function PurchaseRow({
  purchase,
  onOpen,
  onEdit,
  onVoid,
}) {
  const status =
    PAYMENT_STATUS_CONFIG[
      getPurchasePaymentStatus(
        purchase
      )
    ] ||
    PAYMENT_STATUS_CONFIG.unpaid;

  const StatusIcon =
    status.icon;

  const isVoid =
    purchase.status ===
    "void";


  return (
    <tr
      className={`transition hover:bg-slate-50 ${
        isVoid
          ? "opacity-55"
          : ""
      }`}
    >

      <td className="px-6 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">

            <Receipt
              size={18}
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
                purchase.id
              }

            </p>

          </div>

        </div>

      </td>


      <td className="px-6 py-5">

        <div className="flex items-center gap-2">

          <Truck
            size={15}
            className="text-slate-400"
          />


          <div>

            <p className="font-bold text-slate-700">

              {
                purchase.supplier
                  ?.name ||
                "مورد غير محدد"
              }

            </p>


            <p className="mt-1 text-xs text-slate-400">

              {
                purchase.supplier
                  ?.company ||
                ""
              }

            </p>

          </div>

        </div>

      </td>


      <td className="px-6 py-5">

        <div className="flex items-center gap-2 text-sm text-slate-500">

          <CalendarDays
            size={15}
          />

          {
            formatDate(
              purchase.createdAt
            )
          }

        </div>

      </td>


      <td className="px-6 py-5">

        <div>

          <p className="font-black text-slate-800">

            {
              purchase.items
                ?.length ||
              0
            }

          </p>


          <p className="mt-1 text-xs text-slate-400">

            {
              getPurchaseQuantity(
                purchase
              )
            }{" "}
            قطعة

          </p>

        </div>

      </td>


      <td className="px-6 py-5">

        <p className="font-black text-slate-900">

          {Number(
            purchase.total ||
              0
          ).toLocaleString()}{" "}
          ج.م

        </p>

      </td>


      <td className="px-6 py-5">

        <p className="font-black text-emerald-600">

          {Number(
            purchase.paidAmount ||
              0
          ).toLocaleString()}{" "}
          ج.م

        </p>

      </td>


      <td className="px-6 py-5">

        <p
          className={`font-black ${
            Number(
              purchase.remainingAmount ||
                0
            ) > 0
              ? "text-orange-600"
              : "text-slate-400"
          }`}
        >

          {Number(
            purchase.remainingAmount ||
              0
          ).toLocaleString()}{" "}
          ج.م

        </p>

      </td>


      <td className="px-6 py-5">

        <div
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black ${status.className}`}
        >

          <StatusIcon
            size={14}
          />

          {
            isVoid
              ? "ملغاة"
              : status.label
          }

        </div>

      </td>


      <td className="px-6 py-5">

        <div className="flex items-center gap-1">

          <button
            type="button"
            onClick={
              onOpen
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700"
            title="التفاصيل"
          >

            <Eye
              size={17}
            />

          </button>


          {!isVoid && (
            <button
              type="button"
              onClick={
                onEdit
              }
              className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700"
              title="تعديل"
            >

              <Pencil
                size={16}
              />

            </button>
          )}


          {!isVoid && (
            <button
              type="button"
              onClick={
                onVoid
              }
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
              title="إلغاء"
            >

              <Trash2
                size={16}
              />

            </button>
          )}

        </div>

      </td>

    </tr>
  );
}


/* =====================================
   PURCHASE FORM
===================================== */

function PurchaseForm({
  purchase,
  suppliers,
  products,
  onClose,
  onCreateSupplier,
  onSubmit,
    onSaveDraft,
  }) {
  const [
    supplierId,
    setSupplierId,
  ] = useState(
    purchase?.supplierId ||
      ""
  );


  const [
    showSupplierForm,
    setShowSupplierForm,
  ] = useState(false);


  const [
    supplierDraft,
    setSupplierDraft,
  ] = useState({
    name: "",
    company: "",
    phone: "",
  });


  const [
    items,
    setItems,
  ] = useState(
    Array.isArray(
      purchase?.items
    )
      ? purchase.items.map(
          (item) => ({
            ...item,

            quantity:
              Number(
                item.quantity ||
                  0
              ),

            purchasePrice:
              Number(
                item.purchasePrice ??
                  item.price ??
                  0
              ),
          })
        )
      : []
  );


  const [
    discount,
    setDiscount,
  ] = useState(
    purchase?.discount ??
      0
  );


  const [
    paidAmount,
    setPaidAmount,
  ] = useState(
    purchase?.paidAmount ??
      0
  );


  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState(
    purchase?.paymentMethod ||
      "cash"
  );


  const [
    notes,
    setNotes,
  ] = useState(
    purchase?.notes ||
      ""
  );


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    creatingSupplier,
    setCreatingSupplier,
  ] = useState(false);


  const selectedSupplier =
    suppliers.find(
      (supplier) =>
        String(
          supplier.id
        ) ===
        String(
          supplierId
        )
    );


  /* =====================================
     TOTALS
  ===================================== */

  const subtotal =
    items.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.purchasePrice ||
            0
        ) *
          Number(
            item.quantity ||
              0
          ),
      0
    );


  const safeDiscount =
    Math.min(
      Math.max(
        Number(
          discount
        ) || 0,
        0
      ),
      subtotal
    );


  const total =
    Math.max(
      subtotal -
        safeDiscount,
      0
    );


  const safePaid =
    Math.min(
      Math.max(
        Number(
          paidAmount
        ) || 0,
        0
      ),
      total
    );


  const remaining =
    Math.max(
      total -
        safePaid,
      0
    );


  /* =====================================
     ITEMS
  ===================================== */

  const addItem =
    () => {
      setItems(
        (current) => [
          ...current,

          {
            productId: "",
            name: "",
            sku: "",
            quantity: 1,
            purchasePrice: 0,
            total: 0,
          },
        ]
      );
    };


  const removeItem =
    (index) => {
      setItems(
        (current) =>
          current.filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              index
          )
      );
    };


  const updateItem =
    (
      index,
      key,
      value
    ) => {
      setItems(
        (current) =>
          current.map(
            (
              item,
              itemIndex
            ) => {
              if (
                itemIndex !==
                index
              ) {
                return item;
              }


              if (
                key ===
                "productId"
              ) {
                const product =
                  products.find(
                    (
                      product
                    ) =>
                      String(
                        product.id
                      ) ===
                      String(
                        value
                      )
                  );


                return {
                  ...item,

                  productId:
                    value,

                  name:
                    product?.name ||
                    "",

                  sku:
                    product?.sku ||
                    "",

                  purchasePrice:
                    Number(
                      product?.purchasePrice ??
                        item.purchasePrice ??
                        0
                    ),
                };
              }


              return {
                ...item,

                [key]:
                  value,
              };
            }
          )
      );
    };


  /* =====================================
     QUICK SUPPLIER
  ===================================== */

  const createQuickSupplier =
    async () => {
      const name =
        supplierDraft.name.trim();


      if (!name) {
        toast.error(
          "أدخل اسم المورد"
        );

        return;
      }


      try {
        setCreatingSupplier(
          true
        );


        const created =
          await onCreateSupplier({
            name,

            phone:
              supplierDraft.phone.trim(),

            whatsapp:
              "",

            email:
              "",

            address:
              "",

            notes:
              supplierDraft.company.trim(),
          });


        if (
          created?.id
        ) {
          setSupplierId(
            created.id
          );
        }


        setSupplierDraft({
          name: "",
          company: "",
          phone: "",
        });


        setShowSupplierForm(
          false
        );


        toast.success(
          "تمت إضافة المورد واختياره"
        );
      } catch (error) {
        console.error(
          "Quick supplier error:",
          error
        );

        toast.error(
          error?.message ||
            "تعذر إنشاء المورد"
        );
      } finally {
        setCreatingSupplier(
          false
        );
      }
    };


  /* =====================================
     SUBMIT
  ===================================== */

  const submit =
    async (
      event
    ) => {
      event.preventDefault();


      if (
        saving
      ) {
        return;
      }


      if (
        !supplierId
      ) {
        toast.error(
          "اختر المورد"
        );

        return;
      }


      if (
        items.length ===
        0
      ) {
        toast.error(
          "أضف منتجًا واحدًا على الأقل"
        );

        return;
      }


      for (
        const item of items
      ) {
        if (
          !item.productId
        ) {
          toast.error(
            "اختر المنتج في جميع الصفوف"
          );

          return;
        }


        if (
          !Number(
            item.quantity
          ) ||
          Number(
            item.quantity
          ) <=
            0
        ) {
          toast.error(
            "أدخل كميات صحيحة"
          );

          return;
        }


        if (
          Number(
            item.purchasePrice
          ) <=
            0
        ) {
          toast.error(
            "أدخل سعر شراء صحيح"
          );

          return;
        }
      }


      if (
        !selectedSupplier
      ) {
        toast.error(
          "تعذر العثور على المورد المحدد"
        );

        return;
      }


      const normalizedItems =
        items.map(
          (item) => ({
            productId:
              item.productId,

            quantity:
              Number(
                item.quantity
              ),

            purchasePrice:
              Number(
                item.purchasePrice
              ),
          })
        );


      /*
        Backend owns:
        - subtotal
        - total
        - payment state
        - stock
        - payments
      */

      const payload = {
        supplierId:
          selectedSupplier.id,

        /*
          Current backend requires invoiceNumber.
          Existing invoice keeps its number.
          New invoice gets a unique local request number.
        */

        invoiceNumber:
          purchase?.invoiceNumber ||
          `PUR-${Date.now()}`,

        discount:
          safeDiscount,

        paidAmount:
          purchase
            ? 0
            : safePaid,

        source:
          "admin",

        notes:
          notes.trim(),

        items:
          normalizedItems,

        paymentMethod:
          paymentMethod,
      };


      try {
        setSaving(
          true
        );

        await onSubmit(
          payload
        );
      } finally {
        setSaving(
          false
        );
      }
    };


  /* =====================================
     RETURN
  ===================================== */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div>

            <p className="text-xs font-bold text-emerald-600">
              دورة المشتريات
            </p>


            <h2 className="mt-1 text-2xl font-black text-slate-900">

              {purchase
                ? "تعديل فاتورة الشراء"
                : "فاتورة شراء جديدة"}

            </h2>


            <p className="mt-1 text-xs text-slate-400">
              المورد + المنتجات + المخزون + الدفع في فاتورة واحدة.
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
              size={20}
            />

          </button>

        </div>


        {/* FORM */}

        <form
          onSubmit={
            submit
          }
          className="overflow-y-auto"
        >

          <div className="grid gap-6 p-6 lg:grid-cols-[0.75fr_1.25fr]">

            {/* =================================
                SUPPLIER + PAYMENT
            ================================= */}

            <div className="space-y-5">

              <FormSection
                title="المورد"
              >

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    المورد
                  </label>


                  <select
                    value={
                      supplierId
                    }
                    onChange={(
                      event
                    ) =>
                      setSupplierId(
                        event.target.value
                      )
                    }
                    disabled={
                      Boolean(
                        purchase
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 disabled:bg-slate-50"
                  >

                    <option value="">
                      اختر المورد
                    </option>


                    {suppliers.map(
                      (
                        supplier
                      ) => (
                        <option
                          key={
                            supplier.id
                          }
                          value={
                            supplier.id
                          }
                        >

                          {
                            supplier.name
                          }

                        </option>
                      )
                    )}

                  </select>

                </div>


                {!purchase && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setShowSupplierForm(
                          (
                            value
                          ) =>
                            !value
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 py-3 text-sm font-black text-blue-700 hover:bg-blue-100"
                    >

                      <Plus
                        size={16}
                      />

                      إضافة مورد سريع

                    </button>


                    {showSupplierForm && (
                      <div className="space-y-3 rounded-2xl bg-slate-50 p-4">

                        <TextField
                          label="اسم المورد"
                          value={
                            supplierDraft.name
                          }
                          onChange={(
                            value
                          ) =>
                            setSupplierDraft(
                              (
                                current
                              ) => ({
                                ...current,

                                name:
                                  value,
                              })
                            )
                          }
                          placeholder="اسم المورد"
                        />


                        <TextField
                          label="الشركة"
                          value={
                            supplierDraft.company
                          }
                          onChange={(
                            value
                          ) =>
                            setSupplierDraft(
                              (
                                current
                              ) => ({
                                ...current,

                                company:
                                  value,
                              })
                            )
                          }
                          placeholder="اسم الشركة"
                        />


                        <TextField
                          label="الهاتف"
                          value={
                            supplierDraft.phone
                          }
                          onChange={(
                            value
                          ) =>
                            setSupplierDraft(
                              (
                                current
                              ) => ({
                                ...current,

                                phone:
                                  value,
                              })
                            )
                          }
                          placeholder="010..."
                        />


                        <button
                          type="button"
                          onClick={
                            createQuickSupplier
                          }
                          disabled={
                            creatingSupplier
                          }
                          className="w-full rounded-xl bg-blue-700 py-3 text-sm font-black text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >

                          {creatingSupplier
                            ? "جاري إنشاء المورد..."
                            : "إنشاء واختيار المورد"}

                        </button>

                      </div>
                    )}

                  </>
                )}


                {selectedSupplier && (
                  <div className="rounded-2xl bg-slate-50 p-4">

                    <p className="text-xs font-bold text-slate-400">
                      المورد المختار
                    </p>


                    <p className="mt-1 font-black text-slate-800">
                      {
                        selectedSupplier.name
                      }
                    </p>


                    {selectedSupplier.phone && (
                      <p className="mt-1 text-xs text-slate-400">
                        {
                          selectedSupplier.phone
                        }
                      </p>
                    )}

                  </div>
                )}

              </FormSection>


              {/* PAYMENT */}

              <FormSection
                title="الدفع"
              >

                <div className="grid grid-cols-2 gap-2">

                  <PaymentMethodButton
                    active={
                      paymentMethod ===
                      "cash"
                    }
                    onClick={() =>
                      setPaymentMethod(
                        "cash"
                      )
                    }
                    icon={
                      Banknote
                    }
                    label="كاش"
                  />


                  <PaymentMethodButton
                    active={
                      paymentMethod ===
                      "card"
                    }
                    onClick={() =>
                      setPaymentMethod(
                        "card"
                      )
                    }
                    icon={
                      CreditCard
                    }
                    label="بطاقة"
                  />

                </div>


                <NumberField
                  label="المدفوع الآن"
                  value={
                    purchase
                      ? 0
                      : paidAmount
                  }
                  onChange={
                    setPaidAmount
                  }
                  disabled={
                    Boolean(
                      purchase
                    )
                  }
                />


                <div className="grid grid-cols-2 gap-2">

                  <FinancialBox
                    label="الإجمالي"
                    value={`${total.toLocaleString()} ج.م`}
                    accent
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

              </FormSection>


              {/* NOTES */}

              <FormSection
                title="ملاحظات"
              >

                <textarea
                  rows={5}
                  value={
                    notes
                  }
                  onChange={(
                    event
                  ) =>
                    setNotes(
                      event.target.value
                    )
                  }
                  placeholder="ملاحظات على فاتورة الشراء..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </FormSection>

            </div>


            {/* =================================
                PRODUCTS
            ================================= */}

            <div>

              <div className="rounded-2xl border border-slate-200">

                <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">

                  <div>

                    <h3 className="font-black text-slate-900">
                      المنتجات
                    </h3>


                    <p className="mt-1 text-xs text-slate-400">
                      أضف المنتجات والكميات وسعر الشراء.
                    </p>

                  </div>


                  {(!purchase ||
                    purchase.status === "draft") && (
                    <button
                      type="button"
                      onClick={
                        addItem
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"
                    >

                      <Plus
                        size={16}
                      />

                      إضافة منتج

                    </button>
                  )}

                </div>


                <div className="p-5">

                  {items.length ===
                  0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">

                      <ShoppingBag
                        size={38}
                        className="mx-auto text-slate-300"
                      />


                      <p className="mt-3 font-black text-slate-700">
                        لا توجد منتجات
                      </p>


                      <p className="mt-1 text-xs text-slate-400">
                        أضف أول منتج إلى الفاتورة.
                      </p>


                      {(!purchase ||
                        purchase.status === "draft") && (
                        <button
                          type="button"
                          onClick={
                            addItem
                          }
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white"
                        >

                          <Plus
                            size={16}
                          />

                          إضافة منتج

                        </button>
                      )}

                    </div>
                  ) : (
                    <div className="space-y-3">

                      {items.map(
                        (
                          item,
                          index
                        ) => (
                          <PurchaseItemRow
                            key={
                              item.id ||
                              `${item.productId}-${index}`
                            }
                            item={
                              item
                            }
                            index={
                              index
                            }
                            products={
                              products
                            }
                            onChange={
                              updateItem
                            }
                            onRemove={() =>
                              removeItem(
                                index
                              )
                            }
                            readOnly={
                              purchase?.status !==
                              "draft"
                            }
                          />
                        )
                      )}

                    </div>
                  )}


                  {items.length >
                    0 && (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-5">

                      <div className="space-y-3 text-sm">

                        <div className="flex justify-between text-slate-500">

                          <span>
                            المجموع
                          </span>


                          <span>
                            {
                              subtotal.toLocaleString()
                            }{" "}
                            ج.م
                          </span>

                        </div>


                        <div className="flex items-center justify-between gap-3">

                          <span className="text-slate-500">
                            الخصم
                          </span>


                          <input
                            type="number"
                            min="0"
                            value={
                              discount
                            }
                            onChange={(
                              event
                            ) =>
                              setDiscount(
                                event.target.value
                              )
                            }
                            className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
                          />

                        </div>


                        <div className="flex items-center justify-between border-t border-slate-200 pt-3">

                          <span className="text-lg font-black text-slate-900">
                            الإجمالي
                          </span>


                          <span className="text-2xl font-black text-blue-700">
                            {
                              total.toLocaleString()
                            }{" "}
                            ج.م
                          </span>

                        </div>

                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>


          {/* FOOTER */}

          <div className="flex gap-3 border-t border-slate-200 bg-slate-50 p-6">

            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                saving
              }
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-black text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              إلغاء
            </button>


            <button
              type="submit"
              disabled={
                items.length ===
                  0 ||
                saving
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >

              <Receipt
                size={18}
              />


              {saving
                ? "جاري الحفظ..."
                : purchase
                  ? "حفظ التعديلات"
                  : "اعتماد فاتورة الشراء"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =====================================
   ITEM ROW
===================================== */

function PurchaseItemRow({
  item,
  index,
  products,
  onChange,
  onRemove,
  readOnly = false,
}) {
  const lineTotal =
    Number(
      item.purchasePrice ||
        0
    ) *
    Number(
      item.quantity ||
        0
    );


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">

      <div className="flex items-start justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

            <Package
              size={18}
            />

          </div>


          <div className="min-w-0">

            <p className="text-sm font-black text-slate-800">

              {
                item.name ||
                "منتج غير محدد"
              }

            </p>


            <p className="mt-1 text-xs text-slate-400">

              {
                item.sku ||
                "—"
              }

            </p>

          </div>

        </div>


        {!readOnly && (
          <button
            type="button"
            onClick={
              onRemove
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
            title="حذف"
          >

            <X
              size={16}
            />

          </button>
        )}

      </div>


      <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_140px_140px]">

        <div>

          <label className="mb-2 block text-[11px] font-bold text-slate-400">
            المنتج
          </label>


          <select
            value={
              item.productId
            }
            onChange={(
              event
            ) =>
              onChange(
                index,
                "productId",
                event.target.value
              )
            }
            disabled={
              readOnly
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-blue-500 disabled:bg-slate-50"
          >

            <option value="">
              اختر المنتج
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
                >

                  {
                    product.name
                  }

                  {product.sku
                    ? ` • ${product.sku}`
                    : ""}

                </option>
              )
            )}

          </select>

        </div>


        <NumberField
          label="الكمية"
          value={
            item.quantity
          }
          onChange={(
            value
          ) =>
            onChange(
              index,
              "quantity",
              value
            )
          }
          disabled={
            readOnly
          }
        />


        <NumberField
          label="سعر الشراء"
          value={
            item.purchasePrice
          }
          onChange={(
            value
          ) =>
            onChange(
              index,
              "purchasePrice",
              value
            )
          }
          disabled={
            readOnly
          }
        />

      </div>


      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3">

        <span className="text-xs font-bold text-slate-400">
          إجمالي الصنف
        </span>


        <span className="font-black text-slate-800">

          {
            lineTotal.toLocaleString()
          }{" "}
          ج.م

        </span>

      </div>

    </div>
  );
}


/* =====================================
   DETAILS
===================================== */

function PurchaseDetails({
  purchase,
  onClose,
  onEdit,
  onVoid,
}) {
  const status =
    PAYMENT_STATUS_CONFIG[
      getPurchasePaymentStatus(
        purchase
      )
    ] ||
    PAYMENT_STATUS_CONFIG.unpaid;

  const StatusIcon =
    status.icon;

  const isVoid =
    purchase.status ===
    "void";


  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">

              <Receipt
                size={21}
              />

            </div>


            <div>

              <p className="text-xs font-bold text-emerald-600">
                فاتورة شراء
              </p>


              <h2 className="mt-1 text-2xl font-black text-slate-900">

                {
                  purchase.invoiceNumber ||
                  purchase.id
                }

              </h2>


              <p className="mt-1 text-xs text-slate-400">

                {
                  formatDate(
                    purchase.createdAt
                  )
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
              size={20}
            />

          </button>

        </div>


        <div className="overflow-y-auto p-6">

          {/* SUPPLIER + STATUS */}

          <div className="grid gap-4 lg:grid-cols-2">

            <InfoCard title="المورد">

              <InfoLine
                icon={
                  Truck
                }
                label="الاسم"
                value={
                  purchase.supplier
                    ?.name ||
                  "مورد غير محدد"
                }
              />


              {purchase.supplier
                ?.phone && (
                <InfoLine
                  icon={
                    CreditCard
                  }
                  label="الهاتف"
                  value={
                    purchase.supplier
                      .phone
                  }
                />
              )}

            </InfoCard>


            <InfoCard title="حالة الفاتورة">

              <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${status.className}`}
                  >

                    <StatusIcon
                      size={18}
                    />

                  </div>


                  <div>

                    <p className="text-xs font-bold text-slate-400">
                      الدفع
                    </p>


                    <p className="mt-1 font-black text-slate-800">

                      {
                        isVoid
                          ? "الفاتورة ملغاة"
                          : status.label
                      }

                    </p>

                  </div>

                </div>


                <span className="text-sm font-black text-slate-900">

                  {Number(
                    purchase.total ||
                      0
                  ).toLocaleString()}{" "}
                  ج.م

                </span>

              </div>

            </InfoCard>

          </div>


          {/* ITEMS */}

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">

            <div className="border-b border-slate-200 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-black text-slate-900">
                    المنتجات
                  </h3>


                  <p className="mt-1 text-xs text-slate-400">

                    {
                      getPurchaseQuantity(
                        purchase
                      )
                    }{" "}
                    قطعة

                  </p>

                </div>


                <Package
                  size={20}
                  className="text-slate-400"
                />

              </div>

            </div>


            <div className="divide-y divide-slate-100">

              {purchase.items?.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item.id ||
                      `${item.productId}-${index}`
                    }
                    className="flex items-center justify-between gap-4 p-5"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">

                        <Package
                          size={17}
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
                            item.purchasePrice ||
                              item.price ||
                              0
                          ).toLocaleString()}{" "}
                          ج.م

                        </p>

                      </div>

                    </div>


                    <span className="shrink-0 font-black text-slate-900">

                      {Number(
                        item.total ||
                          Number(
                            item.purchasePrice ||
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
              )}

            </div>

          </div>


          {/* FINANCIAL */}

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">

            <h3 className="font-black text-slate-900">
              الملخص المالي
            </h3>


            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

              <FinancialBox
                label="المجموع"
                value={`${Number(
                  purchase.subtotal ||
                    0
                ).toLocaleString()} ج.م`}
              />


              <FinancialBox
                label="الخصم"
                value={`- ${Number(
                  purchase.discount ||
                    0
                ).toLocaleString()} ج.م`}
                negative
              />


              <FinancialBox
                label="المدفوع"
                value={`${Number(
                  purchase.paidAmount ||
                    0
                ).toLocaleString()} ج.م`}
                positive
              />


              <FinancialBox
                label="المتبقي"
                value={`${Number(
                  purchase.remainingAmount ||
                    0
                ).toLocaleString()} ج.م`}
                warning={
                  Number(
                    purchase.remainingAmount ||
                      0
                  ) > 0
                }
              />

            </div>


            <div className="mt-5 flex items-center justify-between rounded-xl bg-blue-50 p-4">

              <div>

                <p className="text-xs font-bold text-blue-500">
                  الإجمالي
                </p>


                <p className="mt-1 text-2xl font-black text-blue-700">

                  {Number(
                    purchase.total ||
                      0
                  ).toLocaleString()}{" "}
                  ج.م

                </p>

              </div>


              <CircleDollarSign
                size={25}
                className="text-blue-700"
              />

            </div>

          </div>


          {/* INVENTORY */}

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="font-black text-slate-900">
                  تأثير المخزون
                </h3>


                <p className="mt-1 text-xs text-slate-400">
                  حالة تطبيق الكميات على المخزون.
                </p>

              </div>


              <div
                className={`rounded-xl px-3 py-2 text-xs font-black ${
                  purchase.stockApplied
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-orange-50 text-orange-600"
                }`}
              >

                {purchase.stockApplied
                  ? "تم تحديث المخزون"
                  : "لم يتم تحديث المخزون"}

              </div>

            </div>

          </div>


          {purchase.notes && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold text-slate-400">
                ملاحظات
              </p>


              <p className="mt-2 text-sm leading-6 text-slate-600">
                {
                  purchase.notes
                }
              </p>

            </div>
          )}

        </div>


        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row">

          {!isVoid && (
            <button
              type="button"
              onClick={
                onVoid
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-5 py-3 text-sm font-black text-red-500 hover:bg-red-50"
            >

              <Trash2
                size={16}
              />

              إلغاء الفاتورة

            </button>
          )}


          {!isVoid && (
            <button
              type="button"
              onClick={
                onEdit
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-100"
            >

              <Pencil
                size={16}
              />

              تعديل

            </button>
          )}


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
   HISTORY
===================================== */

function PurchaseHistoryModal({
  purchases,
  search,
  setSearch,
  paymentFilter,
  setPaymentFilter,
  onClose,
  onOpen,
}) {
  const filtered =
    purchases.filter(
      (purchase) => {
        const value =
          search
            .trim()
            .toLowerCase();


        const matchesSearch =
          !value ||
          purchase.invoiceNumber
            ?.toLowerCase()
            .includes(value) ||
          purchase.supplier
            ?.name
            ?.toLowerCase()
            .includes(value) ||
          purchase.items?.some(
            (item) =>
              item.name
                ?.toLowerCase()
                .includes(value)
          );


        const matchesPayment =
          paymentFilter ===
            "all" ||
          getPurchasePaymentStatus(
            purchase
          ) ===
            paymentFilter;


        return (
          matchesSearch &&
          matchesPayment
        );
      }
    );


  const grouped =
    groupPurchasesByDate(
      filtered
    );


  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        <div className="border-b border-slate-200 p-6">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-xs font-bold text-blue-600">
                السجل الكامل
              </p>


              <h2 className="mt-1 text-2xl font-black text-slate-900">
                كل المشتريات
              </h2>


              <p className="mt-1 text-xs text-slate-400">

                {
                  filtered.length
                }{" "}
                فاتورة مطابقة

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
                size={20}
              />

            </button>

          </div>


          <div className="mt-5 flex flex-col gap-3 lg:flex-row">

            <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

              <Search
                size={17}
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
                placeholder="ابحث بالفاتورة أو المورد أو المنتج..."
                className="w-full bg-transparent text-sm outline-none"
              />

            </div>


            <select
              value={
                paymentFilter
              }
              onChange={(
                event
              ) =>
                setPaymentFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:border-blue-500 lg:w-52"
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
                آجلة
              </option>

            </select>

          </div>

        </div>


        <div className="overflow-y-auto">

          {grouped.length ===
          0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">

              <History
                size={42}
                className="text-slate-300"
              />


              <p className="mt-4 font-black text-slate-700">
                لا توجد نتائج
              </p>


              <p className="mt-1 text-sm text-slate-400">
                جرّب تغيير البحث أو الفلتر.
              </p>

            </div>
          ) : (
            grouped.map(
              ([
                date,
                items,
              ]) => (
                <section
                  key={
                    date
                  }
                >

                  <div className="sticky top-0 z-10 border-y border-slate-100 bg-slate-50/95 px-6 py-3 backdrop-blur">

                    <div className="flex items-center gap-2">

                      <CalendarDays
                        size={15}
                        className="text-blue-700"
                      />


                      <p className="text-sm font-black text-slate-800">

                        {
                          formatGroupDate(
                            date
                          )
                        }

                      </p>


                      <span className="rounded-md bg-white px-2 py-1 text-[10px] font-black text-slate-400">

                        {
                          items.length
                        }{" "}
                        فاتورة

                      </span>

                    </div>

                  </div>


                  <div className="divide-y divide-slate-100">

                    {items.map(
                      (
                        purchase
                      ) => (
                        <button
                          key={
                            purchase.id
                          }
                          type="button"
                          onClick={() =>
                            onOpen(
                              purchase
                            )
                          }
                          className="flex w-full items-center justify-between gap-4 p-5 text-right hover:bg-slate-50"
                        >

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">

                              <Receipt
                                size={17}
                              />

                            </div>


                            <div className="min-w-0">

                              <p className="font-black text-slate-800">

                                {
                                  purchase.invoiceNumber ||
                                  purchase.id
                                }

                              </p>


                              <p className="mt-1 truncate text-xs text-slate-400">

                                {
                                  purchase.supplier
                                    ?.name ||
                                  "مورد"
                                }{" "}
                                •{" "}
                                {
                                  getPurchaseQuantity(
                                    purchase
                                  )
                                }{" "}
                                قطعة

                              </p>

                            </div>

                          </div>


                          <div className="shrink-0 text-left">

                            <p className="font-black text-slate-900">

                              {Number(
                                purchase.total ||
                                  0
                              ).toLocaleString()}{" "}
                              ج.م

                            </p>


                            <p className="mt-1 text-[11px] text-slate-400">

                              {
                                formatTime(
                                  purchase.createdAt
                                )
                              }

                            </p>

                          </div>

                        </button>
                      )
                    )}

                  </div>

                </section>
              )
            )
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
            إغلاق
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   VOID MODAL
===================================== */

function VoidModal({
  purchase,
  onClose,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">

          <Trash2
            size={21}
          />

        </div>


        <h2 className="mt-4 text-lg font-black text-slate-900">
          إلغاء فاتورة الشراء؟
        </h2>


        <p className="mt-2 text-sm leading-6 text-slate-500">

          هل تريد إلغاء الفاتورة{" "}

          <strong className="text-slate-800">

            {
              purchase.invoiceNumber ||
              purchase.id
            }

          </strong>

          ؟

        </p>


        <div className="mt-3 rounded-xl bg-orange-50 p-3 text-xs font-bold leading-5 text-orange-700">

          سيتم إلغاء الفاتورة، وعكس أثرها على
          المخزون والدفعات المرتبطة بها، مع الاحتفاظ
          بسجل العملية.

        </div>


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
            تأكيد الإلغاء
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

    orange:
      "bg-orange-50 text-orange-600",

    red:
      "bg-red-50 text-red-600",

    purple:
      "bg-violet-50 text-violet-600",
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
          size={21}
        />

      </div>

    </div>
  );
}


function MiniPeriod({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-white/80 px-4 py-3">

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
            event.target.value
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
  disabled = false,
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
        disabled={
          disabled
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-400"
      />

    </div>
  );
}


function PaymentMethodButton({
  active,
  onClick,
  icon: Icon,
  label,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold ${
        active
          ? "border-blue-600 bg-blue-50 text-blue-700"
          : "border-slate-200 text-slate-500"
      }`}
    >

      <Icon
        size={17}
      />

      {
        label
      }

    </button>
  );
}


function FinancialBox({
  label,
  value,
  accent = false,
  positive = false,
  warning = false,
  negative = false,
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


  if (negative) {
    text =
      "text-red-600";
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


function InfoCard({
  title,
  children,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">

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
          size={15}
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

function getPurchasePaymentStatus(
  purchase
) {
  const total =
    Number(
      purchase.total ||
        0
    );

  const paid =
    Number(
      purchase.paidAmount ||
        0
    );

  const remaining =
    Number(
      purchase.remainingAmount ??
        Math.max(
          total -
            paid,
          0
        )
    );


  if (
    purchase.status ===
    "void"
  ) {
    return "unpaid";
  }


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


function getPaymentStatus(
  total,
  paid
) {
  const safeTotal =
    Number(
      total || 0
    );

  const safePaid =
    Math.min(
      Math.max(
        Number(
          paid || 0
        ),
        0
      ),
      safeTotal
    );


  if (
    safeTotal <=
      0 ||
    safePaid >=
      safeTotal
  ) {
    return "paid";
  }


  if (
    safePaid >
    0
  ) {
    return "partial";
  }


  return "unpaid";
}


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


function formatTime(
  date
) {
  if (!date) {
    return "—";
  }

  return new Date(
    date
  ).toLocaleTimeString(
    "ar-EG",
    {
      hour:
        "2-digit",
      minute:
        "2-digit",
    }
  );
}


function formatGroupDate(
  date
) {
  if (!date) {
    return "بدون تاريخ";
  }

  return new Date(
    `${date}T00:00:00`
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


function groupPurchasesByDate(
  purchases
) {
  const groups =
    {};

  purchases.forEach(
    (purchase) => {
      const date =
        purchase.createdAt
          ? new Date(
              purchase.createdAt
            )
              .toISOString()
              .slice(
                0,
                10
              )
          : "unknown";


      if (
        !groups[date]
      ) {
        groups[date] =
          [];
      }


      groups[date].push(
        purchase
      );
    }
  );


  return Object.entries(
    groups
  ).sort(
    ([a], [b]) => {
      if (
        a ===
        "unknown"
      ) {
        return 1;
      }


      if (
        b ===
        "unknown"
      ) {
        return -1;
      }


      return (
        new Date(
          b
        ) -
        new Date(
          a
        )
      );
    }
  );
}


export default Purchases;