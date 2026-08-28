import { create } from "zustand";

import apiClient from "../lib/apiClient";


/* =====================================
   HELPERS
===================================== */

function normalizeAmount(
  value
) {
  return Math.max(
    Number(
      value || 0
    ),
    0
  );
}


function getPaymentStatus(
  total,
  paidAmount
) {
  const safeTotal =
    normalizeAmount(
      total
    );

  const safePaid =
    Math.min(
      normalizeAmount(
        paidAmount
      ),
      safeTotal
    );

  if (
    safeTotal <= 0 ||
    safePaid >= safeTotal
  ) {
    return "paid";
  }

  if (
    safePaid > 0
  ) {
    return "partial";
  }

  return "unpaid";
}


function getRemainingAmount(
  total,
  paidAmount
) {
  const safeTotal =
    normalizeAmount(
      total
    );

  const safePaid =
    Math.min(
      normalizeAmount(
        paidAmount
      ),
      safeTotal
    );

  return Math.max(
    safeTotal -
      safePaid,
    0
  );
}


function normalizeItems(
  items
) {
  if (
    !Array.isArray(
      items
    )
  ) {
    return [];
  }

  return items.map(
    (item) => {
      const quantity =
        Math.max(
          Number(
            item.quantity || 0
          ),
          0
        );

      const purchasePrice =
        normalizeAmount(
          item.purchasePrice ??
            item.price ??
            0
        );

      const total =
        normalizeAmount(
          item.total ??
            purchasePrice *
              quantity
        );

      return {
        ...item,

        quantity,

        purchasePrice,

        price:
          purchasePrice,

        total,
      };
    }
  );
}


/* =====================================
   BACKEND -> ADMIN
===================================== */

function fromBackend(
  purchase
) {
  if (!purchase) {
    return null;
  }

  const total =
    normalizeAmount(
      purchase.total
    );

  const paidAmount =
    normalizeAmount(
      purchase.paidAmount
    );

  const remainingAmount =
    getRemainingAmount(
      total,
      paidAmount
    );

  const backendStatus =
    String(
      purchase.status ||
        "RECEIVED"
    ).toUpperCase();

  const backendPaymentStatus =
    String(
      purchase.paymentStatus ||
        getPaymentStatus(
          total,
          paidAmount
        )
    ).toLowerCase();


  return {
    id:
      purchase.id,

    invoiceNumber:
      purchase.invoiceNumber ||
      "",

    supplierId:
      purchase.supplierId ||
      purchase.supplier?.id ||
      null,

    supplier:
      purchase.supplier
        ? {
            ...purchase.supplier,

            company:
              purchase.supplier
                .company ||
              "",
          }
        : null,

    items:
      normalizeItems(
        purchase.items
      ),

    subtotal:
      normalizeAmount(
        purchase.subtotal
      ),

    discount:
      normalizeAmount(
        purchase.discount
      ),

    total,

    paidAmount,

    paymentMethod:
      String(
        purchase.paymentMethod ||
        "CASH"
      ).toUpperCase(),

    /*
      Backend is the source
      of truth for financial
      state.
    */
    remainingAmount,

    paymentStatus:
      backendPaymentStatus,

    status:
      backendStatus ===
      "VOID"
        ? "void"
        : backendStatus.toLowerCase(),

    stockApplied:
      purchase.stockApplied ===
      true,

    source:
      purchase.source ||
      "admin",

    notes:
      purchase.notes ||
      "",

    voidedAt:
      purchase.voidedAt ||
      null,

    voidReason:
      purchase.voidReason ||
      "",

    createdAt:
      purchase.createdAt ||
      null,

    updatedAt:
      purchase.updatedAt ||
      null,
  };
}


/* =====================================
   ADMIN -> BACKEND
===================================== */

