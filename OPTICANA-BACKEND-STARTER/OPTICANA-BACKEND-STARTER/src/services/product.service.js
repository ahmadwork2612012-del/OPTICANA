import prisma from "../lib/prisma.js";
import { changeStock } from "./inventory.service.js";
import { persistDataUrl } from "./media.service.js";


/* =====================================
   PUBLIC PRODUCT SERIALIZER
===================================== */

function serializeStoreProduct(product) {
  if (!product) {
    return null;
  }


  const images = Array.isArray(
    product.images
  )
    ? product.images
        .map(
          (image) =>
            image?.url || null
        )
        .filter(Boolean)
    : [];


  const primaryImage =
    product.images?.find(
      (image) =>
        image?.isPrimary === true
    )?.url ||
    images[0] ||
    null;


  return {
    id:
      product.id,

    sku:
      product.sku,

    name:
      product.name,

    slug:
      product.slug,

    description:
      product.description || "",

    price:
      product.price == null
        ? 0
        : Number(
            product.price
          ),

    oldPrice:
      product.oldPrice == null
        ? null
        : Number(
            product.oldPrice
          ),

    stock:
      Math.max(
        0,
        Number(
          product.stock || 0
        )
      ),

    reorderLevel:
      Math.max(
        0,
        Number(
          product.reorderLevel || 0
        )
      ),

    color:
      product.color || null,

    material:
      product.material || null,

    size:
      product.size || null,

    image:
      primaryImage,

    images,

    category:
      product.category?.name ||
      "",

    featured:
      product.featured === true,

    isNew:
      product.isNew === true,

    isSale:
      product.isSale === true,

    rating:
      Math.min(
        5,
        Math.max(
          0,
          Number(
            product.rating || 0
          )
        )
      ),

    ratingCount:
      Math.max(
        0,
        Number(
          product.ratingCount || 0
        )
      ),

    status:
      product.status,

    createdAt:
      product.createdAt,

    updatedAt:
      product.updatedAt,
  };
}


/* =====================================
   STORE PRODUCT SELECT
===================================== */

const storeProductSelect = {
  id: true,
  sku: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  oldPrice: true,
  stock: true,
  reorderLevel: true,
  color: true,
  material: true,
  size: true,
  rating: true,
  ratingCount: true,
  status: true,
  featured: true,
  isNew: true,
  isSale: true,
  createdAt: true,
  updatedAt: true,


  category: {
    select: {
      name: true,
    },
  },


  images: {
    select: {
      url: true,
      altText: true,
      sortOrder: true,
      isPrimary: true,
    },


    orderBy: [
      {
        isPrimary: "desc",
      },

      {
        sortOrder: "asc",
      },
    ],
  },
};


/* =====================================
   GET ALL STORE PRODUCTS
===================================== */

export async function getStoreProducts() {
  const products =
    await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        showOnStore: true,
      },

      select:
        storeProductSelect,

      orderBy: {
        createdAt: "desc",
      },
    });


  return products
    .map(
      serializeStoreProduct
    )
    .filter(Boolean);
}


/* =====================================
   GET STORE PRODUCT BY ID
===================================== */

export async function getStoreProductById(
  id
) {
  const product =
    await prisma.product.findFirst({
      where: {
        id,

        status:
          "PUBLISHED",

        showOnStore:
          true,
      },

      select:
        storeProductSelect,
    });


  return serializeStoreProduct(
    product
  );
}


/* =====================================
   ADMIN PRODUCT SELECT
===================================== */

const adminProductSelect = {
  id: true,
  sku: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  oldPrice: true,
  purchasePrice: true,
  stock: true,
  reorderLevel: true,
  color: true,
  material: true,
  size: true,
  rating: true,
  ratingCount: true,
  status: true,
  showOnStore: true,
  featured: true,
  isNew: true,
  isSale: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,


  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },


  images: {
    select: {
      id: true,
      url: true,
      altText: true,
      sortOrder: true,
      isPrimary: true,
    },


    orderBy: [
      {
        isPrimary: "desc",
      },

      {
        sortOrder: "asc",
      },
    ],
  },
};


/* =====================================
   ADMIN PRODUCT SERIALIZER
===================================== */

function serializeAdminProduct(
  product
) {
  if (!product) {
    return null;
  }


  return {
    id:
      product.id,

    sku:
      product.sku,

    name:
      product.name,

    slug:
      product.slug,

    description:
      product.description || "",

    price:
      Number(
        product.price
      ),

    oldPrice:
      product.oldPrice == null
        ? null
        : Number(
            product.oldPrice
          ),

    purchasePrice:
      product.purchasePrice == null
        ? null
        : Number(
            product.purchasePrice
          ),

    stock:
      Number(
        product.stock
      ),

    reorderLevel:
      Number(
        product.reorderLevel
      ),

    color:
      product.color || null,

    material:
      product.material || null,

    size:
      product.size || null,

    status:
      product.status,

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
      product.categoryId ||
      null,

    category:
      product.category
        ? {
            id:
              product.category.id,

            name:
              product.category.name,

            slug:
              product.category.slug,
          }
        : null,

    images:
      Array.isArray(
        product.images
      )
        ? product.images.map(
            (image) => ({
              id:
                image.id,

              url:
                image.url,

              altText:
                image.altText ||
                "",

              sortOrder:
                image.sortOrder,

              isPrimary:
                image.isPrimary ===
                true,
            })
          )
        : [],

    rating:
      Number(
        product.rating || 0
      ),

    ratingCount:
      Number(
        product.ratingCount || 0
      ),

    createdAt:
      product.createdAt,

    updatedAt:
      product.updatedAt,
  };
}


