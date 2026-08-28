import { create } from "zustand";

import apiClient from "../lib/apiClient";


/* =====================================
   BACKEND -> ADMIN ADAPTER
===================================== */

function fromBackend(
  category
) {
  if (!category) {
    return null;
  }


  return {
    id:
      category.id,

    name:
      category.name || "",

    slug:
      category.slug || "",

    description:
      category.description || "",

    image:
      category.imageUrl || "",

    order:
      Number(
        category.sortOrder || 0
      ),

    active:
      category.isActive === true,

    showOnStore:
      category.showOnStore ===
      true,

    productCount:
      category.productCount ??
      0,

    createdAt:
      category.createdAt ||
      null,

    updatedAt:
      category.updatedAt ||
      null,
  };
}


/* =====================================
   ADMIN -> BACKEND ADAPTER
===================================== */

function toBackend(
  category = {}
) {
  const payload = {};


  if (
    category.name !==
    undefined
  ) {
    payload.name =
      String(
        category.name
      ).trim();
  }


  if (
    category.slug !==
    undefined
  ) {
    payload.slug =
      String(
        category.slug
      ).trim();
  }


  if (
    category.description !==
    undefined
  ) {
    payload.description =
      category.description;
  }


  if (
    category.image !==
    undefined
  ) {
    payload.imageUrl =
      category.image ||
      null;
  }


  if (
    category.order !==
    undefined
  ) {
    payload.sortOrder =
      Number(
        category.order
      ) || 0;
  }


  if (
    category.active !==
    undefined
  ) {
    payload.isActive =
      category.active ===
      true;
  }


  if (
    category.showOnStore !==
    undefined
  ) {
    payload.showOnStore =
      category.showOnStore ===
      true;
  }


  return payload;
}


/* =====================================
   STORE
===================================== */

const useCategoryStore =
  create(
    (set, get) => ({
      categories: [],

      isLoading: false,

      error: null,


      /* =========================
         FETCH
      ========================= */

      fetchCategories:
        async () => {
          set({
            isLoading: true,
            error: null,
          });


          try {
            const data =
              await apiClient.get(
                "/categories/admin"
              );


            const categories =
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
              categories,
              isLoading: false,
              error: null,
            });


            return categories;

          } catch (error) {
            set({
              isLoading: false,
              error,
            });


            throw error;
          }
        },


      /* =========================
         ADD
      ========================= */

      addCategory:
        async (
          category
        ) => {
          const payload =
            toBackend(
              category
            );


          const created =
            await apiClient.post(
              "/categories/admin",
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
                categories: [
                  ...state.categories,
                  normalized,
                ],
              })
            );
          }


          return normalized;
        },


      /* =========================
         UPDATE
      ========================= */

      updateCategory:
        async (
          id,
          updates
        ) => {
          if (!id) {
            throw new Error(
              "Category id is required"
            );
          }


          const payload =
            toBackend(
              updates
            );


          const updated =
            await apiClient.patch(
              `/categories/admin/${encodeURIComponent(
                id
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
                categories:
                  state.categories.map(
                    (category) =>
                      String(
                        category.id
                      ) ===
                      String(
                        id
                      )
                        ? normalized
                        : category
                  ),
              })
            );
          }


          return normalized;
        },


      /* =========================
         DELETE
      ========================= */

      deleteCategory:
        async (
          id
        ) => {
          if (!id) {
            throw new Error(
              "Category id is required"
            );
          }


          const result =
            await apiClient.delete(
              `/categories/admin/${encodeURIComponent(
                id
              )}`
            );


          set(
            (state) => ({
              categories:
                state.categories.filter(
                  (category) =>
                    String(
                      category.id
                    ) !==
                    String(
                      id
                    )
                ),
            })
          );


          return result;
        },


      /* =========================
         TOGGLE ACTIVE
      ========================= */

      toggleActive:
        async (
          id
        ) => {
          const category =
            get()
              .categories
              .find(
                (item) =>
                  String(
                    item.id
                  ) ===
                  String(
                    id
                  )
              );


          if (!category) {
            throw new Error(
              "Category not found"
            );
          }


          return get()
            .updateCategory(
              id,
              {
                active:
                  !category.active,
              }
            );
        },


      /* =========================
         TOGGLE STORE VISIBILITY
      ========================= */

      toggleStoreVisibility:
        async (
          id
        ) => {
          const category =
            get()
              .categories
              .find(
                (item) =>
                  String(
                    item.id
                  ) ===
                  String(
                    id
                  )
              );


          if (!category) {
            throw new Error(
              "Category not found"
            );
          }


          return get()
            .updateCategory(
              id,
              {
                showOnStore:
                  !category.showOnStore,
              }
            );
        },


      /* =========================
         SET ORDER
      ========================= */

      setOrder:
        async (
          id,
          order
        ) => {
          return get()
            .updateCategory(
              id,
              {
                order:
                  Number(
                    order
                  ) || 0,
              }
            );
        },


      /* =========================
         SET IMAGE
      ========================= */

      setImage:
        async (
          id,
          image
        ) => {
          return get()
            .updateCategory(
              id,
              {
                image:
                  image ||
                  "",
              }
            );
        },


      /* =========================
         REMOVE IMAGE
      ========================= */

      removeImage:
        async (
          id
        ) => {
          return get()
            .updateCategory(
              id,
              {
                image:
                  "",
              }
            );
        },


      /* =========================
         NAME EXISTS
      ========================= */

      categoryNameExists:
        (
          name,
          excludeId
        ) => {
          const value =
            String(
              name || ""
            )
              .trim()
              .toLowerCase();


          return get()
            .categories
            .some(
              (category) =>
                String(
                  category.id
                ) !==
                  String(
                    excludeId
                  ) &&
                category.name
                  .trim()
                  .toLowerCase() ===
                  value
            );
        },


      /* =========================
         SLUG EXISTS
      ========================= */

      categorySlugExists:
        (
          slug,
          excludeId
        ) => {
          const value =
            String(
              slug || ""
            )
              .trim()
              .toLowerCase();


          return get()
            .categories
            .some(
              (category) =>
                String(
                  category.id
                ) !==
                  String(
                    excludeId
                  ) &&
                category.slug
                  .trim()
                  .toLowerCase() ===
                  value
            );
        },


      /* =========================
         CLEAR ERROR
      ========================= */

      clearError:
        () =>
          set({
            error: null,
          }),
    })
  );


export default useCategoryStore;