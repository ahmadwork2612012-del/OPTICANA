import { create } from "zustand";

import apiClient from "../lib/apiClient";


/* =====================================
   HELPERS
===================================== */

function normalizeAmount(
  value
) {
  const number =
    Number(
      value
    );

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}


function normalizeMethod(
  method
) {
  const value =
    String(
      method ||
        "CASH"
    )
      .trim()
      .toUpperCase();

  const methods = {
    CASH:
      "cash",

    CARD:
      "card",

    WHATSAPP:
      "whatsapp",

    ONLINE:
      "online",

    OTHER:
      "other",

    REPAIR_PAYMENT:
      "repair_payment",
  };

  return (
    methods[value] ||
    "cash"
  );
}


function normalizeType(
  type
) {
  const value =
    String(
      type ||
        ""
    )
      .trim()
      .toUpperCase();

  const types = {
    SALE_PAYMENT:
      "sale_payment",

    PURCHASE_PAYMENT:
      "purchase_payment",

    EXPENSE_PAYMENT:
      "expense_payment",

    REPAIR_PAYMENT:
      "repair_payment",

    OTHER:
      "other",
  };

  return (
    types[value] ||
    "other"
  );
}


/* =====================================
   BACKEND -> ADMIN
===================================== */

function fromBackend(
  payment
) {
  if (!payment) {
    return null;
  }

  return {
    id:
      payment.id,

    amount:
      normalizeAmount(
        payment.amount
      ),

    type:
      normalizeType(
        payment.type
      ),

    method:
      normalizeMethod(
        payment.method
      ),

    source:
      payment.source ||
      "admin",

    customerId:
      payment.customerId ||
      null,

    supplierId:
      payment.supplierId ||
      null,

    orderId:
      payment.orderId ||
      payment.saleId ||
      null,

    purchaseId:
      payment.purchaseId ||
      null,

    expenseId:
      payment.expenseId ||
      null,

    repairId:
      payment.repairId ||
      null,

    note:
      payment.note ||
      "",

    createdAt:
      payment.createdAt ||
      null,

    updatedAt:
      payment.updatedAt ||
      null,
  };
}


/* =====================================
   ADMIN -> BACKEND
===================================== */

function toBackend(
  payment
) {
  const amount =
    normalizeAmount(
      payment.amount
    );


  const type =
    String(
      payment.type ||
        "other"
    )
      .trim()
      .toUpperCase();


  const method =
    String(
      payment.method ||
        "cash"
    )
      .trim()
      .toUpperCase();


  const typeMap = {
    SALE_PAYMENT:
      "SALE_PAYMENT",

    PURCHASE_PAYMENT:
      "PURCHASE_PAYMENT",

    EXPENSE_PAYMENT:
      "EXPENSE_PAYMENT",

    REPAIR_PAYMENT:
      "REPAIR_PAYMENT",

    OTHER:
      "OTHER",

    SALE:
      "SALE_PAYMENT",

    PURCHASE:
      "PURCHASE_PAYMENT",

    EXPENSE:
      "EXPENSE_PAYMENT",

    REPAIR:
      "REPAIR_PAYMENT",

    OTHER_PAYMENT:
      "OTHER",
  };


  const methodMap = {
    CASH:
      "CASH",

    CARD:
      "CARD",

    WHATSAPP:
      "WHATSAPP",

    ONLINE:
      "ONLINE",

    OTHER:
      "OTHER",
  };


  return {
    amount,

    type:
      typeMap[type] ||
      "OTHER",

    method:
      methodMap[method] ||
      "CASH",

    source:
      payment.source
        ? String(
            payment.source
          ).trim()
        : "admin",

    customerId:
      payment.customerId ||
      null,

    supplierId:
      payment.supplierId ||
      null,

    orderId:
      payment.orderId ||
      payment.saleId ||
      null,

    purchaseId:
      payment.purchaseId ||
      null,

    expenseId:
      payment.expenseId ||
      null,

    repairId:
      payment.repairId ||
      null,

    note:
      payment.note
        ? String(
            payment.note
          ).trim()
        : null,
  };
}


/* =====================================
   STORE
===================================== */