/* =====================================
   ADMIN: LIST PRODUCTS
===================================== */

export async function listAdminProducts() {
  const products =
    await prisma.product.findMany({
      select:
        adminProductSelect,

      orderBy: {
        createdAt: "desc",
      },
    });


  return products.map(
    serializeAdminProduct
  );
}


/* =====================================
   ADMIN: GET PRODUCT BY ID
===================================== */

export async function getAdminProductById(
  id
) {
  const product =
    await prisma.product.findUnique({
      where: {
        id,
      },

      select:
        adminProductSelect,
    });


  return serializeAdminProduct(
    product
  );
}


/* =====================================
   ADMIN: CREATE PRODUCT
===================================== */

export async function createProduct(
  data,
  userId
) {
  const {
    images,
    initialStock = 0,
    ...rest
  } = data;

  const storedImages = images?.length
    ? await Promise.all(images.map(async (image) => ({ ...image, url: await persistDataUrl(image?.url) })))
    : images;


  const product =
    await prisma.$transaction(
      async (tx) => {
        const createdProduct =
          await tx.product.create({
            data: {
              ...rest,

              /*
                Stock always starts at zero.

                Initial stock is applied through
                Inventory Core so it gets an
                INITIAL movement.
              */

              stock: 0,

              images:
                storedImages &&
                storedImages.length
                  ? {
                      create:
                        storedImages.map(
                          (
                            image,
                            index
                          ) => ({
                            url:
                              image.url,

                            altText:
                              image.altText ||
                              null,

                            isPrimary:
                              image.isPrimary ===
                                true ||
                              index === 0,

                            sortOrder:
                              image.sortOrder ??
                              index,
                          })
                        ),
                    }
                  : undefined,
            },

            select:
              adminProductSelect,
          });


        if (
          initialStock >
          0
        ) {
          await changeStock({
            tx,

            productId:
              createdProduct.id,

            quantity:
              initialStock,

            type:
              "INITIAL",

            userId:
              userId || null,

            note:
              "Initial product stock",
          });
        }


        return tx.product.findUnique({
          where: {
            id:
              createdProduct.id,
          },

          select:
            adminProductSelect,
        });
      }
    );


  return serializeAdminProduct(
    product
  );
}


/* =====================================
   ADMIN: UPDATE PRODUCT
===================================== */

export async function updateProduct(
  id,
  data
) {
  const {
    images,
    ...rest
  } = data;

  const storedImages = images === undefined
    ? undefined
    : images?.length
      ? await Promise.all(images.map(async (image) => ({ ...image, url: await persistDataUrl(image?.url) })))
      : images;


  /*
    Stock is intentionally NOT accepted here.

    Any stock change must go through
    Inventory Core.
  */


  if (
    images !== undefined
  ) {
    await prisma.productImage.deleteMany({
      where: {
        productId:
          id,
      },
    });
  }


  const product =
    await prisma.product.update({
      where: {
        id,
      },

      data: {
        ...rest,

        images:
          storedImages &&
          storedImages.length
            ? {
                create:
                  storedImages.map(
                    (
                      image,
                      index
                    ) => ({
                      url:
                        image.url,

                      altText:
                        image.altText ||
                        null,

                      isPrimary:
                        image.isPrimary ===
                          true ||
                        index ===
                          0,

                      sortOrder:
                        image.sortOrder ??
                        index,
                    })
                  ),
              }
            : undefined,
      },

      select:
        adminProductSelect,
    });


  return serializeAdminProduct(
    product
  );
}


/* =====================================
   ADMIN: DELETE PRODUCT
===================================== */

export async function deleteProduct(
  id
) {
  /*
    Products with historical orders,
    purchases or inventory movements should
    not be hard-deleted.

    Archive instead.
  */


  const product =
    await prisma.product.update({
      where: {
        id,
      },

      data: {
        status:
          "ARCHIVED",

        showOnStore:
          false,

        featured:
          false,

        isNew:
          false,

        isSale:
          false,
      },

      select: {
        id: true,
        status: true,
        showOnStore: true,
      },
    });


  return {
    id:
      product.id,

    status:
      product.status,

    showOnStore:
      product.showOnStore,

    archived:
      true,
  };
}