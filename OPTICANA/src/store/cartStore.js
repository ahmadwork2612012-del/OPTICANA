import {
  create,
} from "zustand";

import {
  persist,
} from "zustand/middleware";


/* =====================================
   ADD NORMALIZED CART ITEM
===================================== */

const normalizeCartItem = (
  product,
  quantity = 1
) => {
  const safeQuantity =
    Math.max(
      1,
      Number(
        quantity || 1
      )
    );

  const price =
    Number(
      product?.price ??
        product?.sellingPrice ??
        0
    );

  return {
    id:
      product.id,

    name:
      product.name || "",

    sku:
      product.sku || "",

    category:
      product.category || "",

    image:
      product.image ||
      product.images?.[0] ||
      null,

    price,

    oldPrice:
      product.oldPrice ??
      null,

    stock:
      Number(
        product.stock || 0
      ),

    quantity:
      safeQuantity,
  };
};


/* =====================================
   STORE
===================================== */

const useCartStore = create(
  persist(
    (set) => ({

      cart: [],


      /* =========================
         ADD TO CART
      ========================= */

      addToCart: (
        product,
        quantity = 1
      ) =>
        set((state) => {
          const exists =
            state.cart.find(
              (item) =>
                String(
                  item.id
                ) ===
                String(
                  product.id
                )
            );

          const requested =
            Math.max(
              1,
              Number(
                quantity || 1
              )
            );

          const stock =
            Number(
              product.stock || 0
            );


          if (exists) {
            const nextQuantity =
              stock > 0
                ? Math.min(
                    exists.quantity +
                      requested,
                    stock
                  )
                : exists.quantity +
                  requested;

            return {
              cart:
                state.cart.map(
                  (item) =>
                    String(
                      item.id
                    ) ===
                    String(
                      product.id
                    )
                      ? {
                          ...item,

                          /*
                           * تحديث السعر
                           * والبيانات الحالية
                           * من المنتج.
                           */
                          ...normalizeCartItem(
                            product,
                            nextQuantity
                          ),
                        }
                      : item
                ),
            };
          }


          const safeItem =
            normalizeCartItem(
              product,
              stock > 0
                ? Math.min(
                    requested,
                    stock
                  )
                : requested
            );


          return {
            cart: [
              ...state.cart,
              safeItem,
            ],
          };
        }),


      /* =========================
         REMOVE
      ========================= */

      removeFromCart: (
        id
      ) =>
        set((state) => ({
          cart:
            state.cart.filter(
              (item) =>
                String(
                  item.id
                ) !==
                String(id)
            ),
        })),


      /* =========================
         INCREASE
      ========================= */

      increaseQuantity: (
        id
      ) =>
        set((state) => ({
          cart:
            state.cart.map(
              (item) => {
                if (
                  String(
                    item.id
                  ) !==
                  String(id)
                ) {
                  return item;
                }

                const stock =
                  Number(
                    item.stock || 0
                  );

                if (
                  stock > 0 &&
                  item.quantity >=
                    stock
                ) {
                  return item;
                }

                return {
                  ...item,

                  quantity:
                    item.quantity +
                    1,
                };
              }
            ),
        })),


      /* =========================
         DECREASE
      ========================= */

      decreaseQuantity: (
        id
      ) =>
        set((state) => ({
          cart:
            state.cart
              .map(
                (item) =>
                  String(
                    item.id
                  ) ===
                  String(id)
                    ? {
                        ...item,

                        quantity:
                          Math.max(
                            1,
                            item.quantity -
                              1
                          ),
                      }
                    : item
              ),
        })),


      /* =========================
         SET QUANTITY
      ========================= */

      setQuantity: (
        id,
        quantity
      ) =>
        set((state) => ({
          cart:
            state.cart.map(
              (item) => {
                if (
                  String(
                    item.id
                  ) !==
                  String(id)
                ) {
                  return item;
                }

                const stock =
                  Number(
                    item.stock || 0
                  );

                let nextQuantity =
                  Math.max(
                    1,
                    Number(
                      quantity || 1
                    )
                  );

                if (
                  stock > 0
                ) {
                  nextQuantity =
                    Math.min(
                      nextQuantity,
                      stock
                    );
                }

                return {
                  ...item,

                  quantity:
                    nextQuantity,
                };
              }
            ),
        })),


      /* =========================
         CLEAR
      ========================= */

      clearCart: () =>
        set({
          cart: [],
        }),


      /* =========================
         TOTAL ITEMS
      ========================= */

      getTotalItems: () => {
        return useCartStore
          .getState()
          .cart.reduce(
            (
              total,
              item
            ) =>
              total +
              Number(
                item.quantity ||
                  0
              ),
            0
          );
      },


      /* =========================
         TOTAL PRICE
      ========================= */

      getTotal: () => {
        return useCartStore
          .getState()
          .cart.reduce(
            (
              total,
              item
            ) =>
              total +
              Number(
                item.price || 0
              ) *
                Number(
                  item.quantity ||
                    0
                ),
            0
          );
      },

    }),

    {
      name:
        "opticana-cart",
    }
  )
);


export default useCartStore;