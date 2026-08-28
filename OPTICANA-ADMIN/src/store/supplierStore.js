import { create } from "zustand";

import apiClient from "../lib/apiClient";


/* =====================================
   BACKEND -> ADMIN
===================================== */

function fromBackend(
  supplier
) {
  if (!supplier) {
    return null;
  }

  return {
    id:
      supplier.id,

    name:
      supplier.name,

    phone:
      supplier.phone ||
      "",

    whatsapp:
      supplier.whatsapp ||
      "",

    email:
      supplier.email ||
      "",

    address:
      supplier.address ||
      "",

    notes:
      supplier.notes ||
      "",

    company:
      supplier.company ||
      "",

    active:
      supplier.isActive ===
      true,

    isActive:
      supplier.isActive ===
      true,

    purchaseCount:
      Number(
        supplier.purchaseCount ||
          0
      ),

    createdAt:
      supplier.createdAt ||
      null,

    updatedAt:
      supplier.updatedAt ||
      null,
  };
}


/* =====================================
   ADMIN -> BACKEND
===================================== */

function toBackend(
  supplier
) {
  return {
    name:
      String(
        supplier.name ||
          ""
      ).trim(),

    phone:
      supplier.phone
        ? String(
            supplier.phone
          ).trim()
        : null,

    whatsapp:
      supplier.whatsapp
        ? String(
            supplier.whatsapp
          ).trim()
        : null,

    email:
      supplier.email
        ? String(
            supplier.email
          ).trim()
        : null,

    address:
      supplier.address
        ? String(
            supplier.address
          ).trim()
        : null,

    notes:
      supplier.notes
        ? String(
            supplier.notes
          ).trim()
        : null,

    isActive:
      supplier.isActive !==
      undefined
        ? supplier.isActive
        : supplier.active !==
            undefined
          ? supplier.active
          : true,
  };
}


/* =====================================
   STORE
===================================== */

const useSupplierStore =
  create(
    (set, get) => ({

      suppliers: [],

      isLoading:
        false,

      error:
        null,


      /* =================================
         FETCH
      ================================= */

      fetchSuppliers:
        async () => {
          set({
            isLoading:
              true,

            error:
              null,
          });

          try {
            const response =
              await apiClient.get(
                "/admin/suppliers"
              );

            const data =
              response?.data ??
              response;

            const suppliers =
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
              suppliers,

              isLoading:
                false,

              error:
                null,
            });

            return suppliers;
          } catch (error) {
            set({
              isLoading:
                false,

              error,
            });

            throw error;
          }
        },


      /* =================================
         CREATE
      ================================= */

      createSupplier:
        async (
          supplier
        ) => {
          const response =
            await apiClient.post(
              "/admin/suppliers",
              toBackend(
                supplier
              )
            );

          const created =
            response?.data ??
            response;

          const normalized =
            fromBackend(
              created
            );

          if (
            normalized
          ) {
            set(
              (state) => ({
                suppliers: [
                  normalized,
                  ...state.suppliers,
                ],
              })
            );
          }

          return normalized;
        },


      /* =================================
         UPDATE
      ================================= */

      updateSupplier:
        async (
          supplierId,
          updates
        ) => {
          const response =
            await apiClient.patch(
              `/admin/suppliers/${encodeURIComponent(
                supplierId
              )}`,
              toBackend(
                updates
              )
            );

          const updated =
            response?.data ??
            response;

          const normalized =
            fromBackend(
              updated
            );

          if (
            normalized
          ) {
            set(
              (state) => ({
                suppliers:
                  state.suppliers.map(
                    (
                      supplier
                    ) =>
                      String(
                        supplier.id
                      ) ===
                      String(
                        supplierId
                      )
                        ? normalized
                        : supplier
                  ),
              })
            );
          }

          return normalized;
        },


      /* =================================
         DELETE
      ================================= */

      deleteSupplier:
        async (
          supplierId
        ) => {
          const response =
            await apiClient.delete(
              `/admin/suppliers/${encodeURIComponent(
                supplierId
              )}`
            );

          const result =
            response?.data ??
            response;

          set(
            (state) => ({
              suppliers:
                state.suppliers.filter(
                  (
                    supplier
                  ) =>
                    String(
                      supplier.id
                    ) !==
                    String(
                      supplierId
                    )
                ),
            })
          );

          return result;
        },


      /* =================================
         GET LOCAL
         Compatibility helper
      ================================= */

      getSupplierById:
        (
          supplierId
        ) =>
          get()
            .suppliers.find(
              (
                supplier
              ) =>
                String(
                  supplier.id
                ) ===
                String(
                  supplierId
                )
            ),


      clearError:
        () =>
          set({
            error:
              null,
          }),
    })
  );


export default useSupplierStore;