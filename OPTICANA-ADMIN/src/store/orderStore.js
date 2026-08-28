import { create } from "zustand";

import apiClient from "../lib/apiClient";


/* =====================================
   HELPERS
===================================== */

function normalizeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


function normalizeStatus(status) {
  const value = String(
    status || "PENDING"
  )
    .trim()
    .toUpperCase();

  const map = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    PREPARING: "processing",
    READY: "shipped",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  };

  return (
    map[value] ||
    value.toLowerCase()
  );
}


function normalizePaymentMethod(method) {
  const value = String(
    method || ""
  )
    .trim()
    .toUpperCase();

  const map = {
    CASH: "cash",
    CARD: "card",
    WHATSAPP: "whatsapp",
    ONLINE: "online",
    OTHER: "other",
  };

  return (
    map[value] ||
    value.toLowerCase()
  );
}


function normalizePaymentStatus(
  status,
  paidAmount,
  remainingAmount,
  total
) {
  const value = String(
    status || ""
  )
    .trim()
    .toUpperCase();

  if (value === "PAID") {
    return "paid";
  }

  if (value === "PARTIAL") {
    return "partial";
  }

  if (value === "UNPAID") {
    return "unpaid";
  }

  const paid =
    normalizeNumber(
      paidAmount
    );

  const remaining =
    normalizeNumber(
      remainingAmount
    );

  const orderTotal =
    normalizeNumber(
      total
    );

  if (
    orderTotal <= 0 ||
    remaining <= 0
  ) {
    return "paid";
  }

  if (paid > 0) {
    return "partial";
  }

  return "unpaid";
}


/* =====================================
   BACKEND -> ADMIN
===================================== */

function normalizeOrder(order) {
  if (!order) {
    return null;
  }

  const paidAmount =
    normalizeNumber(
      order.paidAmount
    );

  const remainingAmount =
    normalizeNumber(
      order.remainingAmount
    );

  const total =
    normalizeNumber(
      order.total
    );

  return {
    id:
      order.id ||
      null,

    orderNumber:
      order.orderNumber ||
      order.id ||
      "",

    status:
      normalizeStatus(
        order.status
      ),

    paymentMethod:
      normalizePaymentMethod(
        order.paymentMethod
      ),

    paymentStatus:
      normalizePaymentStatus(
        order.paymentStatus,
        paidAmount,
        remainingAmount,
        total
      ),

    subtotal:
      normalizeNumber(
        order.subtotal
      ),

    discount:
      normalizeNumber(
        order.discount
      ),

    total,

    paidAmount,

    remainingAmount,

    currency:
      order.currency ||
      "EGP",

    notes:
      order.notes ||
      "",

    source:
      order.source ||
      "admin",

    stockApplied:
      order.stockApplied ===
      true,

    customerId:
      order.customer?.id ||
      order.customerId ||
      null,

    customer:
      order.customer
        ? {
            id:
              order.customer.id,

            name:
              order.customer.name ||
              "",

            phone:
              order.customer.phone ||
              "",
          }
        : null,

    items:
      Array.isArray(
        order.items
      )
        ? order.items.map(
            (item) => ({
              id:
                item.id ||
                null,

              productId:
                item.productId ||
                null,

              name:
                item.name ||
                "",

              sku:
                item.sku ||
                "",

              quantity:
                normalizeNumber(
                  item.quantity
                ),

              unitPrice:
                normalizeNumber(
                  item.unitPrice ??
                    item.price
                ),

              price:
                normalizeNumber(
                  item.price ??
                    item.unitPrice
                ),

              total:
                normalizeNumber(
                  item.total
                ),
            })
          )
        : [],

    createdAt:
      order.createdAt ||
      null,

    updatedAt:
      order.updatedAt ||
      null,
  };
}


/* =====================================
   ADMIN -> BACKEND
===================================== */

function buildCreatePayload(
  order
) {
  return {
    customerId:
      order.customerId ||
      order.customer?.id ||
      null,

    paymentMethod:
      String(
        order.paymentMethod ||
          "WHATSAPP"
      )
        .trim()
        .toUpperCase(),

    discount:
      normalizeNumber(
        order.discount
      ),

    notes:
      order.notes
        ? String(
            order.notes
          ).trim()
        : undefined,

    source:
      order.source
        ? String(
            order.source
          ).trim()
        : "admin",

    items:
      Array.isArray(
        order.items
      )
        ? order.items.map(
            (item) => ({
              productId:
                item.productId,

              quantity:
                Number(
                  item.quantity
                ),
            })
          )
        : [],
  };
}


function backendStatus(
  status
) {
  const value = String(
    status || ""
  )
    .trim()
    .toLowerCase();

  const map = {
    pending:
      "PENDING",

    confirmed:
      "CONFIRMED",

    processing:
      "PREPARING",

    shipped:
      "READY",

    completed:
      "COMPLETED",

    cancelled:
      "CANCELLED",
  };

  return (
    map[value] ||
    null
  );
}


function sortOrders(
  orders
) {
  return [
    ...orders,
  ].sort(
    (a, b) =>
      new Date(
        b.createdAt || 0
      ) -
      new Date(
        a.createdAt || 0
      )
  );
}


/* =====================================
   STORE
===================================== */

