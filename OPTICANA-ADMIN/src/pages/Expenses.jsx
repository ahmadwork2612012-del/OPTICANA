import {
  Search,
  Plus,
  WalletCards,
  TrendingDown,
  CalendarDays,
  CreditCard,
  Banknote,
  Pencil,
  Trash2,
  X,
  Receipt,
  Tag,
  FileText,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import useExpenseStore from "../store/expenseStore";

const EXPENSE_CATEGORIES = [
  "إيجار",
  "كهرباء",
  "مياه",
  "إنترنت",
  "رواتب",
  "تسويق",
  "نقل",
  "صيانة",
  "مستلزمات",
  "أخرى",
];

function Expenses() {
  const expenses = useExpenseStore(
    (state) => state.expenses
  );

  const addExpense = useExpenseStore(
    (state) => state.addExpense
  );

  const updateExpense = useExpenseStore(
    (state) => state.updateExpense
  );

  const deleteExpense = useExpenseStore(
    (state) => state.deleteExpense
  );

  const fetchExpenses = useExpenseStore(
    (state) => state.fetchExpenses
  );

  useEffect(() => {
    fetchExpenses().catch((error) => {
      toast.error(error?.message || "تعذر تحميل المصروفات");
    });
  }, [fetchExpenses]);

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [showForm, setShowForm] =
    useState(false);

  const [editingExpense, setEditingExpense] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const filteredExpenses =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      return [...expenses]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
        )
        .filter((expense) => {
          const matchesSearch =
            !value ||
            expense.description
              ?.toLowerCase()
              .includes(value) ||
            expense.category
              ?.toLowerCase()
              .includes(value) ||
            expense.id
              ?.toLowerCase()
              .includes(value);

          const matchesCategory =
            categoryFilter ===
              "all" ||
            expense.category ===
              categoryFilter;

          return (
            matchesSearch &&
            matchesCategory
          );
        });
    }, [
      expenses,
      search,
      categoryFilter,
    ]);

  const totalExpenses =
    expenses.reduce(
      (sum, expense) =>
        sum +
        Number(
          expense.amount ??
            expense.total ??
            0
        ),
      0
    );

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const todayExpenses =
    expenses
      .filter(
        (expense) =>
          expense.createdAt?.slice(
            0,
            10
          ) === today
      )
      .reduce(
        (sum, expense) =>
          sum +
          Number(
            expense.amount ??
              expense.total ??
              0
          ),
        0
      );

  const currentMonth =
    today.slice(0, 7);

  const monthExpenses =
    expenses
      .filter(
        (expense) =>
          expense.createdAt?.slice(
            0,
            7
          ) === currentMonth
      )
      .reduce(
        (sum, expense) =>
          sum +
          Number(
            expense.amount ??
              expense.total ??
              0
          ),
        0
      );

  const topCategory = useMemo(() => {
    const totals = {};

    expenses.forEach(
      (expense) => {
        const category =
          expense.category ||
          "أخرى";

        totals[category] =
          (totals[category] || 0) +
          Number(
            expense.amount ??
              expense.total ??
              0
          );
      }
    );

    return (
      Object.entries(totals)
        .sort(
          (a, b) =>
            b[1] - a[1]
        )[0] || null
    );
  }, [expenses]);

  const openAddForm = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const openEditForm = (
    expense
  ) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleSubmit = async (expenseData) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
        toast.success("تم تحديث المصروف");
      } else {
        await addExpense(expenseData);
        toast.success("تم تسجيل المصروف");
      }
      closeForm();
    } catch (error) {
      toast.error(error?.message || "تعذر حفظ المصروف");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExpense(deleteTarget.id);
      toast.success("تم حذف المصروف");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.message || "تعذر حذف المصروف");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600">
            <TrendingDown size={15} />
            المصروفات التشغيلية
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            المصاريف
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            تسجيل المصروفات التشغيلية ومتابعة تأثيرها
            على صافي ربح OPTICANA.
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
          تسجيل مصروف
        </button>
      </div>

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={WalletCards}
          title="إجمالي المصاريف"
          value={`${totalExpenses.toLocaleString()} ج.م`}
          accent="blue"
        />

        <SummaryCard
          icon={TrendingDown}
          title="مصروفات اليوم"
          value={`${todayExpenses.toLocaleString()} ج.م`}
          accent="red"
        />

        <SummaryCard
          icon={CalendarDays}
          title="مصروفات هذا الشهر"
          value={`${monthExpenses.toLocaleString()} ج.م`}
          accent="orange"
        />

        <SummaryCard
          icon={Tag}
          title="أعلى تصنيف"
          value={
            topCategory
              ? topCategory[0]
              : "—"
          }
          description={
            topCategory
              ? `${Number(
                  topCategory[1]
                ).toLocaleString()} ج.م`
              : "لا توجد بيانات"
          }
          accent="purple"
        />
      </div>

      {/* Filters */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search
              size={18}
              className="text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="ابحث بوصف المصروف أو التصنيف أو الرقم..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            value={
              categoryFilter
            }
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-500 lg:w-56"
          >
            <option value="all">
              كل التصنيفات
            </option>

            {EXPENSE_CATEGORIES.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-right">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-400">
                <th className="px-6 py-4">
                  المصروف
                </th>

                <th className="px-6 py-4">
                  التصنيف
                </th>

                <th className="px-6 py-4">
                  المبلغ
                </th>

                <th className="px-6 py-4">
                  الدفع
                </th>

                <th className="px-6 py-4">
                  التاريخ
                </th>

                <th className="px-6 py-4">
                  ملاحظات
                </th>

                <th className="px-6 py-4">
                  الإجراءات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(
                (expense) => (
                  <tr
                    key={expense.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Description */}

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                          <Receipt size={18} />
                        </div>

                        <div>
                          <p className="font-black text-slate-800">
                            {
                              expense.description ||
                              "مصروف"
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {expense.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}

                    <td className="px-6 py-5">
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                        {
                          expense.category ||
                          "أخرى"
                        }
                      </span>
                    </td>

                    {/* Amount */}

                    <td className="px-6 py-5">
                      <span className="font-black text-red-600">
                        -
                        {Number(
                          expense.amount ??
                            expense.total ??
                            0
                        ).toLocaleString()}{" "}
                        ج.م
                      </span>
                    </td>

                    {/* Payment */}

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        {expense.paymentMethod ===
                        "card" ? (
                          <CreditCard size={16} />
                        ) : (
                          <Banknote size={16} />
                        )}

                        {expense.paymentMethod ===
                        "card"
                          ? "بطاقة"
                          : "كاش"}
                      </div>
                    </td>

                    {/* Date */}

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays size={15} />

                        {formatDate(
                          expense.createdAt
                        )}
                      </div>
                    </td>

                    {/* Notes */}

                    <td className="max-w-64 px-6 py-5">
                      <p className="truncate text-sm text-slate-500">
                        {expense.notes ||
                          "—"}
                      </p>
                    </td>

                    {/* Actions */}

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              expense
                            )
                          }
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
                          title="تعديل"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget(
                              expense
                            )
                          }
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                          title="حذف"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {filteredExpenses.length ===
            0 && (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <WalletCards
                size={42}
                className="text-slate-300"
              />

              <p className="mt-4 font-bold text-slate-700">
                لا توجد مصاريف
              </p>

              <p className="mt-1 text-sm text-slate-400">
                لم يتم تسجيل أي مصروف مطابق للفلاتر.
              </p>

              {!search &&
                categoryFilter ===
                  "all" && (
                  <button
                    type="button"
                    onClick={
                      openAddForm
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
                  >
                    <Plus size={17} />
                    تسجيل أول مصروف
                  </button>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Form */}

      {showForm && (
        <ExpenseForm
          expense={
            editingExpense
          }
          onClose={
            closeForm
          }
          onSubmit={
            handleSubmit
          }
        />
      )}

      {/* Delete */}

      {deleteTarget && (
        <DeleteModal
          expense={
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


/* =========================
   FORM
========================= */

function ExpenseForm({
  expense,
  onClose,
  onSubmit,
}) {
  const [form, setForm] =
    useState({
      description:
        expense?.description ||
        "",

      category:
        expense?.category ||
        "أخرى",

      amount:
        expense?.amount ??
        expense?.total ??
        "",

      paymentMethod:
        expense?.paymentMethod ||
        "cash",

      notes:
        expense?.notes ||
        "",
    });

  const updateField = (
    key,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (!form.description.trim()) {
      toast.error(
        "اكتب وصف المصروف"
      );
      return;
    }

    const amount =
      Number(form.amount);

    if (
      !amount ||
      amount <= 0
    ) {
      toast.error(
        "أدخل مبلغًا صحيحًا"
      );
      return;
    }

    onSubmit({
      description:
        form.description.trim(),

      category:
        form.category,

      amount,

      paymentMethod:
        form.paymentMethod,

      notes:
        form.notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <p className="text-xs font-bold text-red-500">
              المصروفات التشغيلية
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {expense
                ? "تعديل المصروف"
                : "تسجيل مصروف"}
            </h2>
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

        <form
          onSubmit={submit}
          className="space-y-5 p-6"
        >
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              وصف المصروف
            </label>

            <input
              value={
                form.description
              }
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="مثال: فاتورة كهرباء أغسطس"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                التصنيف
              </label>

              <select
                value={
                  form.category
                }
                onChange={(event) =>
                  updateField(
                    "category",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
              >
                {EXPENSE_CATEGORIES.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                المبلغ
              </label>

              <input
                type="number"
                min="0"
                value={
                  form.amount
                }
                onChange={(event) =>
                  updateField(
                    "amount",
                    event.target.value
                  )
                }
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          {/* Payment */}

          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">
              طريقة الدفع
            </p>

            <div className="grid grid-cols-2 gap-2">
              <PaymentButton
                active={
                  form.paymentMethod ===
                  "cash"
                }
                icon={Banknote}
                label="كاش"
                onClick={() =>
                  updateField(
                    "paymentMethod",
                    "cash"
                  )
                }
              />

              <PaymentButton
                active={
                  form.paymentMethod ===
                  "card"
                }
                icon={CreditCard}
                label="بطاقة"
                onClick={() =>
                  updateField(
                    "paymentMethod",
                    "card"
                  )
                }
              />
            </div>
          </div>

          {/* Notes */}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              ملاحظات
            </label>

            <textarea
              rows={4}
              value={
                form.notes
              }
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value
                )
              }
              placeholder="أي ملاحظات إضافية..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          {/* Footer */}

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
              {expense
                ? "حفظ التعديلات"
                : "تسجيل المصروف"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* =========================
   DELETE
========================= */

function DeleteModal({
  expense,
  onClose,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <Trash2 size={21} />
        </div>

        <h2 className="mt-4 text-lg font-black text-slate-900">
          حذف المصروف؟
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          هل تريد حذف المصروف{" "}
          <strong className="text-slate-800">
            {
              expense.description
            }
          </strong>
          ؟
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
            حذف المصروف
          </button>
        </div>
      </div>
    </div>
  );
}


/* =========================
   UI
========================= */

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

    red:
      "bg-red-50 text-red-600",

    orange:
      "bg-orange-50 text-orange-600",

    purple:
      "bg-violet-50 text-violet-600",
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-slate-500">
          {title}
        </p>

        <p className="mt-2 text-2xl font-black text-slate-900">
          {value}
        </p>

        {description && (
          <p className="mt-1 text-[11px] text-slate-400">
            {description}
          </p>
        )}
      </div>

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          colors[accent]
        }`}
      >
        <Icon size={21} />
      </div>
    </div>
  );
}


function PaymentButton({
  active,
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition ${
        active
          ? "border-blue-600 bg-blue-50 text-blue-700"
          : "border-slate-200 text-slate-500 hover:bg-slate-50"
      }`}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}


function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Date(
    date
  ).toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default Expenses;