const usePaymentStore =
  create(
    (set, get) => ({

      payments: [],

      isLoading:
        false,

      error:
        null,


      /* =================================
         CREATE PAYMENT
         Backend = Source of Truth
      ================================= */

      addPayment:
        async (
          payment
        ) => {
          const payload =
            toBackend(
              payment
            );


          const created =
            await apiClient.post(
              "/admin/payments",
              payload
            );


          const normalized =
            fromBackend(
              created
            );


          if (
            normalized
          ) {
            set(
              (state) => {

                const alreadyExists =
                  state.payments.some(
                    (
                      currentPayment
                    ) =>
                      currentPayment.id ===
                      normalized.id
                  );


                if (
                  alreadyExists
                ) {
                  return state;
                }


                return {
                  payments: [
                    normalized,
                    ...state.payments,
                  ],
                };
              }
            );
          }


          return normalized;
        },


      fetchPayments:
        async () => {
          set({ isLoading: true, error: null });
          try {
            const data = await apiClient.get("/admin/payments");
            const payments = Array.isArray(data)
              ? data.map(fromBackend).filter(Boolean)
              : [];
            set({ payments, isLoading: false, error: null });
            return payments;
          } catch (error) {
            set({ isLoading: false, error });
            throw error;
          }
        },


      /* =================================
         FETCH SUPPLIER PAYMENTS
         Confirmed Backend Endpoint
      ================================= */

      fetchSupplierPayments:
        async (
          supplierId
        ) => {
          if (
            !supplierId
          ) {
            return [];
          }


          set({
            isLoading:
              true,

            error:
              null,
          });


          try {
            const data =
              await apiClient.get(
                `/admin/payments/supplier/${encodeURIComponent(
                  supplierId
                )}`
              );


            const payments =
              Array.isArray(
                data
              )
                ? data
                    .map(
                      fromBackend
                    )
                    .filter(
                      Boolean
                    )
                : [];


            set(
              (state) => {

                const withoutSupplierPayments =
                  state.payments.filter(
                    (
                      payment
                    ) =>
                      String(
                        payment.supplierId
                      ) !==
                      String(
                        supplierId
                      )
                  );


                return {
                  payments: [
                    ...payments,
                    ...withoutSupplierPayments,
                  ],

                  isLoading:
                    false,

                  error:
                    null,
                };
              }
            );


            return payments;

          } catch (
            error
          ) {
            set({
              isLoading:
                false,

              error,
            });

            throw error;
          }
        },


      /* =================================
         PURCHASE PAYMENTS
         Local selector over loaded
         Backend records
      ================================= */

      getPurchasePayments:
        (
          purchaseId
        ) => {
          return [
            ...get()
              .payments
              .filter(
                (
                  payment
                ) =>
                  String(
                    payment.purchaseId
                  ) ===
                  String(
                    purchaseId
                  )
              ),
          ].sort(
            (a, b) =>
              new Date(
                b.createdAt ||
                  0
              ) -
              new Date(
                a.createdAt ||
                  0
              )
          );
        },


      getPurchasePaidTotal:
        (
          purchaseId
        ) => {
          return get()
            .getPurchasePayments(
              purchaseId
            )
            .reduce(
              (
                total,
                payment
              ) =>
                total +
                normalizeAmount(
                  payment.amount
                ),
              0
            );
        },


      /* =================================
         SUPPLIER PAYMENTS
      ================================= */

      getSupplierPayments:
        (
          supplierId
        ) => {
          return [
            ...get()
              .payments
              .filter(
                (
                  payment
                ) =>
                  String(
                    payment.supplierId
                  ) ===
                  String(
                    supplierId
                  )
              ),
          ].sort(
            (a, b) =>
              new Date(
                b.createdAt ||
                  0
              ) -
              new Date(
                a.createdAt ||
                  0
              )
          );
        },


      getSupplierPaidTotal:
        (
          supplierId
        ) => {
          return get()
            .getSupplierPayments(
              supplierId
            )
            .reduce(
              (
                total,
                payment
              ) =>
                total +
                normalizeAmount(
                  payment.amount
                ),
              0
            );
        },


      /* =================================
         CUSTOMER PAYMENTS
      ================================= */

      getCustomerPayments:
        (
          customerId
        ) => {
          return [
            ...get()
              .payments
              .filter(
                (
                  payment
                ) =>
                  String(
                    payment.customerId
                  ) ===
                  String(
                    customerId
                  )
              ),
          ].sort(
            (a, b) =>
              new Date(
                b.createdAt ||
                  0
              ) -
              new Date(
                a.createdAt ||
                  0
              )
          );
        },


      getCustomerPaidTotal:
        (
          customerId
        ) => {
          return get()
            .getCustomerPayments(
              customerId
            )
            .reduce(
              (
                total,
                payment
              ) =>
                total +
                normalizeAmount(
                  payment.amount
                ),
              0
            );
        },


      /* =================================
         SALE PAYMENTS
      ================================= */

      getSalePayments:
        (
          saleId
        ) => {
          return [
            ...get()
              .payments
              .filter(
                (
                  payment
                ) =>
                  String(
                    payment.orderId ||
                    payment.saleId ||
                      ""
                  ) ===
                  String(
                    saleId
                  )
              ),
          ].sort(
            (a, b) =>
              new Date(
                b.createdAt ||
                  0
              ) -
              new Date(
                a.createdAt ||
                  0
              )
          );
        },


      getSalePaidTotal:
        (
          saleId
        ) => {
          return get()
            .getSalePayments(
              saleId
            )
            .reduce(
              (
                total,
                payment
              ) =>
                total +
                normalizeAmount(
                  payment.amount
                ),
              0
            );
        },


      /* =================================
         FILTERS
      ================================= */

      getPaymentsByType:
        (
          type
        ) => {
          const normalizedType =
            normalizeType(
              type
            );


          return [
            ...get()
              .payments
              .filter(
                (
                  payment
                ) =>
                  payment.type ===
                  normalizedType
              ),
          ].sort(
            (a, b) =>
              new Date(
                b.createdAt ||
                  0
              ) -
              new Date(
                a.createdAt ||
                  0
              )
          );
        },


      getPaymentsByMethod:
        (
          method
        ) => {
          const normalizedMethod =
            normalizeMethod(
              method
            );


          return [
            ...get()
              .payments
              .filter(
                (
                  payment
                ) =>
                  payment.method ===
                  normalizedMethod
              ),
          ].sort(
            (a, b) =>
              new Date(
                b.createdAt ||
                  0
              ) -
              new Date(
                a.createdAt ||
                  0
              )
          );
        },


      /* =================================
         GLOBAL TOTALS
      ================================= */

      getTotalCollectedFromCustomers:
        () => {
          return get()
            .payments
            .filter(
              (
                payment
              ) =>
                payment.type ===
                "sale_payment"
            )
            .reduce(
              (
                total,
                payment
              ) =>
                total +
                normalizeAmount(
                  payment.amount
                ),
              0
            );
        },


      getTotalPaidToSuppliers:
        () => {
          return get()
            .payments
            .filter(
              (
                payment
              ) =>
                payment.type ===
                "purchase_payment"
            )
            .reduce(
              (
                total,
                payment
              ) =>
                total +
                normalizeAmount(
                  payment.amount
                ),
              0
            );
        },


      getTodayPayments:
        () => {
          const today =
            new Date()
              .toISOString()
              .slice(
                0,
                10
              );


          return [
            ...get()
              .payments
              .filter(
                (
                  payment
                ) =>
                  payment.createdAt
                    ?.slice(
                      0,
                      10
                    ) ===
                  today
              ),
          ].sort(
            (a, b) =>
              new Date(
                b.createdAt ||
                  0
              ) -
              new Date(
                a.createdAt ||
                  0
              )
          );
        },


      /* =================================
         UPDATE
         Disabled intentionally:
         Payments are Ledger records.
      ================================= */

      updatePayment:
        async () => {
          throw new Error(
            "Payments are ledger records and cannot be edited."
          );
        },


      /* =================================
         DELETE
         Disabled intentionally:
         Use reversal through Backend.
      ================================= */

      deletePayment:
        async () => {
          throw new Error(
            "Payments cannot be deleted. Use a backend reversal instead."
          );
        },


      /* =================================
         CLEAR UI STATE
         Does NOT affect database
      ================================= */

      clearPayments:
        () =>
          set({
            payments:
              [],
          }),


      /* =================================
         ERROR
      ================================= */

      clearError:
        () =>
          set({
            error:
              null,
          }),
    })
  );


export default usePaymentStore;