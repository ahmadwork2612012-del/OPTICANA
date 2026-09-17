import {
  Search,
  WalletCards,
  Users,
  CircleDollarSign,
  CreditCard,
  Eye,
  X,
  CheckCircle2,
  Receipt,
  CalendarDays,
  User,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import useCustomerStore from "../store/customerStore";
import useSalesStore from "../store/salesStore";
import usePaymentStore from "../store/paymentStore";

function CustomerBalances() {
  const customers =
    useCustomerStore(
      (state) => state.customers
    );

  const sales =
    useSalesStore(
      (state) => state.sales
    );

  const payments =
    usePaymentStore(
      (state) => state.payments
    );

  const addPayment =
    usePaymentStore(
      (state) => state.addPayment
    );

  const fetchSales =
    useSalesStore(
      (state) => state.fetchSales
    );

  const fetchCustomers =
    useCustomerStore(
      (state) => state.fetchCustomers
    );

  const fetchPayments =
    usePaymentStore(
      (state) => state.fetchPayments
    );

  useEffect(() => {
    Promise.all([fetchCustomers(), fetchSales(), fetchPayments()]).catch((error) => {
      toast.error(error?.message || "تعذر تحميل أرصدة العملاء");
    });
  }, [fetchCustomers, fetchSales, fetchPayments]);

  const [search, setSearch] =
    useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const customerRows =
    useMemo(() => {
      return customers
        .map((customer) => {
          const customerSales =
            sales.filter(
              (sale) =>
                sale.customerId ===
                  customer.id ||
                sale.customer?.id ===
                  customer.id
            );

          const totalSales =
            customerSales.reduce(
              (sum, sale) =>
                sum +
                Number(
                  sale.total || 0
                ),
              0
            );

          const recordedSalePayments =
            payments
              .filter(
                (payment) =>
                  payment.customerId === customer.id &&
                  payment.type === "sale_payment" &&
                  payment.orderId
              )
              .reduce(
                (sum, payment) =>
                  sum + Number(payment.amount || 0),
                0
              );

          const totalPaid =
            Math.max(
              recordedSalePayments,
              0
            );

          const remaining =
            Math.max(
              totalSales -
                totalPaid,
              0
            );

          return {
            customer,
            customerSales,
            totalSales,
            totalPaid,
            remaining,
          };
        })
        .filter(
          (row) =>
            row.remaining > 0
        );
    }, [
      customers,
      sales,
      payments,
    ]);

  const filteredRows =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return customerRows;
      }

      return customerRows.filter(
        (row) =>
          row.customer.name
            ?.toLowerCase()
            .includes(value) ||
          row.customer.phone
            ?.toLowerCase()
            .includes(value)
      );
    }, [
      customerRows,
      search,
    ]);

  const totalReceivables =
    customerRows.reduce(
      (sum, row) =>
        sum +
        row.remaining,
      0
    );

  const debtorCount =
    customerRows.length;

  const totalCreditSales =
    customerRows.reduce(
      (sum, row) =>
        sum +
        row.totalSales,
      0
    );

  const selectedRow =
    selectedCustomer
      ? customerRows.find(
          (row) =>
            row.customer.id ===
            selectedCustomer.id
        )
      : null;

  const selectedPayments =
    selectedCustomer
      ? payments
          .filter(
            (payment) =>
              payment.customerId ===
              selectedCustomer.id
          )
          .sort(
            (a, b) =>
              new Date(
                b.createdAt
              ) -
              new Date(
                a.createdAt
              )
          )
      : [];

  const handlePayment = async () => {
    if (!selectedRow) {
      return;
    }

    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      toast.error("أدخل مبلغًا صحيحًا");
      return;
    }

    if (amount > selectedRow.remaining) {
      toast.error("المبلغ أكبر من الرصيد المستحق");
      return;
    }

    let remainingToApply = amount;
    const obligations = [...selectedRow.customerSales]
      .filter((sale) => Number(sale.remainingAmount || 0) > 0)
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

    try {
      for (const sale of obligations) {
        if (remainingToApply <= 0) break;
        const applied = Math.min(remainingToApply, Number(sale.remainingAmount || 0));
        await addPayment({
          customerId: selectedRow.customer.id,
          customerName: selectedRow.customer.name,
          orderId: sale.id,
          amount: applied,
          method: "cash",
          type: "SALE_PAYMENT",
          source: "admin",
          note: `تحصيل رصيد العميل — ${sale.invoiceNumber || sale.orderNumber || sale.id}`,
        });
        remainingToApply -= applied;
      }

      if (remainingToApply > 0.009) {
        throw new Error("تعذر توزيع كامل دفعة العميل على الفواتير المستحقة");
      }

      await Promise.all([fetchSales(), fetchCustomers(), fetchPayments()]);
      toast.success("تم تسجيل الدفعة وتحديث رصيد العميل");
      setPaymentAmount("");
      setSelectedCustomer(null);
    } catch (error) {
      toast.error(error?.message || "تعذر تسجيل دفعة العميل");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-xs font-black text-orange-600">
          <WalletCards size={15} />
          الذمم المدينة
        </div>

        <h1 className="text-3xl font-black text-slate-900">
          أرصدة العملاء
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          متابعة المبالغ المستحقة على العملاء وتسجيل الدفعات
          التي يتم تحصيلها منهم.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          icon={WalletCards}
          title="إجمالي المستحقات"
          value={`${totalReceivables.toLocaleString()} ج.م`}
          accent="orange"
        />

        <SummaryCard
          icon={Users}
          title="العملاء المدينون"
          value={debtorCount}
          accent="blue"
        />

        <SummaryCard
          icon={CircleDollarSign}
          title="مبيعات آجلة"
          value={`${totalCreditSales.toLocaleString()} ج.م`}
          accent="purple"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
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
            placeholder="ابحث باسم العميل أو الهاتف..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-right">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-400">
                <th className="px-6 py-4">
                  العميل
                </th>

                <th className="px-6 py-4">
                  الفواتير
                </th>

                <th className="px-6 py-4">
                  إجمالي المبيعات
                </th>

                <th className="px-6 py-4">
                  المدفوع
                </th>

                <th className="px-6 py-4">
                  المتبقي
                </th>

                <th className="px-6 py-4">
                  التفاصيل
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRows.map(
                (row) => (
                  <tr
                    key={
                      row.customer.id
                    }
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-700">
                          {row.customer.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-black text-slate-800">
                            {
                              row.customer
                                .name
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              row.customer
                                .phone ||
                              "بدون هاتف"
                            }
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="font-black text-slate-800">
                        {
                          row
                            .customerSales
                            .length
                        }
                      </span>
                    </td>

                    <td className="px-6 py-5 font-black text-slate-800">
                      {row.totalSales.toLocaleString()}{" "}
                      ج.م
                    </td>

                    <td className="px-6 py-5 font-black text-emerald-600">
                      {row.totalPaid.toLocaleString()}{" "}
                      ج.م
                    </td>

                    <td className="px-6 py-5">
                      <span className="font-black text-orange-600">
                        {row.remaining.toLocaleString()}{" "}
                        ج.م
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCustomer(
                            row.customer
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-orange-50 hover:text-orange-600"
                        title="عرض الرصيد"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {filteredRows.length ===
            0 && (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <CheckCircle2
                size={40}
                className="text-emerald-300"
              />

              <p className="mt-4 font-bold text-slate-700">
                لا توجد أرصدة مستحقة
              </p>

              <p className="mt-1 text-sm text-slate-400">
                جميع العملاء لا توجد عليهم أرصدة مطابقة للبحث.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedCustomer && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <p className="text-xs font-bold text-orange-600">
                  حساب العميل
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  {
                    selectedCustomer.name
                  }
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {
                    selectedCustomer.phone ||
                    "بدون هاتف"
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCustomer(
                    null
                  )
                }
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoBox
                  label="الإجمالي"
                  value={`${selectedRow.totalSales.toLocaleString()} ج.م`}
                />

                <InfoBox
                  label="المدفوع"
                  value={`${selectedRow.totalPaid.toLocaleString()} ج.م`}
                  green
                />

                <InfoBox
                  label="المتبقي"
                  value={`${selectedRow.remaining.toLocaleString()} ج.م`}
                  orange
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  تسجيل دفعة
                </label>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={
                      paymentAmount
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentAmount(
                        event.target
                          .value
                      )
                    }
                    placeholder="المبلغ"
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                  />

                  <button
                    type="button"
                    onClick={
                      handlePayment
                    }
                    className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
                  >
                    تحصيل
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Receipt
                    size={17}
                    className="text-slate-400"
                  />

                  <h3 className="font-black text-slate-900">
                    آخر الفواتير
                  </h3>
                </div>

                <div className="space-y-2">
                  {selectedRow.customerSales
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(
                          b.createdAt ||
                            0
                        ) -
                        new Date(
                          a.createdAt ||
                            0
                        )
                    )
                    .slice(0, 5)
                    .map(
                      (sale) => (
                        <div
                          key={
                            sale.id
                          }
                          className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                        >
                          <div>
                            <p className="text-sm font-black text-slate-800">
                              {
                                sale.invoiceNumber ||
                                sale.id
                              }
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                              {sale.createdAt
                                ? new Date(
                                    sale.createdAt
                                  ).toLocaleDateString(
                                    "ar-EG"
                                  )
                                : "—"}
                            </p>
                          </div>

                          <div className="text-left">
                            <p className="font-black text-slate-800">
                              {Number(
                                sale.total ||
                                  0
                              ).toLocaleString()}{" "}
                              ج.م
                            </p>

                            <p
                              className={`mt-1 text-[11px] font-bold ${
                                Number(
                                  sale.remainingAmount ||
                                    0
                                ) > 0
                                  ? "text-orange-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {Number(
                                sale.remainingAmount ||
                                  0
                              ) > 0
                                ? `متبقي ${Number(
                                    sale.remainingAmount ||
                                      0
                                  ).toLocaleString()}`
                                : "مدفوعة"}
                            </p>
                          </div>
                        </div>
                      )
                    )}

                  {selectedRow.customerSales
                    .length ===
                    0 && (
                    <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">
                      لا توجد فواتير.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <CreditCard
                    size={17}
                    className="text-slate-400"
                  />

                  <h3 className="font-black text-slate-900">
                    آخر الدفعات
                  </h3>
                </div>

                {selectedPayments.length >
                0 ? (
                  <div className="space-y-2">
                    {selectedPayments
                      .slice(
                        0,
                        5
                      )
                      .map(
                        (payment) => (
                          <div
                            key={
                              payment.id
                            }
                            className="flex items-center justify-between rounded-xl bg-emerald-50 p-3"
                          >
                            <div>
                              <p className="text-sm font-bold text-emerald-800">
                                دفعة
                              </p>

                              <p className="mt-1 text-[11px] text-emerald-600">
                                {payment.createdAt
                                  ? new Date(
                                      payment.createdAt
                                    ).toLocaleString(
                                      "ar-EG"
                                    )
                                  : "—"}
                              </p>
                            </div>

                            <span className="font-black text-emerald-700">
                              +
                              {Number(
                                payment.amount ||
                                  0
                              ).toLocaleString()}{" "}
                              ج.م
                            </span>
                          </div>
                        )
                      )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">
                    لا توجد دفعات مستقلة مسجلة بعد.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  accent,
}) {
  const colors = {
    blue:
      "bg-blue-50 text-blue-700",
    orange:
      "bg-orange-50 text-orange-600",
    purple:
      "bg-violet-50 text-violet-600",
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-bold text-slate-500">
          {title}
        </p>

        <p className="mt-2 text-2xl font-black text-slate-900">
          {value}
        </p>
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

function InfoBox({
  label,
  value,
  green = false,
  orange = false,
}) {
  return (
    <div
      className={`rounded-xl p-4 ${
        green
          ? "bg-emerald-50"
          : orange
            ? "bg-orange-50"
            : "bg-slate-50"
      }`}
    >
      <p className="text-xs font-bold text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 font-black ${
          green
            ? "text-emerald-600"
            : orange
              ? "text-orange-600"
              : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default CustomerBalances;