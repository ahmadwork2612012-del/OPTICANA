import { create } from "zustand";

import apiClient from "../lib/apiClient";


/* =====================================
   HELPERS
===================================== */

const createSlug = (
  value = ""
) => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(
      /[^\u0600-\u06FF\w\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    );
};


/* =====================================
   PRODUCT NORMALIZER
===================================== */

function normalizeProduct(
  product
) {
  if (!product) {
    return null;
  }


  const category =
    typeof product.category ===
    "string"
      ? product.category
      : product.category?.name ||
        "";


  const sellingPrice =
    Number(
      product.price ??
        product.sellingPrice ??
        0
    );


  const purchasePrice =
    Number(
      product.purchasePrice ??
        0
    );


  const oldPrice =
    product.oldPrice ===
        "" ||
    product.oldPrice ==
      null
      ? null
      : Number(
          product.oldPrice
        );


  const stock =
    Number(
      product.stock ??
        0
    );


  const reorderLevel =
    Number(
      product.reorderLevel ??
        0
    );


  const images =
    Array.isArray(
      product.images
    )
      ? product.images
      : [];


  const image =
    product.image ||
    images.find(
      (item) =>
        item?.isPrimary === true
    )?.url ||
    images[0]?.url ||
    null;


  return {
    ...product,

    id:
      product.id ||
      null,

    sku:
      product.sku ||
      "",

    name:
      product.name ||
      "",

    slug:
      product.slug ||
      createSlug(
        product.name || ""
      ),

    category,

    description:
      product.description ||
      "",

    purchasePrice:
      Number.isFinite(
        purchasePrice
      )
        ? purchasePrice
        : 0,

    sellingPrice:
      Number.isFinite(
        sellingPrice
      )
        ? sellingPrice
        : 0,

    price:
      Number.isFinite(
        sellingPrice
      )
        ? sellingPrice
        : 0,

    oldPrice:
      Number.isFinite(
        oldPrice
      )
        ? oldPrice
        : null,

    stock:
      Number.isFinite(
        stock
      )
        ? Math.max(
            0,
            stock
          )
        : 0,

    reorderLevel:
      Number.isFinite(
        reorderLevel
      )
        ? Math.max(
            0,
            reorderLevel
          )
        : 0,

    supplierId:
      product.supplierId ??
      null,

    supplier:
      product.supplier ||
      "",

    color:
      product.color ||
      null,

    material:
      product.material ||
      null,

    size:
      product.size ||
      null,

    image,

    images,

    showOnStore:
      product.showOnStore ===
      true,

    isPublished:
      product.status ===
      "PUBLISHED",

    featured:
      product.featured ===
      true,

    isNew:
      product.isNew ===
      true,

    isSale:
      product.isSale ===
      true,

    status:
      product.status ||
      "DRAFT",

    rating:
      Number(
        product.rating ||
          0
      ),

    ratingCount:
      Number(
        product.ratingCount ||
          0
      ),

    createdAt:
      product.createdAt ||
      null,

    updatedAt:
      product.updatedAt ||
      null,
  };
}


/* =====================================
   ADMIN PRODUCT PAYLOAD
===================================== */

function buildProductPayload(
  product = {},
  {
    includeInitialStock = false,
  } = {}
) {
  const name =
    product.name?.trim() ||
    "";


  const slug =
    product.slug?.trim() ||
    createSlug(
      name
    );


  const status =
    product.status ===
      "PUBLISHED" ||
    product.isPublished ===
      true ||
    product.status ===
      "active"
      ? "PUBLISHED"
      : product.status ===
          "ARCHIVED"
        ? "ARCHIVED"
        : "DRAFT";


  const payload = {
    sku:
      product.sku?.trim() ||
      "",

    name,

    slug,

    description:
      product.description ||
      "",

    price:
      Number(
        product.price ??
          product.sellingPrice ??
          0
      ),

    oldPrice:
      product.oldPrice ===
          "" ||
      product.oldPrice ==
        null
        ? null
        : Number(
            product.oldPrice
          ),

    purchasePrice:
      product.purchasePrice ===
          "" ||
      product.purchasePrice ==
        null
        ? null
        : Number(
            product.purchasePrice
          ),

    reorderLevel:
      Math.max(
        0,
        Number(
          product.reorderLevel ||
            0
        )
      ),

    color:
      product.color ||
      undefined,

    material:
      product.material ||
      undefined,

    size:
      product.size ||
      undefined,

    status,

    showOnStore:
      product.showOnStore ===
      true,

    featured:
      product.featured ===
      true,

    isNew:
      product.isNew ===
      true,

    isSale:
      product.isSale ===
      true,

    categoryId:
      product.categoryId ??
      null,

    images:
      Array.isArray(
        product.images
      )
        ? product.images
        : undefined,
  };


  if (
    includeInitialStock
  ) {
    payload.initialStock =
      Math.max(
        0,
        Number(
          product.initialStock ??
            product.stock ??
            0
        )
      );
  }


  return payload;
}