const useOrderStore =
  create(
    (set, get) => ({

      orders: [],

      isLoading:
        false,

      error:
        null,


      /* =================================
         FETCH ALL ORDERS
      ================================= */

      fetchOrders:
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
                "/admin/orders"
              );

            const orders =
              Array.isArray(
                data
              )
                ? data
                    .map(
                      normalizeOrder
                    )
                    .filter(
                      Boolean
                    )
                : [];

            const sorted =
              sortOrders(
                orders
              );

            set({
              orders:
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
         FETCH ONE
      ================================= */

      fetchOrderById:
        async (
          orderId
        ) => {
          if (
            !orderId
          ) {
            throw new Error(
              "Order id is required"
            );
          }

          try {
            const data =
              await apiClient.get(
                `/admin/orders/${encodeURIComponent(
                  orderId
                )}`
              );

            const order =
              normalizeOrder(
                data
              );

            if (
              order
            ) {
              set(
                (state) => {
                  const exists =
                    state.orders.some(
                      (
                        current
                      ) =>
                        String(
                          current.id
                        ) ===
                        String(
                          order.id
                        )
                    );

                  return {
                    orders:
                      exists
                        ? sortOrders(
                            state.orders.map(
                              (
                                current
                              ) =>
                                String(
                                  current.id
                                ) ===
                                String(
                                  order.id
                                )
                                  ? order
                                  : current
                            )
                          )
                        : sortOrders(
                            [
                              order,
                              ...state.orders,
                            ]
                          ),
                  };
                }
              );
            }

            return order;

          } catch (
            error
          ) {
            set({
              error,
            });

            throw error;
          }
        },


      /* =================================
         CREATE
      ================================= */

      addOrder:
        async (
          order
        ) => {
          const payload =
            buildCreatePayload(
              order
            );

          const data =
            await apiClient.post(
              "/admin/orders",
              payload
            );

          const created =
            normalizeOrder(
              data
            );

          if (
            created
          ) {
            set(
              (state) => ({
                orders:
                  sortOrders([
                    created,
                    ...state.orders,
                  ]),
              })
            );
          }

          return created;
        },


      /* =================================
         UPDATE STATUS
         Backend Source of Truth
      ================================= */

      updateOrderStatus:
        async (
          orderId,
          status
        ) => {
          if (
            !orderId
          ) {
            throw new Error(
              "Order id is required"
            );
          }

          const normalizedStatus =
            backendStatus(
              status
            );

          if (
            !normalizedStatus
          ) {
            throw new Error(
              "Invalid order status"
            );
          }

          const data =
            await apiClient.patch(
              `/admin/orders/${encodeURIComponent(
                orderId
              )}/status`,
              {
                status:
                  normalizedStatus,
              }
            );

          const updated =
            normalizeOrder(
              data
            );

          if (
            updated
          ) {
            set(
              (state) => ({
                orders:
                  sortOrders(
                    state.orders.map(
                      (
                        order
                      ) =>
                        String(
                          order.id
                        ) ===
                        String(
                          orderId
                        )
                          ? updated
                          : order
                    )
                  ),
              })
            );
          }

          return updated;
        },


      /* =================================
         GET LOCAL
      ================================= */

      getOrderById:
        (
          orderId
        ) => {
          return get()
            .orders.find(
              (
                order
              ) =>
                String(
                  order.id
                ) ===
                String(
                  orderId
                )
            );
        },


      /* =================================
         FILTERS
      ================================= */

      getOrdersByStatus:
        (
          status
        ) => {
          const normalized =
            normalizeStatus(
              status
            );

          return sortOrders(
            get()
              .orders
              .filter(
                (
                  order
                ) =>
                  order.status ===
                  normalized
              )
          );
        },


      getOrdersByPaymentStatus:
        (
          status
        ) => {
          return sortOrders(
            get()
              .orders
              .filter(
                (
                  order
                ) =>
                  order.paymentStatus ===
                  status
              )
          );
        },


      getCustomerOrders:
        (
          customerId
        ) => {
          return sortOrders(
            get()
              .orders
              .filter(
                (
                  order
                ) =>
                  String(
                    order.customerId ||
                      order.customer?.id ||
                      ""
                  ) ===
                  String(
                    customerId
                  )
              )
          );
        },


      /* =================================
         TOTALS
      ================================= */

      getTotalOrderValue:
        () => {
          return get()
            .orders
            .reduce(
              (
                total,
                order
              ) =>
                total +
                normalizeNumber(
                  order.total
                ),
              0
            );
        },


      getTotalPaid:
        () => {
          return get()
            .orders
            .reduce(
              (
                total,
                order
              ) =>
                total +
                normalizeNumber(
                  order.paidAmount
                ),
              0
            );
        },


      getTotalRemaining:
        () => {
          return get()
            .orders
            .reduce(
              (
                total,
                order
              ) =>
                total +
                normalizeNumber(
                  order.remainingAmount
                ),
              0
            );
        },


      /* =================================
         DELETE
         Disabled intentionally
         
         Backend has no DELETE order
         endpoint. Financial/order history
         must not be removed locally.
      ================================= */

      deleteOrder:
        async () => {
          throw new Error(
            "Orders cannot be deleted from the client. Use the Backend order cancellation flow."
          );
        },


      /* =================================
         CLEAR LOCAL CACHE
      ================================= */

      clearOrders:
        () =>
          set({
            orders:
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


export default useOrderStore;