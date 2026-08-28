import { create } from "zustand";

import apiClient from "../lib/apiClient";


/* =====================================
   HELPERS
===================================== */

function normalizeCustomer(
  customer
) {
  if (!customer) {
    return null;
  }

  return {
    id:
      customer.id,

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

    isActive:
      customer.isActive ===
      true,

    active:
      customer.isActive ===
      true,

    ordersCount:
      Number(
        customer.ordersCount ||
          0
      ),

    orders:
      Array.isArray(
        customer.orders
      )
        ? customer.orders.map(
            (order) => ({
              id:
                order.id,

              orderNumber:
                order.orderNumber,

              status:
                order.status,

              total:
                Number(
                  order.total ||
                    0
                ),

              createdAt:
                order.createdAt ||
                null,
            })
          )
        : [],

    createdAt:
      customer.createdAt ||
      null,

    updatedAt:
      customer.updatedAt ||
      null,
  };
}


function toBackend(
  customer
) {
  return {
    name:
      String(
        customer.name ||
          ""
      ).trim(),

    phone:
      customer.phone
        ? String(
            customer.phone
          ).trim()
        : undefined,

    whatsapp:
      customer.whatsapp
        ? String(
            customer.whatsapp
          ).trim()
        : undefined,

    email:
      customer.email
        ? String(
            customer.email
          ).trim()
        : "",

    address:
      customer.address
        ? String(
            customer.address
          ).trim()
        : undefined,

    notes:
      customer.notes
        ? String(
            customer.notes
          ).trim()
        : undefined,

    isActive:
      customer.isActive !==
      undefined
        ? customer.isActive
        : customer.active !==
            undefined
          ? customer.active
          : true,
  };
}


function sortCustomers(
  customers
) {
  return [
    ...customers,
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

const useCustomerStore =
  create(
    (set, get) => ({

      customers: [],

      isLoading:
        false,

      error:
        null,


      /* =================================
         FETCH ALL
      ================================= */

      fetchCustomers:
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
                "/admin/customers"
              );

            const customers =
              Array.isArray(
                data
              )
                ? data
                    .map(
                      normalizeCustomer
                    )
                    .filter(
                      Boolean
                    )
                : [];

            set({
              customers:
                sortCustomers(
                  customers
                ),

              isLoading:
                false,

              error:
                null,
            });

            return customers;
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
         Backend source of truth
      ================================= */

      fetchCustomerById:
        async (
          customerId
        ) => {
          if (
            !customerId
          ) {
            throw new Error(
              "Customer id is required"
            );
          }

          try {
            const data =
              await apiClient.get(
                `/admin/customers/${encodeURIComponent(
                  customerId
                )}`
              );

            const customer =
              normalizeCustomer(
                data
              );

            if (
              customer
            ) {
              set(
                (state) => {
                  const exists =
                    state.customers.some(
                      (
                        current
                      ) =>
                        String(
                          current.id
                        ) ===
                        String(
                          customer.id
                        )
                    );

                  return {
                    customers:
                      exists
                        ? state.customers.map(
                            (
                              current
                            ) =>
                              String(
                                current.id
                              ) ===
                              String(
                                customer.id
                              )
                                ? customer
                                : current
                          )
                        : sortCustomers(
                            [
                              customer,
                              ...state.customers,
                            ]
                          ),
                  };
                }
              );
            }

            return customer;
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

      addCustomer:
        async (
          customer
        ) => {
          const payload =
            toBackend(
              customer
            );

          const created =
            await apiClient.post(
              "/admin/customers",
              payload
            );

          const normalized =
            normalizeCustomer(
              created
            );

          if (
            normalized
          ) {
            set(
              (state) => ({
                customers:
                  sortCustomers([
                    normalized,
                    ...state.customers,
                  ]),
              })
            );
          }

          return normalized;
        },


      /* =================================
         UPDATE
      ================================= */

      updateCustomer:
        async (
          customerId,
          updates
        ) => {
          if (
            !customerId
          ) {
            throw new Error(
              "Customer id is required"
            );
          }

          const payload =
            toBackend(
              updates
            );

          const updated =
            await apiClient.patch(
              `/admin/customers/${encodeURIComponent(
                customerId
              )}`,
              payload
            );

          const normalized =
            normalizeCustomer(
              updated
            );

          if (
            normalized
          ) {
            set(
              (state) => ({
                customers:
                  sortCustomers(
                    state.customers.map(
                      (
                        customer
                      ) =>
                        String(
                          customer.id
                        ) ===
                        String(
                          customerId
                        )
                          ? normalized
                          : customer
                    )
                  ),
              })
            );
          }

          return normalized;
        },


      /* =================================
         DELETE
      ================================= */

      deleteCustomer:
        async (
          customerId
        ) => {
          if (
            !customerId
          ) {
            throw new Error(
              "Customer id is required"
            );
          }

          const result =
            await apiClient.delete(
              `/admin/customers/${encodeURIComponent(
                customerId
              )}`
            );

          set(
            (state) => ({
              customers:
                state.customers.filter(
                  (
                    customer
                  ) =>
                    String(
                      customer.id
                    ) !==
                    String(
                      customerId
                    )
                ),
            })
          );

          return result;
        },


      /* =================================
         GET LOCAL
         Compatibility helper
         
         Reads already-loaded Backend
         state only.
      ================================= */

      getCustomerById:
        (
          customerId
        ) => {
          return get()
            .customers.find(
              (
                customer
              ) =>
                String(
                  customer.id
                ) ===
                String(
                  customerId
                )
            );
        },


      /* =================================
         ACTIVE CUSTOMERS
      ================================= */

      getActiveCustomers:
        () => {
          return get()
            .customers
            .filter(
              (
                customer
              ) =>
                customer.isActive ===
                true
            );
        },


      /* =================================
         SEARCH
      ================================= */

      searchCustomers:
        (
          query
        ) => {
          const value =
            String(
              query ||
                ""
            )
              .trim()
              .toLowerCase();

          if (
            !value
          ) {
            return sortCustomers(
              get()
                .customers
            );
          }

          return sortCustomers(
            get()
              .customers
              .filter(
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
                    )
              )
          );
        },


      /* =================================
         CLEAR UI CACHE
         Does NOT affect database
      ================================= */

      clearCustomers:
        () =>
          set({
            customers:
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


export default useCustomerStore;