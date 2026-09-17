import {
  Search,
  Plus,
  Users,
  Phone,
  Pencil,
  Trash2,
  X,
  UserRound,
  ShoppingBag,
  Wrench,
  ClipboardList,
  CreditCard,
  WalletCards,
  Eye,
  MapPin,
  Mail,
  Receipt,
  ArrowLeft,
  Clock3,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import useCustomerStore from "../store/customerStore";


/* =====================================
   PAGE
===================================== */

function Customers() {
  /* =====================================
     CUSTOMER STORE
  ===================================== */

  const customers =
    useCustomerStore(
      (state) =>
        state.customers
    );

  const isLoading =
    useCustomerStore(
      (state) =>
        state.isLoading
    );

  const fetchCustomers =
    useCustomerStore(
      (state) =>
        state.fetchCustomers
    );

  const fetchCustomerById =
    useCustomerStore(
      (state) =>
        state.fetchCustomerById
    );

  const addCustomer =
    useCustomerStore(
      (state) =>
        state.addCustomer
    );

  const updateCustomer =
    useCustomerStore(
      (state) =>
        state.updateCustomer
    );

  const deleteCustomer =
    useCustomerStore(
      (state) =>
        state.deleteCustomer
    );


  /* =====================================
     UI
  ===================================== */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingCustomer,
    setEditingCustomer,
  ] = useState(null);

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState(null);

  const [
    customerToDelete,
    setCustomerToDelete,
  ] = useState(null);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);


  const [
    form,
    setForm,
  ] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    notes: "",
  });


  /* =====================================
     INITIAL LOAD
  ===================================== */

  useEffect(() => {
    fetchCustomers().catch(
      (error) => {
        toast.error(
          error?.message ||
            "تعذر تحميل العملاء"
        );
      }
    );
  }, [
    fetchCustomers,
  ]);


  /* =====================================
     SEARCH
  ===================================== */

  const filteredCustomers =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return customers;
      }

      return customers.filter(
        (
          customer
        ) =>
          customer.name
            ?.toLowerCase()
            .includes(
              value
            ) ||
          customer.phone
            ?.toLowerCase()
            .includes(
              value
            ) ||
          customer.whatsapp
            ?.toLowerCase()
            .includes(
              value
            ) ||
          customer.email
            ?.toLowerCase()
            .includes(
              value
            ) ||
          customer.address
            ?.toLowerCase()
            .includes(
              value
            )
      );
    }, [
      customers,
      search,
    ]);


  /* =====================================
     GLOBAL SUMMARY
  ===================================== */

  const customerSummaries =
    useMemo(() => {
      return customers.map(
        (
          customer
        ) => ({
          customer,

          summary:
            normalizeSummary(
              customer.summary
            ),
        })
      );
    }, [
      customers,
    ]);


  const customersWithOrders =
    customerSummaries.filter(
      ({
        summary,
      }) =>
        summary.ordersCount >
        0
    ).length;


  const customersWithRepairs =
    customerSummaries.filter(
      ({
        summary,
      }) =>
        summary.repairsCount >
        0
    ).length;


  const debtorCustomers =
    customerSummaries.filter(
      ({
        summary,
      }) =>
        summary.totalRemaining >
        0
    );


  const totalCustomerSpend =
    customerSummaries.reduce(
      (
        sum,
        {
          summary,
        }
      ) =>
        sum +
        summary.totalSpend,
      0
    );


  const totalCustomerPaid =
    customerSummaries.reduce(
      (
        sum,
        {
          summary,
        }
      ) =>
        sum +
        summary.totalPaid,
      0
    );


  const totalCustomerRemaining =
    customerSummaries.reduce(
      (
        sum,
        {
          summary,
        }
      ) =>
        sum +
        summary.totalRemaining,
      0
    );


  const totalOrders =
    customerSummaries.reduce(
      (
        sum,
        {
          summary,
        }
      ) =>
        sum +
        summary.ordersTotal,
      0
    );


  const totalRepairs =
    customerSummaries.reduce(
      (
        sum,
        {
          summary,
        }
      ) =>
        sum +
        summary.repairsTotal,
      0
    );


  /* =====================================
     CUSTOMER SUMMARY
  ===================================== */

  const getCustomerStats =
    (
      customer
    ) => {
      const summary =
        normalizeSummary(
          customer.summary
        );


      const orders =
        Array.isArray(
          customer.orders
        )
          ? customer.orders
          : [];


      const repairs =
        Array.isArray(
          customer.repairs
        )
          ? customer.repairs
          : [];


      const interactions = [
        ...orders.map(
          (
            order
          ) => ({
            type:
              "order",

            date:
              order.createdAt,

            title:
              order.orderNumber ||
              order.id,

            description:
              "طلب متجر",

            amount:
              Number(
                order.total ||
                  0
              ),

            remaining:
              order.remainingAmount !==
              undefined
                ? Number(
                    order.remainingAmount ||
                      0
                  )
                : 0,
          })
        ),

        ...repairs.map(
          (
            repair
          ) => ({
            type:
              "repair",

            date:
              repair.createdAt,

            title:
              repair.repairNumber ||
              repair.id,

            description:
              `صيانة • ${
                repair.title ||
                "منتج"
              }`,

            amount:
              Number(
                repair.finalCost ||
                  repair.estimatedCost ||
                  0
              ),

            remaining:
              repair.remainingAmount !==
              undefined
                ? Number(
                    repair.remainingAmount ||
                      0
                  )
                : Math.max(
                    Number(
                      repair.finalCost ||
                        repair.estimatedCost ||
                        0
                    ) -
                      Number(
                        repair.paidAmount ||
                          0
                      ),
                    0
                  ),
          })
        ),
      ]
        .sort(
          (
            a,
            b
          ) =>
            new Date(
              b.date ||
                0
            ) -
            new Date(
              a.date ||
                0
            )
        )
        .slice(
          0,
          8
        );


      return {
        customerOrders:
          orders,

        customerRepairs:
          repairs,

        ordersTotal:
          summary.ordersTotal,

        ordersPaid:
          summary.ordersPaid,

        ordersRemaining:
          summary.ordersRemaining,

        repairsTotal:
          summary.repairsTotal,

        repairsPaid:
          summary.repairsPaid,

        repairRemaining:
          summary.repairsRemaining,

        totalSpend:
          summary.totalSpend,

        totalPaid:
          summary.totalPaid,

        totalRemaining:
          summary.totalRemaining,

        interactions,
      };
    };


  /* =====================================
     FORM
  ===================================== */

  const openAddForm =
    () => {
      setEditingCustomer(
        null
      );

      setForm({
        name: "",
        phone: "",
        whatsapp: "",
        email: "",
        address: "",
        notes: "",
      });

      setShowForm(
        true
      );
    };


  const openEditForm =
    (
      customer
    ) => {
      setEditingCustomer(
        customer
      );

      setForm({
        name:
          customer.name ||
          "",

        phone:
          customer.phone ||
          "",

        whatsapp:
          customer.whatsapp ||
          "",

        email:
          customer.email ||
          "",

        address:
          customer.address ||
          "",

        notes:
          customer.notes ||
          "",
      });

      setShowForm(
        true
      );
    };


  const closeForm =
    () => {
      setShowForm(
        false
      );

      setEditingCustomer(
        null
      );

      setForm({
        name: "",
        phone: "",
        whatsapp: "",
        email: "",
        address: "",
        notes: "",
      });
    };


  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      const name =
        form.name.trim();

      const phone =
        form.phone.trim();

      if (!name) {
        toast.error(
          "اكتب اسم العميل"
        );

        return;
      }

      try {
        setIsSubmitting(
          true
        );


        if (
          editingCustomer
        ) {
          await updateCustomer(
            editingCustomer.id,
            {
              ...form,

              name,

              phone,
            }
          );

          toast.success(
            "تم تحديث بيانات العميل"
          );
        } else {
          await addCustomer({
            ...form,

            name,

            phone,
          });

          toast.success(
            "تم إضافة العميل بنجاح"
          );
        }


        await fetchCustomers();

        closeForm();

      } catch (
        error
      ) {
        toast.error(
          error?.message ||
            "تعذر حفظ بيانات العميل"
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };


  /* =====================================
     OPEN PROFILE
  ===================================== */

  const openCustomerProfile =
    async (
      customer
    ) => {
      try {
        const detailedCustomer =
          await fetchCustomerById(
            customer.id
          );

        setSelectedCustomer(
          detailedCustomer ||
            customer
        );

      } catch (
        error
      ) {
        toast.error(
          error?.message ||
            "تعذر تحميل ملف العميل"
        );
      }
    };


  /* =====================================
     DELETE
  ===================================== */

  const confirmDelete =
    async () => {
      if (
        !customerToDelete
      ) {
        return;
      }

      try {
        setIsSubmitting(
          true
        );

        await deleteCustomer(
          customerToDelete.id
        );

        toast.success(
          "تم حذف العميل"
        );

        if (
          selectedCustomer?.id ===
          customerToDelete.id
        ) {
          setSelectedCustomer(
            null
          );
        }

        setCustomerToDelete(
          null
        );

      } catch (
        error
      ) {
        toast.error(
          error?.message ||
            "تعذر حذف العميل"
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };


  return (
    <div className="space-y-6">

      {/* =================================
          HEADER
      ================================= */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
            <Users size={15} />
            قاعدة العملاء
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            العملاء
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            إدارة بيانات العملاء ومتابعة الطلبات وعمليات الصيانة والحالة المالية لكل عميل.
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
          إضافة عميل
        </button>

      </div>


      {/* =================================
          SUMMARY
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <SummaryCard
          icon={Users}
          title="إجمالي العملاء"
          value={
            customers.length
          }
          accent="blue"
        />

        <SummaryCard
          icon={ShoppingBag}
          title="لديهم طلبات"
          value={
            customersWithOrders
          }
          accent="green"
        />

        <SummaryCard
          icon={Wrench}
          title="لديهم صيانة"
          value={
            customersWithRepairs
          }
          accent="purple"
        />

        <SummaryCard
          icon={AlertTriangle}
          title="العملاء المدينون"
          value={
            debtorCustomers.length
          }
          description={`${totalCustomerRemaining.toLocaleString()} ج.م مستحقات`}
          accent="orange"
        />

        <SummaryCard
          icon={CircleDollarIcon}
          title="إجمالي التعامل"
          value={`${totalCustomerSpend.toLocaleString()} ج.م`}
          description={`محصل ${totalCustomerPaid.toLocaleString()} ج.م`}
          accent="blue"
        />

      </div>


      {/* =================================
          RECEIVABLES
      ================================= */}

      <div
        className={`rounded-2xl border p-5 ${
          totalCustomerRemaining >
          0
            ? "border-orange-200 bg-orange-50"
            : "border-emerald-200 bg-emerald-50"
        }`}
      >

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div className="flex items-start gap-3">

            <div
              className={`rounded-xl p-3 ${
                totalCustomerRemaining >
                0
                  ? "bg-white text-orange-600"
                  : "bg-white text-emerald-600"
              }`}
            >
              {totalCustomerRemaining >
              0 ? (
                <WalletCards
                  size={21}
                />
              ) : (
                <CheckCircle2
                  size={21}
                />
              )}
            </div>

            <div>

              <p
                className={`text-sm font-black ${
                  totalCustomerRemaining >
                  0
                    ? "text-orange-800"
                    : "text-emerald-800"
                }`}
              >
                {totalCustomerRemaining >
                0
                  ? "لديك مبالغ مستحقة على العملاء"
                  : "لا توجد أرصدة مستحقة على العملاء"}
              </p>

              <p
                className={`mt-1 text-xs ${
                  totalCustomerRemaining >
                  0
                    ? "text-orange-600"
                    : "text-emerald-600"
                }`}
              >
                {totalCustomerRemaining >
                0
                  ? `${totalCustomerRemaining.toLocaleString()} ج.م على ${debtorCustomers.length} عميل`
                  : "جميع العملاء مسددون حاليًا."}
              </p>

            </div>

          </div>


          {totalCustomerRemaining >
            0 && (
            <div className="rounded-xl bg-white px-5 py-3">

              <p className="text-[10px] font-bold text-slate-400">
                إجمالي المستحقات
              </p>

              <p className="mt-1 text-xl font-black text-orange-600">
                {totalCustomerRemaining.toLocaleString()} ج.م
              </p>

            </div>
          )}

        </div>

      </div>


      {/* =================================
          FINANCIAL BAR
      ================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="grid gap-4 sm:grid-cols-2">

          <FinancialTile
            icon={ClipboardList}
            label="إجمالي الطلبات"
            value={`${totalOrders.toLocaleString()} ج.م`}
          />

          <FinancialTile
            icon={Wrench}
            label="إجمالي الصيانة"
            value={`${totalRepairs.toLocaleString()} ج.م`}
          />

        </div>

      </div>


      {/* =================================
          SEARCH
      ================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

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
            placeholder="ابحث باسم العميل أو الهاتف أو البريد أو العنوان..."
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

      </div>


      {/* =================================
          CUSTOMERS
      ================================= */}

      {isLoading &&
      customers.length ===
        0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

          <p className="mt-4 text-sm font-bold text-slate-500">
            جاري تحميل العملاء...
          </p>

        </div>
      ) : filteredCustomers.length ===
        0 ? (
        <EmptyCustomers
          hasSearch={
            Boolean(
              search
            )
          }
          onAdd={
            openAddForm
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {filteredCustomers.map(
            (
              customer
            ) => {
              const stats =
                getCustomerStats(
                  customer
                );

              return (
                <CustomerCard
                  key={
                    customer.id
                  }
                  customer={
                    customer
                  }
                  stats={
                    stats
                  }
                  onOpen={() =>
                    openCustomerProfile(
                      customer
                    )
                  }
                  onEdit={() =>
                    openEditForm(
                      customer
                    )
                  }
                  onDelete={() =>
                    setCustomerToDelete(
                      customer
                    )
                  }
                />
              );
            }
          )}

        </div>
      )}


      {/* =================================
          ADD / EDIT
      ================================= */}

      {showForm && (
        <CustomerForm
          customer={
            editingCustomer
          }
          form={
            form
          }
          setForm={
            setForm
          }
          isSubmitting={
            isSubmitting
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
          PROFILE
      ================================= */}

      {selectedCustomer && (
        <CustomerProfile
          customer={
            selectedCustomer
          }
          stats={getCustomerStats(
            selectedCustomer
          )}
          onClose={() =>
            setSelectedCustomer(
              null
            )
          }
          onEdit={() => {
            setSelectedCustomer(
              null
            );

            openEditForm(
              selectedCustomer
            );
          }}
        />
      )}


      {/* =================================
          DELETE
      ================================= */}

      {customerToDelete && (
        <DeleteModal
          customer={
            customerToDelete
          }
          stats={getCustomerStats(
            customerToDelete
          )}
          isSubmitting={
            isSubmitting
          }
          onClose={() =>
            setCustomerToDelete(
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
   CUSTOMER CARD
===================================== */

function CustomerCard({
  customer,
  stats,
  onOpen,
  onEdit,
  onDelete,
}) {
  const lastInteraction =
    stats.interactions[0];

  const isDebtor =
    stats.totalRemaining >
    0;


  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        isDebtor
          ? "border-orange-200"
          : "border-slate-200"
      }`}
    >

      <div className="flex items-start justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black ${
              isDebtor
                ? "bg-orange-50 text-orange-600"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {customer.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0">

            <h2 className="truncate font-black text-slate-900">
              {
                customer.name
              }
            </h2>

            <div className="mt-1 flex items-center gap-2">

              <p className="text-xs text-slate-400">
                عميل مسجل
              </p>

              {isDebtor && (
                <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-[10px] font-black text-orange-600">
                  <AlertTriangle
                    size={10}
                  />
                  عليه رصيد
                </span>
              )}

              {!isDebtor && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600">
                  <CheckCircle2
                    size={10}
                  />
                  مسدد
                </span>
              )}

            </div>

          </div>

        </div>


        <div className="flex gap-1">

          <button
            type="button"
            onClick={
              onEdit
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
            title="تعديل"
          >
            <Pencil
              size={16}
            />
          </button>

          <button
            type="button"
            onClick={
              onDelete
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
            title="حذف"
          >
            <Trash2
              size={16}
            />
          </button>

        </div>

      </div>


      {/* Contact */}

      <div className="mt-5 space-y-2">

        {customer.phone && (
          <ContactLine
            icon={
              Phone
            }
            value={
              customer.phone
            }
          />
        )}

        {customer.email && (
          <ContactLine
            icon={
              Mail
            }
            value={
              customer.email
            }
          />
        )}

        {customer.address && (
          <ContactLine
            icon={
              MapPin
            }
            value={
              customer.address
            }
          />
        )}

        {!customer.phone &&
          !customer.email &&
          !customer.address && (
            <p className="text-sm text-slate-400">
              لا توجد بيانات تواصل إضافية.
            </p>
          )}

      </div>


      {/* Financial */}

      <div className="mt-5 grid grid-cols-2 gap-2">

        <StatBox
          label="إجمالي التعامل"
          value={`${stats.totalSpend.toLocaleString()} ج.م`}
          blue
        />

        <StatBox
          label="المتبقي"
          value={`${stats.totalRemaining.toLocaleString()} ج.م`}
          orange={
            isDebtor
          }
        />

        <StatBox
          label="المدفوع"
          value={`${stats.totalPaid.toLocaleString()} ج.م`}
          green
        />

        <StatBox
          label="الطلبات"
          value={
            stats.customerOrders
              .length
          }
        />

      </div>


      {isDebtor && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-orange-50 p-3">

          <div className="flex items-center gap-2">

            <WalletCards
              size={16}
              className="text-orange-600"
            />

            <span className="text-xs font-black text-orange-700">
              عليه رصيد مستحق
            </span>

          </div>

          <span className="text-sm font-black text-orange-600">
            {
              stats.totalRemaining.toLocaleString()
            }{" "}
            ج.م
          </span>

        </div>
      )}


      <div className="mt-4 border-t border-slate-100 pt-4">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-[11px] font-bold text-slate-400">
              آخر تعامل
            </p>

            <p className="mt-1 text-xs font-bold text-slate-600">
              {lastInteraction
                ? lastInteraction.title
                : "لا توجد عمليات"}
            </p>

          </div>

          <span className="text-[11px] text-slate-400">
            {lastInteraction
              ? formatDateShort(
                  lastInteraction.date
                )
              : customer.createdAt
                ? formatDateShort(
                    customer.createdAt
                  )
                : "—"}
          </span>

        </div>

      </div>


      <button
        type="button"
        onClick={
          onOpen
        }
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black transition ${
          isDebtor
            ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
            : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
        }`}
      >
        <Eye size={16} />

        عرض ملف العميل

        <ArrowLeft
          size={15}
        />

      </button>

    </div>
  );
}


/* =====================================
   PROFILE
===================================== */

function CustomerProfile({
  customer,
  stats,
  onClose,
  onEdit,
}) {
  const isDebtor =
    stats.totalRemaining >
    0;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div className="flex items-center gap-4">

            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black ${
                isDebtor
                  ? "bg-orange-50 text-orange-600"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {customer.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <p className="text-xs font-bold text-blue-600">
                ملف العميل
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                {
                  customer.name
                }
              </h2>

              <div className="mt-1 flex items-center gap-2">

                <p className="text-xs text-slate-400">
                  عميل منذ{" "}
                  {customer.createdAt
                    ? formatDateShort(
                        customer.createdAt
                      )
                    : "—"}
                </p>

                {isDebtor ? (
                  <span className="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-black text-orange-600">
                    عليه رصيد
                  </span>
                ) : (
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600">
                    مسدد
                  </span>
                )}

              </div>

            </div>

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


        <div className="overflow-y-auto p-6">

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">

            <DetailMetric
              icon={
                CircleDollarIcon
              }
              label="إجمالي التعامل"
              value={`${stats.totalSpend.toLocaleString()} ج.م`}
            />

            <DetailMetric
              icon={
                ClipboardList
              }
              label="الطلبات"
              value={`${stats.ordersTotal.toLocaleString()} ج.م`}
            />

            <DetailMetric
              icon={
                Wrench
              }
              label="الصيانة"
              value={`${stats.repairsTotal.toLocaleString()} ج.م`}
            />

            <DetailMetric
              icon={
                CreditCard
              }
              label="المدفوع"
              value={`${stats.totalPaid.toLocaleString()} ج.م`}
            />

            <DetailMetric
              icon={
                WalletCards
              }
              label="المتبقي"
              value={`${stats.totalRemaining.toLocaleString()} ج.م`}
              warning={
                isDebtor
              }
            />

          </div>


          <div
            className={`mt-4 rounded-2xl border p-5 ${
              isDebtor
                ? "border-orange-200 bg-orange-50"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-white p-3">

                  {isDebtor ? (
                    <AlertTriangle
                      size={21}
                      className="text-orange-600"
                    />
                  ) : (
                    <CheckCircle2
                      size={21}
                      className="text-emerald-600"
                    />
                  )}

                </div>

                <div>

                  <p
                    className={`text-sm font-black ${
                      isDebtor
                        ? "text-orange-800"
                        : "text-emerald-800"
                    }`}
                  >
                    {isDebtor
                      ? "العميل عليه رصيد مستحق"
                      : "العميل مسدد بالكامل"}
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      isDebtor
                        ? "text-orange-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {isDebtor
                      ? `${stats.totalRemaining.toLocaleString()} ج.م متبقية`
                      : "لا توجد مبالغ مستحقة حاليًا."}
                  </p>

                </div>

              </div>


              <div className="text-left">

                <p className="text-[11px] font-bold text-slate-400">
                  إجمالي المدفوع
                </p>

                <p
                  className={`mt-1 text-xl font-black ${
                    isDebtor
                      ? "text-orange-700"
                      : "text-emerald-700"
                  }`}
                >
                  {
                    stats.totalPaid.toLocaleString()
                  }{" "}
                  ج.م
                </p>

              </div>

            </div>

          </div>


          <div className="mt-6 rounded-2xl border border-slate-200 p-5">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="font-black text-slate-900">
                  بيانات التواصل
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  معلومات العميل الأساسية.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  onEdit
                }
                className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-black text-blue-700 hover:bg-blue-100"
              >
                <Pencil
                  size={15}
                />
                تعديل
              </button>

            </div>


            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

              <InfoBox
                icon={Phone}
                label="الهاتف"
                value={
                  customer.phone ||
                  "غير مسجل"
                }
              />

              <InfoBox
                icon={Mail}
                label="البريد"
                value={
                  customer.email ||
                  "غير مسجل"
                }
              />

              <InfoBox
                icon={MapPin}
                label="العنوان"
                value={
                  customer.address ||
                  "غير مسجل"
                }
              />

              <InfoBox
                icon={Phone}
                label="واتساب"
                value={
                  customer.whatsapp ||
                  "غير مسجل"
                }
              />

              <InfoBox
                icon={UserRound}
                label="المعرف"
                value={
                  customer.id
                }
              />

            </div>

          </div>


          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">

            <div className="border-b border-slate-200 p-5">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                  <Clock3
                    size={18}
                  />
                </div>

                <div>

                  <h3 className="font-black text-slate-900">
                    آخر التعاملات
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    الطلبات والصيانة المرتبطة بالعميل.
                  </p>

                </div>

              </div>

            </div>


            {stats.interactions.length ===
            0 ? (
              <div className="p-10 text-center text-sm text-slate-400">
                لا توجد تعاملات مسجلة لهذا العميل.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">

                {stats.interactions.map(
                  (
                    interaction,
                    index
                  ) => (
                    <InteractionRow
                      key={`${interaction.type}-${interaction.title}-${index}`}
                      interaction={
                        interaction
                      }
                    />
                  )
                )}

              </div>
            )}

          </div>


          {stats.customerRepairs.length >
            0 && (
            <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/50 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-black text-slate-900">
                    ملخص الصيانة
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    عمليات الصيانة المرتبطة بهذا العميل.
                  </p>

                </div>

                <Wrench
                  size={20}
                  className="text-violet-600"
                />

              </div>


              <div className="mt-4 grid gap-3 sm:grid-cols-3">

                <InfoBox
                  icon={Wrench}
                  label="عدد الصيانات"
                  value={
                    stats.customerRepairs
                      .length
                  }
                />

                <InfoBox
                  icon={CreditCard}
                  label="مدفوع الصيانة"
                  value={`${stats.repairsPaid.toLocaleString()} ج.م`}
                />

                <InfoBox
                  icon={WalletCards}
                  label="متبقي الصيانة"
                  value={`${stats.repairRemaining.toLocaleString()} ج.م`}
                />

              </div>

            </div>
          )}


          {customer.notes && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold text-slate-400">
                ملاحظات
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {
                  customer.notes
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
            إغلاق ملف العميل
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   INTERACTION
===================================== */

function InteractionRow({
  interaction,
}) {
  const config =
    {
      order: {
        label:
          "طلب",

        icon:
          ClipboardList,

        className:
          "bg-violet-50 text-violet-700",
      },

      repair: {
        label:
          "صيانة",

        icon:
          Wrench,

        className:
          "bg-orange-50 text-orange-600",
      },
    }[
      interaction.type
    ] || {
      label:
        "تعامل",

      icon:
        Clock3,

      className:
        "bg-slate-100 text-slate-600",
    };


  const Icon =
    config.icon;


  const hasRemaining =
    Number(
      interaction.remaining ||
        0
    ) > 0;


  return (
    <div className="flex items-center justify-between gap-4 p-5">

      <div className="flex min-w-0 items-center gap-3">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.className}`}
        >
          <Icon
            size={18}
          />
        </div>

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <p className="font-black text-slate-800">
              {
                interaction.title
              }
            </p>

            <span
              className={`rounded-md px-2 py-1 text-[10px] font-black ${config.className}`}
            >
              {
                config.label
              }
            </span>

          </div>

          <p className="mt-1 text-xs text-slate-400">
            {
              interaction.description
            }
          </p>

          {hasRemaining && (
            <p className="mt-1 text-[11px] font-black text-orange-600">
              متبقي{" "}
              {
                Number(
                  interaction.remaining
                ).toLocaleString()
              }{" "}
              ج.م
            </p>
          )}

        </div>

      </div>


      <div className="shrink-0 text-left">

        <p className="font-black text-slate-800">
          {
            Number(
              interaction.amount ||
                0
            ).toLocaleString()
          }{" "}
          ج.م
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          {
            formatDateShort(
              interaction.date
            )
          }
        </p>

      </div>

    </div>
  );
}


/* =====================================
   FORM
===================================== */

function CustomerForm({
  customer,
  form,
  setForm,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

      <div className="flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-6">

          <div>

            <p className="text-xs font-bold text-blue-600">
              قاعدة العملاء
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {customer
                ? "تعديل العميل"
                : "إضافة عميل"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              إدارة بيانات العميل الأساسية.
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>

        </div>


        {/* SCROLLABLE CONTENT */}

        <form
          onSubmit={onSubmit}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6"
        >

          <TextField
            label="اسم العميل"
            value={form.name}
            onChange={(value) =>
              setForm({
                ...form,
                name: value,
              })
            }
            placeholder="مثال: أحمد محمد"
            required
          />


          <TextField
            label="رقم الهاتف"
            value={form.phone}
            onChange={(value) =>
              setForm({
                ...form,
                phone: value,
              })
            }
            placeholder="01012345678"
          />


          <TextField
            label="واتساب"
            value={form.whatsapp}
            onChange={(value) =>
              setForm({
                ...form,
                whatsapp: value,
              })
            }
            placeholder="01012345678"
          />


          <TextField
            label="البريد الإلكتروني"
            value={form.email}
            onChange={(value) =>
              setForm({
                ...form,
                email: value,
              })
            }
            placeholder="example@email.com"
          />


          <TextField
            label="العنوان"
            value={form.address}
            onChange={(value) =>
              setForm({
                ...form,
                address: value,
              })
            }
            placeholder="عنوان العميل"
          />


          <TextArea
            label="ملاحظات"
            value={form.notes}
            onChange={(value) =>
              setForm({
                ...form,
                notes: value,
              })
            }
            placeholder="أي ملاحظات إضافية..."
          />


          {/* FOOTER */}

          <div className="flex gap-3 border-t border-slate-100 pt-4">

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >

              <UserRound size={17} />

              {isSubmitting
                ? "جاري الحفظ..."
                : customer
                  ? "حفظ التعديلات"
                  : "إضافة العميل"}

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
  customer,
  stats,
  isSubmitting,
  onClose,
  onConfirm,
}) {
  const hasHistory =
    stats.customerOrders.length >
      0 ||
    stats.customerRepairs.length >
      0;


  const hasBalance =
    stats.totalRemaining >
    0;


  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <Trash2
            size={21}
          />
        </div>


        <h2 className="mt-4 text-lg font-black text-slate-900">
          حذف العميل؟
        </h2>


        <p className="mt-2 text-sm leading-6 text-slate-500">
          هل تريد حذف العميل{" "}
          <strong className="text-slate-800">
            {
              customer.name
            }
          </strong>
          ؟
        </p>


        {hasBalance && (
          <div className="mt-3 rounded-xl bg-orange-50 p-3 text-xs leading-5 text-orange-700">
            <strong>
              تنبيه:
            </strong>{" "}
            هذا العميل عليه رصيد قدره{" "}
            <strong>
              {
                stats.totalRemaining.toLocaleString()
              }{" "}
              ج.م
            </strong>
            . يفضّل تحصيله أو التعامل معه قبل الحذف.
          </div>
        )}


        {hasHistory && (
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            هذا العميل لديه سجل تعاملات في النظام.
            قد يمنع الـBackend الحذف إذا كانت هناك علاقات
            مرتبطة بالعميل، وهذا مقصود لحماية السجلات المالية.
          </div>
        )}


        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isSubmitting
            }
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            إلغاء
          </button>


          <button
            type="button"
            onClick={
              onConfirm
            }
            disabled={
              isSubmitting
            }
            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {isSubmitting
              ? "جاري الحذف..."
              : "حذف العميل"}
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   EMPTY
===================================== */

function EmptyCustomers({
  hasSearch,
  onAdd,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
        <Users size={32} />
      </div>


      <h2 className="mt-4 font-black text-slate-700">
        {hasSearch
          ? "لا يوجد عميل مطابق"
          : "لا يوجد عملاء حتى الآن"}
      </h2>


      <p className="mt-2 text-sm text-slate-400">
        {hasSearch
          ? "جرّب البحث باسم أو رقم هاتف مختلف."
          : "أضف أول عميل إلى قاعدة العملاء."}
      </p>


      {!hasSearch && (
        <button
          type="button"
          onClick={
            onAdd
          }
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
        >
          <Plus size={17} />
          إضافة عميل
        </button>
      )}

    </div>
  );
}


/* =====================================
   UI HELPERS
===================================== */

function SummaryCard({
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

    purple:
      "bg-violet-50 text-violet-600",

    orange:
      "bg-orange-50 text-orange-600",
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

        {description && (
          <p className="mt-1 text-[11px] text-slate-400">
            {
              description
            }
          </p>
        )}

      </div>


      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors[accent]}`}
      >
        <Icon
          size={21}
        />
      </div>

    </div>
  );
}


function FinancialTile({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

      <div>

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

      </div>


      <div className="rounded-xl bg-white p-2.5 text-blue-700 shadow-sm">
        <Icon size={18} />
      </div>

    </div>
  );
}


function StatBox({
  label,
  value,
  blue = false,
  orange = false,
  green = false,
}) {
  let className =
    "bg-slate-50 text-slate-800";


  if (blue) {
    className =
      "bg-blue-50 text-blue-700";
  }


  if (orange) {
    className =
      "bg-orange-50 text-orange-600";
  }


  if (green) {
    className =
      "bg-emerald-50 text-emerald-600";
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


function DetailMetric({
  icon: Icon,
  label,
  value,
  warning = false,
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        warning
          ? "border-orange-200 bg-orange-50"
          : "border-slate-200 bg-white"
      }`}
    >

      <div className="flex items-center justify-between">

        <p className="text-xs font-bold text-slate-400">
          {
            label
          }
        </p>

        <div
          className={`rounded-lg p-2 ${
            warning
              ? "bg-white text-orange-600"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          <Icon
            size={16}
          />
        </div>

      </div>


      <p
        className={`mt-3 text-lg font-black ${
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


function InfoBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex items-center gap-2">

        <Icon
          size={15}
          className="text-slate-400"
        />

        <p className="text-[11px] font-bold text-slate-400">
          {
            label
          }
        </p>

      </div>


      <p className="mt-2 break-words text-sm font-black text-slate-700">
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
        size={15}
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
            event.target
              .value
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
        rows={4}
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


/* =====================================
   HELPERS
===================================== */

function normalizeSummary(
  summary
) {
  return {
    ordersCount:
      Number(
        summary?.ordersCount ||
          0
      ),

    ordersTotal:
      Number(
        summary?.ordersTotal ||
          0
      ),

    ordersPaid:
      Number(
        summary?.ordersPaid ||
          0
      ),

    ordersRemaining:
      Number(
        summary?.ordersRemaining ||
          0
      ),

    repairsCount:
      Number(
        summary?.repairsCount ||
          0
      ),

    repairsTotal:
      Number(
        summary?.repairsTotal ||
          0
      ),

    repairsPaid:
      Number(
        summary?.repairsPaid ||
          0
      ),

    repairsRemaining:
      Number(
        summary?.repairsRemaining ||
          0
      ),

    paymentsTotal:
      Number(
        summary?.paymentsTotal ||
          0
      ),

    totalSpend:
      Number(
        summary?.totalSpend ||
          0
      ),

    totalPaid:
      Number(
        summary?.totalPaid ||
          0
      ),

    totalRemaining:
      Number(
        summary?.totalRemaining ||
          0
      ),
  };
}


function CircleDollarIcon(
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
        cy="12"
        r="10"
      />

      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />

      <path d="M12 6v12" />
    </svg>
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


export default Customers;