/* =====================================
   STORE
===================================== */

const useProductStore =
  create(
    (set, get) => ({
      products: [],

      loading: false,

      error: null,


      /* =========================
         LOAD
      ========================= */

      fetchProducts:
        async () => {
          set({
            loading: true,
            error: null,
          });


          try {
            const data =
              await apiClient.get(
                "/admin/products"
              );


            const products =
              Array.isArray(
                data
              )
                ? data
                    .map(
                      normalizeProduct
                    )
                    .filter(
                      Boolean
                    )
                : [];


            set({
              products,
              loading: false,
              error: null,
            });


            return products;

          } catch (error) {
            set({
              loading: false,
              error,
            });


            throw error;
          }
        },


      /* =========================
         GET ONE
      ========================= */

      getProductById:
        async (id) => {
          if (!id) {
            return null;
          }


          try {
            const data =
              await apiClient.get(
                `/admin/products/${encodeURIComponent(
                  id
                )}`
              );


            const product =
              normalizeProduct(
                data
              );


            if (
              product
            ) {
              set(
                (state) => ({
                  products:
                    state.products.some(
                      (item) =>
                        String(
                          item.id
                        ) ===
                        String(
                          product.id
                        )
                    )
                      ? state.products.map(
                          (item) =>
                            String(
                              item.id
                            ) ===
                            String(
                              product.id
                            )
                              ? product
                              : item
                        )
                      : [
                          ...state.products,
                          product,
                        ],
                })
              );
            }


            return product;

          } catch (error) {
            throw error;
          }
        },


      /* =========================
         ADD
      ========================= */

      addProduct:
        async (
          product
        ) => {
          const payload =
            buildProductPayload(
              product,
              {
                includeInitialStock:
                  true,
              }
            );


          const data =
            await apiClient.post(
              "/admin/products",
              payload
            );


          const createdProduct =
            normalizeProduct(
              data
            );


          if (
            createdProduct
          ) {
            set(
              (state) => ({
                products: [
                  createdProduct,
                  ...state.products,
                ],
              })
            );
          }


          return createdProduct;
        },


      /* =========================
         UPDATE
      ========================= */

      updateProduct:
        async (
          id,
          updates
        ) => {
          if (!id) {
            throw new Error(
              "Product id is required"
            );
          }


          const payload =
            buildProductPayload(
              updates
            );


          delete payload.sku;
          delete payload.name;
          delete payload.slug;


          /*
            Only send fields that are
            actually meant to be updated.

            Stock is intentionally excluded.
            Stock changes belong to Inventory Core.
          */

          if (
            updates.sku !==
            undefined
          ) {
            payload.sku =
              updates.sku
                ?.trim() ||
              "";
          }


          if (
            updates.name !==
            undefined
          ) {
            payload.name =
              updates.name
                ?.trim() ||
              "";
          }


          if (
            updates.slug !==
            undefined
          ) {
            payload.slug =
              updates.slug
                ?.trim() ||
              createSlug(
                updates.name ||
                  get()
                    .products
                    .find(
                      (item) =>
                        String(
                          item.id
                        ) ===
                        String(
                          id
                        )
                    )?.name ||
                  ""
              );
          }


          const data =
            await apiClient.patch(
              `/admin/products/${encodeURIComponent(
                id
              )}`,
              payload
            );


          const updatedProduct =
            normalizeProduct(
              data
            );


          if (
            updatedProduct
          ) {
            set(
              (state) => ({
                products:
                  state.products.map(
                    (product) =>
                      String(
                        product.id
                      ) ===
                      String(
                        id
                      )
                        ? updatedProduct
                        : product
                  ),
              })
            );
          }


          return updatedProduct;
        },


      /* =========================
         DELETE / ARCHIVE
      ========================= */

      deleteProduct:
        async (
          id
        ) => {
          if (!id) {
            throw new Error(
              "Product id is required"
            );
          }


          const result =
            await apiClient.delete(
              `/admin/products/${encodeURIComponent(
                id
              )}`
            );


          set(
            (state) => ({
              products:
                state.products.map(
                  (product) =>
                    String(
                      product.id
                    ) ===
                    String(
                      id
                    )
                      ? {
                          ...product,

                          status:
                            "ARCHIVED",

                          isPublished:
                            false,

                          showOnStore:
                            false,

                          featured:
                            false,

                          isNew:
                            false,

                          isSale:
                            false,

                          updatedAt:
                            new Date().toISOString(),
                        }
                      : product
                ),
            })
          );


          return result;
        },


      /* =========================
         STORE VISIBILITY
      ========================= */

      setStoreVisibility:
        async (
          id,
          visible
        ) => {
          if (!id) {
            throw new Error(
              "Product id is required"
            );
          }


          const currentProduct =
            get()
              .products
              .find(
                (product) =>
                  String(
                    product.id
                  ) ===
                  String(
                    id
                  )
              );


          if (
            !currentProduct
          ) {
            throw new Error(
              "Product not found"
            );
          }


          const data =
            await apiClient.patch(
              `/admin/products/${encodeURIComponent(
                id
              )}`,
              {
                showOnStore:
                  visible ===
                  true,

                ...(visible
                  ? {}
                  : {
                      status:
                        currentProduct.status ===
                        "ARCHIVED"
                          ? "ARCHIVED"
                          : "DRAFT",
                    }),
              }
            );


          const updatedProduct =
            normalizeProduct(
              data
            );


          set(
            (state) => ({
              products:
                state.products.map(
                  (product) =>
                    String(
                      product.id
                    ) ===
                    String(
                      id
                    )
                      ? updatedProduct
                      : product
                ),
            })
          );


          return updatedProduct;
        },


      /* =========================
         PUBLISH
      ========================= */

      publishProduct:
        async (
          id
        ) => {
          if (!id) {
            throw new Error(
              "Product id is required"
            );
          }


          const data =
            await apiClient.patch(
              `/admin/products/${encodeURIComponent(
                id
              )}`,
              {
                status:
                  "PUBLISHED",

                showOnStore:
                  true,
              }
            );


          const updatedProduct =
            normalizeProduct(
              data
            );


          set(
            (state) => ({
              products:
                state.products.map(
                  (product) =>
                    String(
                      product.id
                    ) ===
                    String(
                      id
                    )
                      ? updatedProduct
                      : product
                ),
            })
          );


          return updatedProduct;
        },


      /* =========================
         UNPUBLISH
      ========================= */

      unpublishProduct:
        async (
          id
        ) => {
          if (!id) {
            throw new Error(
              "Product id is required"
            );
          }


          const currentProduct =
            get()
              .products
              .find(
                (product) =>
                  String(
                    product.id
                  ) ===
                  String(
                    id
                  )
              );


          if (
            !currentProduct
          ) {
            throw new Error(
              "Product not found"
            );
          }


          const data =
            await apiClient.patch(
              `/admin/products/${encodeURIComponent(
                id
              )}`,
              {
                status:
                  "DRAFT",
              }
            );


          const updatedProduct =
            normalizeProduct(
              data
            );


          set(
            (state) => ({
              products:
                state.products.map(
                  (product) =>
                    String(
                      product.id
                    ) ===
                    String(
                      id
                    )
                      ? updatedProduct
                      : product
                ),
            })
          );


          return updatedProduct;
        },


      /* =========================
         STOCK
      ========================= */

      adjustStock:
        async (
          id,
          amount
        ) => {
          const error =
            new Error(
              "Stock changes must go through Inventory Core. Product update does not accept stock."
            );


          error.code =
            "INVENTORY_CORE_REQUIRED";


          error.productId =
            id;

          error.amount =
            amount;


          throw error;
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


export default useProductStore;