function toCreatePayload(
  purchase
) {
  return {
    supplierId:
      purchase.supplierId ||
      purchase.supplier?.id ||
      null,

    /*
      invoiceNumber will be sent
      when available.

      Backend should eventually
      generate it when omitted.
    */
    ...(purchase.invoiceNumber
      ? {
          invoiceNumber:
            String(
              purchase.invoiceNumber
            ).trim(),
        }
      : {}),

    discount:
      normalizeAmount(
        purchase.discount
      ),

    paidAmount:
      normalizeAmount(
        purchase.paidAmount
      ),

    paymentMethod:
      String(
        purchase.paymentMethod ||
        "CASH"
      ).toUpperCase(),

    notes:
      purchase.notes
        ? String(
            purchase.notes
          ).trim()
        : null,

    source:
      purchase.source ||
      "admin",

    items:
      normalizeItems(
        purchase.items
      ).map(
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
      ),
  };
}


function toUpdatePayload(
  updates
) {
  const payload = {};


  if (
    updates.supplierId !==
      undefined ||
    updates.supplier?.id
  ) {
    payload.supplierId =
      updates.supplierId ??
      updates.supplier?.id ??
      null;
  }


  if (
    updates.discount !==
    undefined
  ) {
    payload.discount =
      normalizeAmount(
        updates.discount
      );
  }


  if (
    updates.notes !==
    undefined
  ) {
    payload.notes =
      updates.notes
        ? String(
            updates.notes
          ).trim()
        : null;
  }


  /*
    Backend currently protects
    stock-applied purchase items.

    Therefore items are only
    forwarded when explicitly
    provided by the caller.
  */
  if (
    updates.items !==
    undefined
  ) {
    payload.items =
      normalizeItems(
        updates.items
      ).map(
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
  }


  return payload;
}


/* =====================================
   STORE
===================================== */

const usePurchaseStore =
  create(
    (set, get) => ({

      purchases: [],

      isLoading:
        false,

      error:
        null,


      /* =================================
         FETCH
      ================================= */

      fetchPurchases:
        async () => {
          set({
            isLoading:
              true,

            error:
              null,
          });


          try {
            const data =
              await apiClient.get(
                "/admin/purchases"
              );


            const purchases =
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


            set({
              purchases,

              isLoading:
                false,

              error:
                null,
            });


            return purchases;

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
         ADD
      ================================= */

      addPurchase:
        async (
          purchase
        ) => {
          set({
            isLoading:
              true,

            error:
              null,
          });


          try {
            const payload =
              toCreatePayload(
                purchase
              );


            const created =
              await apiClient.post(
                "/admin/purchases",
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
                (state) => ({
                  purchases: [
                    normalized,
                    ...state.purchases,
                  ],

                  isLoading:
                    false,

                  error:
                    null,
                })
              );
            } else {
              set({
                isLoading:
                  false,

                error:
                  null,
              });
            }


            return normalized;

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
         CREATE DRAFT
      ================================= */

      createDraftPurchase:
        async (
          purchase
        ) => {
          set({
            isLoading:
              true,

            error:
              null,
          });

          try {
            const payload =
              toCreatePayload({
                ...purchase,
                paidAmount: 0,
              });

            const created =
              await apiClient.post(
                "/admin/purchases/draft",
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
                (state) => ({
                  purchases: [
                    normalized,
                    ...state.purchases,
                  ],

                  isLoading:
                    false,

                  error:
                    null,
                })
              );
            } else {
              set({
                isLoading:
                  false,

                error:
                  null,
              });
            }

            return normalized;

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
         RECEIVE
      ================================= */

      receivePurchase:
        async (
          purchaseId,
          {
            paidAmount = 0,
            paymentMethod = "CASH",
          } = {}
        ) => {
          if (!purchaseId) {
            throw new Error(
              "Purchase id is required"
            );
          }

          set({
            isLoading:
              true,

            error:
              null,
          });

          try {
            const result =
              await apiClient.post(
                `/admin/purchases/${encodeURIComponent(
                  purchaseId
                )}/receive`,
                {
                  paidAmount:
                    Math.max(
                      Number(
                        paidAmount || 0
                      ),
                      0
                    ),

                  paymentMethod:
                    String(
                      paymentMethod ||
                        "CASH"
                    ).toUpperCase(),
                }
              );

            const normalized =
              fromBackend(
                result
              );

            if (
              normalized
            ) {
              set(
                (state) => ({
                  purchases:
                    state.purchases.map(
                      (
                        purchase
                      ) =>
                        String(
                          purchase.id
                        ) ===
                        String(
                          purchaseId
                        )
                          ? normalized
                          : purchase
                    ),

                  isLoading:
                    false,

                  error:
                    null,
                })
              );
            } else {
              set({
                isLoading:
                  false,

                error:
                  null,
              });
            }

            return normalized;

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
         UPDATE
      ================================= */

      updatePurchase:
        async (
          purchaseId,
          updates
        ) => {
          if (!purchaseId) {
            throw new Error(
              "Purchase id is required"
            );
          }


          set({
            isLoading:
              true,

            error:
              null,
          });


          try {
            const payload =
              toUpdatePayload(
                updates
              );


            const updated =
              await apiClient.patch(
                `/admin/purchases/${encodeURIComponent(
                  purchaseId
                )}`,
                payload
              );


            const normalized =
              fromBackend(
                updated
              );


            if (
              normalized
            ) {
              set(
                (state) => ({
                  purchases:
                    state.purchases.map(
                      (
                        purchase
                      ) =>
                        String(
                          purchase.id
                        ) ===
                        String(
                          purchaseId
                        )
                          ? normalized
                          : purchase
                    ),

                  isLoading:
                    false,

                  error:
                    null,
                })
              );
            } else {
              set({
                isLoading:
                  false,

                error:
                  null,
              });
            }


            return normalized;

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
         VOID
      ================================= */

      voidPurchase:
        async (
          purchaseId,
          reason = ""
        ) => {
          if (!purchaseId) {
            throw new Error(
              "Purchase id is required"
            );
          }


          set({
            isLoading:
              true,

            error:
              null,
          });


          try {
            const result =
              await apiClient.post(
                `/admin/purchases/${encodeURIComponent(
                  purchaseId
                )}/void`,
                {
                  reason:
                    reason || "",
                }
              );


            const normalized =
              fromBackend(
                result
              );


            if (
              normalized
            ) {
              set(
                (state) => ({
                  purchases:
                    state.purchases.map(
                      (
                        purchase
                      ) =>
                        String(
                          purchase.id
                        ) ===
                        String(
                          purchaseId
                        )
                          ? normalized
                          : purchase
                    ),

                  isLoading:
                    false,

                  error:
                    null,
                })
              );
            } else {
              set({
                isLoading:
                  false,

                error:
                  null,
              });
            }


            return normalized;

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
         DELETE
      ================================= */

      deletePurchase:
        async (
          purchaseId
        ) => {
          if (!purchaseId) {
            throw new Error(
              "Purchase id is required"
            );
          }


          set({
            isLoading:
              true,

            error:
              null,
          });


          try {
            const result =
              await apiClient.delete(
                `/admin/purchases/${encodeURIComponent(
                  purchaseId
                )}`
              );


            set(
              (state) => ({
                purchases:
                  state.purchases.filter(
                    (
                      purchase
                    ) =>
                      String(
                        purchase.id
                      ) !==
                      String(
                        purchaseId
                      )
                  ),

                isLoading:
                  false,

                error:
                  null,
              })
            );


            return result;

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
         GET BY ID
      ================================= */

      getPurchaseById:
        (
          purchaseId
        ) => {
          return get()
            .purchases.find(
              (
                purchase
              ) =>
                String(
                  purchase.id
                ) ===
                String(
                  purchaseId
                )
            );
        },


      /* =================================
         SUPPLIER PURCHASES
      ================================= */

      getSupplierPurchases:
        (
          supplierId
        ) => {
          return [
            ...get()
              .purchases
              .filter(
                (
                  purchase
                ) =>
                  String(
                    purchase.supplierId
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


      /* =================================
         TODAY PURCHASES
      ================================= */

      getTodayPurchases:
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
              .purchases
              .filter(
                (
                  purchase
                ) =>
                  purchase.createdAt
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
         CLEAR LOCAL STATE
         Compatibility only
      ================================= */

      clearPurchases:
        () =>
          set({
            purchases:
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


export default usePurchaseStore;