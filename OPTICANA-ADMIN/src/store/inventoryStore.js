import { create } from "zustand";

import apiClient from "../lib/apiClient";


/* =====================================
   HELPERS
===================================== */

function normalizeMovementType(
  type,
  quantity
) {
  const value =
    String(
      type ||
        ""
    )
      .trim()
      .toUpperCase();

  const map = {
    SALE:
      "sale",

    PURCHASE:
      "purchase",

    REPAIR:
      "repair",

    ADJUSTMENT:
      Number(
        quantity || 0
      ) >= 0
        ? "stock_in"
        : "stock_out",

    RETURN_IN:
      "stock_in",

    RETURN_OUT:
      "stock_out",

    DAMAGE:
      "stock_out",

    INITIAL:
      "stock_in",
  };

  return (
    map[value] ||
    value.toLowerCase()
  );
}


function normalizeMovement(
  movement
) {
  if (!movement) {
    return null;
  }

  const rawQuantity =
    Number(
      movement.quantity ||
        0
    );

  /*
    Backend may return the movement
    directly or nested inside movement.
  */
  const data =
    movement.movement ||
    movement;

  const quantity =
    Number(
      data.quantity ??
        rawQuantity
    );


  return {
    id:
      data.id ||
      null,

    productId:
      data.productId ||
      movement.productId ||
      null,

    productName:
      data.productName ||
      movement.productName ||
      data.product?.name ||
      movement.product?.name ||
      null,

    productSku:
      data.productSku ||
      movement.productSku ||
      data.product?.sku ||
      movement.product?.sku ||
      null,

    userId:
      data.userId ||
      movement.userId ||
      null,

    type:
      normalizeMovementType(
        data.type ||
          movement.type,
        quantity
      ),

    backendType:
      data.type ||
      movement.type ||
      null,

    quantity,

    stockAfter:
      Number(
        data.stockAfter ??
          movement.stockAfter ??
          0
      ),

    source:
      data.source ||
      movement.source ||
      inferSource(
        data.type ||
          movement.type
      ),

    reference:
      data.reference ||
      data.note ||
      movement.reference ||
      movement.note ||
      "",

    note:
      data.note ||
      movement.note ||
      "",

    createdAt:
      data.createdAt ||
      movement.createdAt ||
      null,
  };
}


function inferSource(
  type
) {
  const value =
    String(
      type ||
        ""
    )
      .trim()
      .toUpperCase();

  const map = {
    SALE:
      "sale",

    PURCHASE:
      "purchase",

    REPAIR:
      "repair",

    ADJUSTMENT:
      "manual",

    RETURN_IN:
      "inventory",

    RETURN_OUT:
      "inventory",

    DAMAGE:
      "inventory",

    INITIAL:
      "inventory",
  };

  return (
    map[value] ||
    "inventory"
  );
}


function sortMovements(
  movements
) {
  return [
    ...movements,
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
}


/* =====================================
   STORE
===================================== */

const useInventoryStore =
  create(
    (set, get) => ({

      movements: [],

      isLoading:
        false,

      error:
        null,


      /* =================================
         FETCH ALL MOVEMENTS
      ================================= */

      fetchMovements:
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
                "/admin/inventory"
              );

            const movements =
              Array.isArray(
                data
              )
                ? data
                    .map(
                      normalizeMovement
                    )
                    .filter(
                      Boolean
                    )
                : [];

            const sorted =
              sortMovements(
                movements
              );

            set({
              movements:
                sorted,

              isLoading:
                false,

              error:
                null,
            });

            return sorted;

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
         FETCH PRODUCT MOVEMENTS
      ================================= */

      fetchProductMovements:
        async (
          productId
        ) => {
          if (!productId) {
            throw new Error(
              "Product id is required"
            );
          }

          const data =
            await apiClient.get(
              `/admin/inventory?productId=${encodeURIComponent(
                productId
              )}`
            );

          const movements =
            Array.isArray(
              data
            )
              ? data
                  .map(
                    normalizeMovement
                  )
                  .filter(
                    Boolean
                  )
              : [];

          const sorted =
            sortMovements(
              movements
            );


          set(
            (state) => {
              const otherMovements =
                state.movements.filter(
                  (
                    movement
                  ) =>
                    String(
                      movement.productId
                    ) !==
                    String(
                      productId
                    )
                );

              return {
                movements:
                  sortMovements([
                    ...otherMovements,
                    ...sorted,
                  ]),
              };
            }
          );

          return sorted;
        },


      /* =================================
         ADJUST STOCK
         Backend = Source of Truth
      ================================= */

      adjustStock:
        async (
          productId,
          quantity,
          reason = ""
        ) => {
          if (!productId) {
            throw new Error(
              "Product id is required"
            );
          }

          const amount =
            Number(
              quantity
            );

          if (
            !Number.isInteger(
              amount
            ) ||
            amount === 0
          ) {
            throw new Error(
              "Stock adjustment must be a non-zero integer"
            );
          }


          const data =
            await apiClient.post(
              `/admin/inventory/${encodeURIComponent(
                productId
              )}/adjust`,
              {
                quantity:
                  amount,

                reason:
                  String(
                    reason ||
                      ""
                  ).trim(),
              }
            );


          /*
            The backend may return:
            {
              movement: {...},
              product: {...}
            }

            or the movement itself.
          */

          const normalized =
            normalizeMovement(
              data
            );


          if (
            normalized
          ) {
            set(
              (state) => ({
                movements:
                  sortMovements([
                    normalized,
                    ...state.movements.filter(
                      (
                        movement
                      ) =>
                        movement.id !==
                        normalized.id
                    ),
                  ]),
              })
            );
          }


          return {
            movement:
              normalized,

            raw:
              data,
          };
        },


      /* =================================
         GET PRODUCT MOVEMENTS
         Loaded Backend state only
      ================================= */

      getProductMovements:
        (
          productId
        ) => {
          return sortMovements(
            get()
              .movements
              .filter(
                (
                  movement
                ) =>
                  String(
                    movement.productId
                  ) ===
                  String(
                    productId
                  )
              )
          );
        },


      /* =================================
         GET TODAY
      ================================= */

      getTodayMovements:
        () => {
          const today =
            new Date()
              .toISOString()
              .slice(
                0,
                10
              );

          return sortMovements(
            get()
              .movements
              .filter(
                (
                  movement
                ) =>
                  movement.createdAt
                    ?.slice(
                      0,
                      10
                    ) ===
                  today
              )
          );
        },


      /* =================================
         CLEAR UI CACHE
         Does NOT affect DB
      ================================= */

      clearMovements:
        () =>
          set({
            movements:
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


export default useInventoryStore;