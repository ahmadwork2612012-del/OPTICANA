import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  Boxes,
  Eye,
  EyeOff,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  ImagePlus,
  Store,
  Star,
  Sparkles,
  Tag,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  fileToDataUrl,
} from "../utils/imageUtils";

import useMediaStore from "../store/mediaStore";
import useProductStore from "../store/productStore";
import useCategoryStore from "../store/categoryStore";


function Products() {
  const products =
    useProductStore(
      (state) =>
        state.products
    );

  const loading =
    useProductStore(
      (state) =>
        state.loading
    );

  const error =
    useProductStore(
      (state) =>
        state.error
    );

  const fetchProducts =
    useProductStore(
      (state) =>
        state.fetchProducts
    );

  const categoryRecords =
    useCategoryStore(
      (state) => state.categories
    );

  const fetchCategories =
    useCategoryStore(
      (state) => state.fetchCategories
    );

  const addProduct =
    useProductStore(
      (state) =>
        state.addProduct
    );

  const updateProduct =
    useProductStore(
      (state) =>
        state.updateProduct
    );

  const deleteProduct =
    useProductStore(
      (state) =>
        state.deleteProduct
    );

  const publishProduct =
    useProductStore(
      (state) =>
        state.publishProduct
    );

  const unpublishProduct =
    useProductStore(
      (state) =>
        state.unpublishProduct
    );


  const media =
    useMediaStore(
      (state) =>
        state.media
    );

  const addMedia =
    useMediaStore(
      (state) =>
        state.addMedia
    );

  const updateMedia =
    useMediaStore(
      (state) =>
        state.updateMedia
    );

  const deleteMedia =
    useMediaStore(
      (state) =>
        state.deleteMedia
    );


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    category,
    setCategory,
  ] = useState("الكل");


  const [
    storeFilter,
    setStoreFilter,
  ] = useState("all");


  const [
    showForm,
    setShowForm,
  ] = useState(false);


  const [
    editingProduct,
    setEditingProduct,
  ] = useState(null);


  const [
    productMenu,
    setProductMenu,
  ] = useState(null);


  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);


  /* =====================================
     LOAD PRODUCTS FROM BACKEND
  ===================================== */

  useEffect(() => {
    let mounted = true;


    async function load() {
      try {
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch (loadError) {
        if (!mounted) {
          return;
        }


        toast.error(
          loadError?.message ||
            "تعذر تحميل المنتجات"
        );
      }
    }


    load();


    return () => {
      mounted = false;
    };
  }, [
    fetchProducts,
    fetchCategories,
  ]);


  /* =====================================
     CATEGORIES
  ===================================== */

  const categories =
    useMemo(() => {
      return [
        "الكل",

        ...new Set(
          products
            .map(
              (product) =>
                product.category
            )
            .filter(Boolean)
        ),
      ];
    }, [
      products,
    ]);


  /* =====================================
     FILTERED PRODUCTS
  ===================================== */

  const filteredProducts =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();


      return products.filter(
        (product) => {
          const matchesSearch =
            !value ||
            product.name
              ?.toLowerCase()
              .includes(
                value
              ) ||
            product.sku
              ?.toLowerCase()
              .includes(
                value
              );


          const matchesCategory =
            category ===
              "الكل" ||
            product.category ===
              category;


          const matchesStore =
            storeFilter ===
              "all"
              ? true
              : storeFilter ===
                  "published"
                ? product.isPublished &&
                  product.showOnStore
                : storeFilter ===
                    "hidden"
                  ? !product.showOnStore
                  : storeFilter ===
                      "featured"
                    ? product.featured
                    : true;


          return (
            matchesSearch &&
            matchesCategory &&
            matchesStore
          );
        }
      );
    }, [
      products,
      search,
      category,
      storeFilter,
    ]);


  /* =====================================
     SUMMARY
  ===================================== */

  const totalProducts =
    products.length;


  const lowStockProducts =
    products.filter(
      (product) =>
        Number(
          product.stock || 0
        ) > 0 &&
        Number(
          product.stock || 0
        ) <=
          Number(
            product.reorderLevel ||
              0
          )
    ).length;


  const outOfStockProducts =
    products.filter(
      (product) =>
        Number(
          product.stock || 0
        ) === 0
    ).length;


  const publishedProducts =
    products.filter(
      (product) =>
        product.isPublished &&
        product.showOnStore
    ).length;


  /* =====================================
     FORM
  ===================================== */

  const openAddForm =
    () => {
      setEditingProduct(
        null
      );

      setShowForm(
        true
      );
    };


  const openEditForm =
    (product) => {
      setEditingProduct(
        product
      );

      setShowForm(
        true
      );

      setProductMenu(
        null
      );
    };


  const closeForm =
    () => {
      setShowForm(
        false
      );

      setEditingProduct(
        null
      );
    };


  /* =====================================
     SAVE PRODUCT
  ===================================== */

  const handleSave =
    async (
      productData
    ) => {
      try {
        if (
          editingProduct
        ) {
          const updatedProduct =
            await updateProduct(
              editingProduct.id,
              productData
            );


          /*
            ربط الصور الموجودة بالمنتج
            داخل Media Store.
          */

          (
            productData.images ||
            []
          ).forEach(
            (image) => {
              if (
                !image?.id
              ) {
                return;
              }


              updateMedia(
                image.id,
                {
                  entityId:
                    updatedProduct?.id ||
                    editingProduct.id,

                  entityType:
                    "product",

                  folder:
                    "products",
                }
              );
            }
          );


          /*
            الصورة الرئيسية
            قد تكون نفس صورة
            الـGallery.
          */

          const mainMedia =
            media.find(
              (item) =>
                item.url ===
                productData.image
            );


          if (
            mainMedia
          ) {
            updateMedia(
              mainMedia.id,
              {
                entityId:
                  updatedProduct?.id ||
                  editingProduct.id,

                entityType:
                  "product",

                folder:
                  "products",

                isPrimary:
                  true,
              }
            );
          }


          toast.success(
            "تم تحديث المنتج بنجاح"
          );

        } else {
          const createdProduct =
            await addProduct(
              productData
            );


          /*
            ربط Gallery
          */

          (
            productData.images ||
            []
          ).forEach(
            (image) => {
              if (
                !image?.id
              ) {
                return;
              }


              updateMedia(
                image.id,
                {
                  entityId:
                    createdProduct?.id ||
                    null,

                  entityType:
                    "product",

                  folder:
                    "products",
                }
              );
            }
          );


          /*
            ربط الصورة الرئيسية.
          */

          const mainMedia =
            useMediaStore
              .getState()
              .media.find(
                (item) =>
                  item.url ===
                  productData.image
              );


          if (
            mainMedia &&
            createdProduct
          ) {
            updateMedia(
              mainMedia.id,
              {
                entityId:
                  createdProduct.id,

                entityType:
                  "product",

                folder:
                  "products",

                isPrimary:
                  true,
              }
            );
          }


          toast.success(
            "تمت إضافة المنتج بنجاح"
          );
        }


        closeForm();

      } catch (saveError) {
        console.error(
          "Products save:",
          saveError
        );


        toast.error(
          saveError?.message ||
            "تعذر حفظ المنتج"
        );
      }
    };


  /* =====================================
     PUBLISH / UNPUBLISH
  ===================================== */

  const togglePublish =
    async (
      product
    ) => {
      try {
        if (
          product.isPublished
        ) {
          await unpublishProduct(
            product.id
          );


          toast.success(
            "تم إخفاء المنتج من المتجر"
          );
        } else {
          await publishProduct(
            product.id
          );


          toast.success(
            "تم نشر المنتج في المتجر"
          );
        }

      } catch (publishError) {
        console.error(
          "Products publish:",
          publishError
        );


        toast.error(
          publishError?.message ||
            "تعذر تحديث حالة نشر المنتج"
        );
      } finally {
        setProductMenu(
          null
        );
      }
    };


  /* =====================================
     DELETE / ARCHIVE
  ===================================== */

  const confirmDelete =
    async () => {
      if (!deleteTarget) {
        return;
      }


      try {
        /*
          حذف الصور المرتبطة
          من Media Store.
        */

        media
          .filter(
            (item) =>
              item.entityType ===
                "product" &&
              String(
                item.entityId
              ) ===
                String(
                  deleteTarget.id
                )
          )
          .forEach(
            (item) => {
              deleteMedia(
                item.id
              );
            }
          );


        /*
          احتياطًا:
          البحث بروابط الصور.
        */

        media
          .filter(
            (item) =>
              item.entityType ===
                "product" &&
              (
                item.url ===
                  deleteTarget.image ||
                deleteTarget.images?.some(
                  (image) =>
                    image?.url ===
                    item.url
                )
              )
          )
          .forEach(
            (item) => {
              deleteMedia(
                item.id
              );
            }
          );


        await deleteProduct(
          deleteTarget.id
        );


        toast.success(
          "تمت أرشفة المنتج بنجاح"
        );


        setDeleteTarget(
          null
        );

        setProductMenu(
          null
        );

      } catch (deleteError) {
        console.error(
          "Products delete:",
          deleteError
        );


        toast.error(
          deleteError?.message ||
            "تعذر أرشفة المنتج"
        );
      }
    };


  /* =====================================
     LOADING
  ===================================== */

  if (
    loading &&
    products.length ===
      0
  ) {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
            <Package size={15} />
            إدارة الكتالوج
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            المنتجات
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            جاري تحميل المنتجات من قاعدة البيانات...
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from(
            {
              length: 6,
            }
          ).map(
            (
              _,
              index
            ) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="h-52 animate-pulse bg-slate-100" />

                <div className="space-y-4 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />

                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />

                  <div className="h-8 w-1/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }


  /* =====================================
     ERROR
  ===================================== */

  if (
    error &&
    products.length ===
      0
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-500">
          <AlertTriangle
            size={26}
          />
        </div>

        <h1 className="mt-4 text-xl font-black text-red-700">
          تعذر تحميل المنتجات
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-red-600">
          {error?.message ||
            "حدث خطأ أثناء الاتصال بالـBackend."}
        </p>

        <button
          type="button"
          onClick={async () => {
            try {
              await fetchProducts();

              toast.success(
                "تم تحميل المنتجات"
              );
            } catch (retryError) {
              toast.error(
                retryError?.message ||
                  "تعذر إعادة المحاولة"
              );
            }
          }}
          className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
            <Package size={15} />
            إدارة الكتالوج
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            المنتجات
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            أنشئ المنتجات وأدر الأسعار والمخزون
            وظهورها في متجر OPTICANA من مكان واحد.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openAddForm
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98]"
        >
          <Plus size={18} />
          إضافة منتج
        </button>
      </div>


      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Boxes}
          title="إجمالي المنتجات"
          value={
            totalProducts
          }
        />

        <SummaryCard
          icon={Store}
          title="منشور في المتجر"
          value={
            publishedProducts
          }
          accent="blue"
        />

        <SummaryCard
          icon={AlertTriangle}
          title="مخزون منخفض"
          value={
            lowStockProducts
          }
          accent="orange"
        />

        <SummaryCard
          icon={Package}
          title="نفد المخزون"
          value={
            outOfStockProducts
          }
          accent="red"
        />
      </div>


      {/* Filters */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search
              size={18}
              className="text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="ابحث باسم المنتج أو SKU..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch(
                    ""
                  )
                }
                className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-500 xl:w-52"
          >
            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>

          <select
            value={
              storeFilter
            }
            onChange={(event) =>
              setStoreFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-500 xl:w-52"
          >
            <option value="all">
              كل حالات المتجر
            </option>

            <option value="published">
              ظاهر في المتجر
            </option>

            <option value="hidden">
              مخفي عن المتجر
            </option>

            <option value="featured">
              منتجات مميزة
            </option>
          </select>
        </div>
      </div>


      {/* Product Grid */}

      {filteredProducts.length ===
      0 ? (
        <EmptyProducts
          hasFilters={
            Boolean(
              search
            ) ||
            category !==
              "الكل" ||
            storeFilter !==
              "all"
          }
          onAdd={
            openAddForm
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map(
            (product) => (
              <ProductCard
                key={
                  product.id
                }
                product={
                  product
                }
                onEdit={() =>
                  openEditForm(
                    product
                  )
                }
                onTogglePublish={() =>
                  togglePublish(
                    product
                  )
                }
                onDelete={() =>
                  setDeleteTarget(
                    product
                  )
                }
                menuOpen={
                  productMenu ===
                  product.id
                }
                onMenuToggle={() =>
                  setProductMenu(
                    productMenu ===
                      product.id
                      ? null
                      : product.id
                  )
                }
              />
            )
          )}
        </div>
      )}


      {/* Add/Edit */}

      {showForm && (
        <ProductForm
          product={
            editingProduct
          }
          categories={categoryRecords}
          onClose={
            closeForm
          }
          onSave={
            handleSave
          }
          media={
            media
          }
          addMedia={
            addMedia
          }
          updateMedia={
            updateMedia
          }
          deleteMedia={
            deleteMedia
          }
        />
      )}


      {/* Delete */}

      {deleteTarget && (
        <DeleteModal
          product={
            deleteTarget
          }
          onClose={() =>
            setDeleteTarget(
              null
            )
          }
          onConfirm={
            confirmDelete
          }
        />
      )}
    </div>
  );
}


/* =========================
   PRODUCT CARD
========================= */

function ProductCard({
  product,
  onEdit,
  onTogglePublish,
  onDelete,
  menuOpen,
  onMenuToggle,
}) {
  const isOut =
    Number(
      product.stock || 0
    ) === 0;


  const isLow =
    !isOut &&
    Number(
      product.stock || 0
    ) <=
      Number(
        product.reorderLevel ||
          0
      );


  const published =
    product.isPublished &&
    product.showOnStore;


  return (
    <div className="group relative overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}

      <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-t-2xl bg-slate-100">
        {product.image ? (
          <img
            src={
              product.image
            }
            alt={
              product.name
            }
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <ImagePlus
              size={42}
            />

            <p className="mt-2 text-xs font-bold">
              لا توجد صورة
            </p>
          </div>
        )}

        <div className="absolute right-4 top-4 flex flex-wrap gap-2">
          {product.featured && (
            <Badge
              icon={
                Star
              }
              label="مميز"
              className="bg-amber-50 text-amber-600"
            />
          )}

          {product.isNew && (
            <Badge
              icon={
                Sparkles
              }
              label="جديد"
              className="bg-blue-50 text-blue-700"
            />
          )}

          {product.isSale && (
            <Badge
              icon={
                Tag
              }
              label="عرض"
              className="bg-red-50 text-red-600"
            />
          )}
        </div>


        {/* Store status */}

        <div className="absolute bottom-4 right-4">
          {published ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-[11px] font-black text-emerald-600 shadow-sm backdrop-blur">
              <Eye size={13} />
              ظاهر في المتجر
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/85 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur">
              <EyeOff
                size={13}
              />
              مخفي
            </span>
          )}
        </div>
      </div>


      {/* Content */}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-slate-900">
              {
                product.name
              }
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {
                product.sku
              }

              {product.category
                ? ` • ${product.category}`
                : ""}
            </p>
          </div>


          {/* Menu */}

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={
                onMenuToggle
              }
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <MoreVertical
                size={18}
              />
            </button>

            {menuOpen && (
              <div className="absolute left-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                <ActionItem
                  icon={
                    Pencil
                  }
                  label="تعديل"
                  onClick={
                    onEdit
                  }
                />

                <ActionItem
                  icon={
                    publishedIcon(
                      published
                    )
                  }
                  label={
                    published
                      ? "إخفاء من المتجر"
                      : "نشر في المتجر"
                  }
                  onClick={
                    onTogglePublish
                  }
                />

                <ActionItem
                  icon={
                    Trash2
                  }
                  label="أرشفة"
                  danger
                  onClick={
                    onDelete
                  }
                />
              </div>
            )}
          </div>
        </div>


        {/* Price */}

        <div className="mt-5 flex items-end justify-between">
          <div>
            {product.oldPrice ? (
              <p className="text-xs font-semibold text-slate-400 line-through">
                {
                  product.oldPrice
                }{" "}
                ج.م
              </p>
            ) : null}

            <p className="text-xl font-black text-blue-700">
              {
                product.sellingPrice
              }{" "}
              ج.م
            </p>
          </div>

          <StockBadge
            isOut={
              isOut
            }
            isLow={
              isLow
            }
            stock={
              product.stock
            }
          />
        </div>


        {/* Bottom */}

        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
          <InfoMini
            label="شراء"
            value={`${product.purchasePrice} ج.م`}
          />

          <InfoMini
            label="إعادة الطلب"
            value={`${product.reorderLevel}`}
          />
        </div>
      </div>
    </div>
  );
}


/* =========================
   PRODUCT FORM
========================= */

function ProductForm({
  product,
  categories = [],
  onClose,
  onSave,
  media,
  addMedia,
  updateMedia,
  deleteMedia,
}) {
  const [
    form,
    setForm,
  ] = useState({
    name:
      product?.name ||
      "",

    sku:
      product?.sku ||
      "",

    slug:
      product?.slug ||
      "",

    categoryId:
      product?.categoryId ||
      "",

    category:
      product?.category ||
      "",

    description:
      product?.description ||
      "",

    purchasePrice:
      product?.purchasePrice ??
      "",

    sellingPrice:
      product?.sellingPrice ??
      product?.price ??
      "",

    oldPrice:
      product?.oldPrice ??
      "",

    stock:
      product?.stock ??
      "",

    reorderLevel:
      product?.reorderLevel ??
      5,

    supplierId:
      product?.supplierId ||
      "",

    supplier:
      product?.supplier ||
      "",

    color:
      product?.color ||
      "",

    material:
      product?.material ||
      "",

    size:
      product?.size ||
      "",

    image:
      product?.image ||
      "",

    images:
      Array.isArray(
        product?.images
      )
        ? product.images
        : [],

    showOnStore:
      product?.showOnStore ??
      false,

    isPublished:
      product?.isPublished ??
      false,

    featured:
      product?.featured ??
      false,

    isNew:
      product?.isNew ??
      false,

    isSale:
      product?.isSale ??
      false,

    status:
      product?.status ===
        "ARCHIVED"
        ? "ARCHIVED"
        : product?.isPublished
          ? "PUBLISHED"
          : "DRAFT",
  });


  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false);


  const [
    uploadingGallery,
    setUploadingGallery,
  ] = useState(false);


  const updateField =
    (
      key,
      value
    ) => {
      setForm(
        (
          current
        ) => ({
          ...current,
          [key]:
            value,
        })
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Main Image
  |--------------------------------------------------------------------------
  */

  const handleMainImageUpload =
    async (
      event
    ) => {
      const file =
        event.target
          .files?.[0];


      if (!file) {
        return;
      }


      try {
        setUploadingImage(
          true
        );


        const dataUrl =
          await fileToDataUrl(
            file
          );


        const uploadedMedia =
          await addMedia({
            name:
              file.name,

          type:
            file.type,

          size:
            file.size,

          url:
            dataUrl,

          folder:
            "products",

          entityType:
            "product",

          entityId:
            product?.id ||
            null,

            isPrimary:
              true,
          });


        const latestMedia =
          uploadedMedia ||
          useMediaStore
            .getState()
            .media[
              useMediaStore
                .getState()
                .media.length -
                1
            ];


        media
          .filter(
            (item) =>
              item.entityType ===
                "product" &&
              String(
                item.entityId
              ) ===
                String(
                  product?.id
                ) &&
              item.isPrimary
          )
          .forEach(
            (item) => {
              updateMedia(
                item.id,
                {
                  isPrimary:
                    false,
                }
              );
            }
          );


        updateField(
          "image",
          uploadedMedia?.url || dataUrl
        );


        updateField(
          "imageMediaId",
          latestMedia?.id ||
            null
        );


        toast.success(
          "تم رفع الصورة الرئيسية"
        );

      } catch (uploadError) {
        toast.error(
          uploadError?.message ||
            "تعذر رفع الصورة"
        );

      } finally {
        setUploadingImage(
          false
        );

        event.target.value =
          "";
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Remove Main Image
  |--------------------------------------------------------------------------
  */

  const removeMainImage =
    () => {
      if (
        form.imageMediaId
      ) {
        deleteMedia(
          form.imageMediaId
        );
      } else {
        const linkedMedia =
          media.find(
            (item) =>
              item.url ===
              form.image
          );


        if (
          linkedMedia
        ) {
          deleteMedia(
            linkedMedia.id
          );
        }
      }


      updateField(
        "image",
        ""
      );


      updateField(
        "imageMediaId",
        null
      );


      toast.success(
        "تمت إزالة الصورة"
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Gallery
  |--------------------------------------------------------------------------
  */

  const handleGalleryUpload =
    async (
      event
    ) => {
      const files =
        Array.from(
          event.target
            .files || []
        );


      if (
        files.length ===
        0
      ) {
        return;
      }


      try {
        setUploadingGallery(
          true
        );


        const uploaded =
          [];


        for (
          const file of files
        ) {
          const url =
            await fileToDataUrl(
              file
            );


          const uploadedMedia =
            await addMedia({
              name:
                file.name,

            type:
              file.type,

            size:
              file.size,

            url,

            folder:
              "products",

            entityType:
              "product",

            entityId:
              product?.id ||
              null,

              isPrimary:
                false,
            });


          const currentMedia =
            useMediaStore
              .getState()
              .media;


          const latest =
            currentMedia[
              currentMedia.length -
                1
            ];


          uploaded.push({
            id:
              uploadedMedia?.id ||
              latest?.id ||
              `IMG-${Date.now()}-${Math.random()
                .toString(36)
                .slice(
                  2,
                  7
                )}`,

            name:
              file.name,

            url:
              uploadedMedia?.url || url,

            mediaId:
              uploadedMedia?.id ||
              latest?.id ||
              null,
          });
        }


        setForm(
          (
            current
          ) => ({
            ...current,

            images: [
              ...(
                current.images ||
                []
              ),

              ...uploaded,
            ],
          })
        );


        toast.success(
          `تمت إضافة ${uploaded.length} ${
            uploaded.length ===
            1
              ? "صورة"
              : "صور"
          }`
        );

      } catch (uploadError) {
        toast.error(
          uploadError?.message ||
            "تعذر إضافة الصور"
        );

      } finally {
        setUploadingGallery(
          false
        );

        event.target.value =
          "";
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Remove Gallery Image
  |--------------------------------------------------------------------------
  */

  const removeGalleryImage =
    (
      image,
      index
    ) => {
      const mediaId =
        image?.mediaId ||
        image?.id;


      /*
        لا نحاول حذف ProductImage
        من PostgreSQL من هنا.
        الإزالة النهائية من Backend
        تحصل عند حفظ المنتج لأن
        updateProduct يستبدل الصور.
      */

      if (
        mediaId
      ) {
        const localMedia =
          media.find(
            (item) =>
              String(
                item.id
              ) ===
              String(
                mediaId
              )
          );


        if (
          localMedia
        ) {
          deleteMedia(
            localMedia.id
          );
        }
      }


      setForm(
        (
          current
        ) => ({
          ...current,

          images:
            current.images.filter(
              (
                _,
                imageIndex
              ) =>
                imageIndex !==
                index
            ),
        })
      );


      toast.success(
        "تم حذف الصورة من المعرض"
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Main Image Upload Box
  |--------------------------------------------------------------------------
  */

  const mainImageMediaExists =
    form.imageMediaId ||
    media.some(
      (item) =>
        item.url ===
        form.image
    );


  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit =
    (
      event
    ) => {
      event.preventDefault();


      if (
        !form.name.trim()
      ) {
        toast.error(
          "أدخل اسم المنتج"
        );

        return;
      }


      if (
        !form.sku.trim()
      ) {
        toast.error(
          "أدخل SKU"
        );

        return;
      }


      if (
        form.sellingPrice ===
          "" ||
        Number(
          form.sellingPrice
        ) <= 0
      ) {
        toast.error(
          "أدخل سعر بيع صحيح"
        );

        return;
      }


      if (
        form.purchasePrice ===
          "" ||
        Number(
          form.purchasePrice
        ) < 0
      ) {
        toast.error(
          "أدخل سعر شراء صحيح"
        );

        return;
      }


      /*
        عند الإضافة نحتاج
        initialStock.

        عند التعديل لا نرسل stock
        كـUpdate لأن Backend
        يمنع تغيير المخزون من
        Product Service.
      */

      if (
        !product &&
        (
          form.stock ===
            "" ||
          Number(
            form.stock
          ) < 0
        )
      ) {
        toast.error(
          "أدخل كمية مخزون صحيحة"
        );

        return;
      }


      /*
        نجمع الصورة الرئيسية
        مع Gallery.

        Backend ProductImage
        هو مصدر صور المنتج.
      */

      let productImages =
        Array.isArray(
          form.images
        )
          ? [
              ...form.images,
            ]
          : [];


      if (
        form.image
      ) {
        const existingMain =
          productImages.find(
            (image) =>
              image?.url ===
              form.image
          );


        if (
          existingMain
        ) {
          productImages =
            productImages.map(
              (image) => ({
                ...image,

                isPrimary:
                  image.url ===
                  form.image,
              })
            );
        } else {
          productImages = [
            {
              url:
                form.image,

              altText:
                form.name
                  .trim(),

              isPrimary:
                true,

              sortOrder:
                0,
            },

            ...productImages.map(
              (
                image,
                index
              ) => ({
                ...image,

                isPrimary:
                  false,

                sortOrder:
                  index + 1,
              })
            ),
          ];
        }
      }


      /*
        Metadata الخاص
        بالـMedia Store
        لا يُرسل إلى Backend.
      */

      const {
        imageMediaId,
        ...cleanForm
      } = form;


      const payload = {
        ...cleanForm,

        name:
          form.name.trim(),

        sku:
          form.sku.trim(),

        slug:
          form.slug.trim(),

        purchasePrice:
          Number(
            form.purchasePrice ||
              0
          ),

        sellingPrice:
          Number(
            form.sellingPrice ||
              0
          ),

        oldPrice:
          form.oldPrice ===
            ""
            ? null
            : Number(
                form.oldPrice
              ),

        reorderLevel:
          Number(
            form.reorderLevel ||
              0
          ),

        images:
          productImages,

        /*
          إذا كان المنتج جديدًا،
          فالـstock يتحول إلى
          initialStock.

          إذا كان موجودًا مسبقًا،
          نبقي stock خارج
          تحديث الـBackend.
        */

        ...(product
          ? {}
          : {
              initialStock:
                Number(
                  form.stock ||
                    0
                ),
            }),

        /*
          ضمان عدم وجود
          Product منشور بدون
          ظهور في المتجر.
        */

        isPublished:
          form.showOnStore
            ? form.isPublished
            : false,
      };


      /*
        حذف stock من update
        لأنه ليس جزءًا من
        Product Update Contract.
      */

      if (
        product
      ) {
        delete payload.stock;

        delete payload.initialStock;
      }


      onSave(
        payload
      );
    };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <p className="text-xs font-bold text-blue-600">
              كتالوج المنتجات
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {product
                ? "تعديل المنتج"
                : "إضافة منتج جديد"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              أدر بيانات المنتج وصوره وظهوره
              في متجر OPTICANA.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>


        {/* Form */}

        <form
          onSubmit={
            submit
          }
          className="overflow-y-auto"
        >
          <div className="grid gap-8 p-6 lg:grid-cols-[300px_1fr]">

            {/* Media Column */}

            <div>
              <p className="mb-3 text-sm font-black text-slate-700">
                صور المنتج
              </p>

              {/* Main Image */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex h-64 items-center justify-center">
                  {form.image ? (
                    <img
                      src={
                        form.image
                      }
                      alt={
                        form.name ||
                        "معاينة المنتج"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-slate-300">
                      <ImagePlus
                        size={42}
                        className="mx-auto"
                      />

                      <p className="mt-3 text-sm font-bold text-slate-500">
                        لم تتم إضافة صورة
                      </p>

                      <p className="mt-1 px-6 text-xs leading-5 text-slate-400">
                        ارفع صورة رئيسية للمنتج.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 bg-white p-3">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-800">
                    <ImagePlus size={17} />

                    {uploadingImage
                      ? "جاري تجهيز الصورة..."
                      : form.image
                        ? "تغيير الصورة"
                        : "رفع صورة"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleMainImageUpload
                      }
                      disabled={
                        uploadingImage
                      }
                      className="hidden"
                    />
                  </label>

                  {form.image && (
                    <button
                      type="button"
                      onClick={
                        removeMainImage
                      }
                      className="mt-2 w-full rounded-xl py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"
                    >
                      إزالة الصورة
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-slate-400">
                PNG و JPG و WEBP — الحد الأقصى 5MB
              </p>


              {/* Gallery */}

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-700">
                      معرض الصور
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      أضف صورًا إضافية للمنتج.
                    </p>
                  </div>

                  <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200">
                    <Plus size={14} />

                    {uploadingGallery
                      ? "جاري الرفع..."
                      : "إضافة"}

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={
                        handleGalleryUpload
                      }
                      disabled={
                        uploadingGallery
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                {(
                  form.images ||
                  []
                ).length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {form.images.map(
                      (
                        image,
                        index
                      ) => (
                        <div
                          key={
                            image.id ||
                            image.mediaId ||
                            image.url ||
                            index
                          }
                          className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                        >
                          <img
                            src={
                              image.url
                            }
                            alt={
                              image.name ||
                              `صورة ${
                                index +
                                1
                              }`
                            }
                            className="h-full w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeGalleryImage(
                                image,
                                index
                              )
                            }
                            className="absolute left-2 top-2 rounded-lg bg-red-500 p-1.5 text-white opacity-0 shadow-md transition group-hover:opacity-100 hover:bg-red-600"
                            title="حذف الصورة"
                          >
                            <X
                              size={
                                13
                              }
                            />
                          </button>

                          {image.isPrimary && (
                            <span className="absolute bottom-2 right-2 rounded-lg bg-blue-700 px-2 py-1 text-[9px] font-black text-white">
                              رئيسية
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
                    <ImageIcon
                      size={25}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-xs font-bold text-slate-500">
                      لا توجد صور إضافية
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      يمكنك إضافة أكثر من صورة.
                    </p>
                  </div>
                )}
              </div>

              {mainImageMediaExists && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2
                    size={14}
                  />
                  الصورة مرتبطة بنظام Media
                </div>
              )}
            </div>


            {/* Fields */}

            <div className="space-y-6">

              {/* Basic */}

              <FormSection
                title="المعلومات الأساسية"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="اسم المنتج"
                    value={
                      form.name
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "name",
                        value
                      )
                    }
                    required
                    placeholder="مثال: Classic Black"
                  />

                  <TextField
                    label="SKU"
                    value={
                      form.sku
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "sku",
                        value
                      )
                    }
                    required
                    placeholder="OPT-0001"
                  />

                  <TextField
                    label="Slug"
                    value={
                      form.slug
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "slug",
                        value
                      )
                    }
                    placeholder="classic-black"
                  />

                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-700">التصنيف</label>
                    <select
                      value={form.categoryId}
                      onChange={(event) => {
                        const selected = categories.find((item) => String(item.id) === event.target.value);
                        updateField("categoryId", event.target.value);
                        updateField("category", selected?.name || "");
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="">بدون تصنيف</option>
                      {categories.filter((item) => item.active !== false).map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <TextArea
                  label="الوصف"
                  value={
                    form.description
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "description",
                      value
                    )
                  }
                  placeholder="وصف المنتج للمتجر الإلكتروني..."
                />
              </FormSection>


              {/* Prices */}

              <FormSection
                title="الأسعار والمخزون"
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <NumberInput
                    label="سعر الشراء"
                    value={
                      form.purchasePrice
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "purchasePrice",
                        value
                      )
                    }
                  />

                  <NumberInput
                    label="سعر البيع"
                    value={
                      form.sellingPrice
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "sellingPrice",
                        value
                      )
                    }
                  />

                  <NumberInput
                    label="السعر القديم"
                    value={
                      form.oldPrice
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "oldPrice",
                        value
                      )
                    }
                  />

                  <NumberInput
                    label={
                      product
                        ? "المخزون الحالي"
                        : "المخزون الابتدائي"
                    }
                    value={
                      form.stock
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "stock",
                        value
                      )
                    }
                    disabled={
                      Boolean(
                        product
                      )
                    }
                  />

                  <NumberInput
                    label="حد إعادة الطلب"
                    value={
                      form.reorderLevel
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "reorderLevel",
                        value
                      )
                    }
                  />

                  <TextField
                    label="المورد"
                    value={
                      form.supplier
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "supplier",
                        value
                      )
                    }
                    placeholder="اسم المورد"
                  />
                </div>

                {product && (
                  <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
                    تغيير المخزون لا يتم من تعديل المنتج. المخزون يُدار عبر نظام Inventory حتى يتم تسجيل حركة المخزون بشكل صحيح.
                  </div>
                )}
              </FormSection>


              {/* Attributes */}

              <FormSection
                title="خصائص المنتج"
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <TextField
                    label="اللون"
                    value={
                      form.color
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "color",
                        value
                      )
                    }
                    placeholder="أسود"
                  />

                  <TextField
                    label="المادة"
                    value={
                      form.material
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "material",
                        value
                      )
                    }
                    placeholder="بلاستيك"
                  />

                  <TextField
                    label="المقاس"
                    value={
                      form.size
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "size",
                        value
                      )
                    }
                    placeholder="متوسط"
                  />
                </div>
              </FormSection>


              {/* Store */}

              <FormSection
                title="المتجر الإلكتروني"
              >
                <ToggleField
                  label="عرض المنتج في المتجر"
                  description="المنتج موجود في النظام ويمكن إظهاره للعملاء."
                  checked={
                    form.showOnStore
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "showOnStore",
                      value
                    )
                  }
                />

                <ToggleField
                  label="نشر المنتج"
                  description="السماح بعرض المنتج في صفحات المتجر."
                  checked={
                    form.isPublished
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "isPublished",
                      value
                    )
                  }
                />

                <ToggleField
                  label="منتج مميز"
                  description="يمكن عرضه في قسم المنتجات المميزة."
                  checked={
                    form.featured
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "featured",
                      value
                    )
                  }
                />

                <ToggleField
                  label="منتج جديد"
                  description="تمييز المنتج على أنه أضيف حديثًا."
                  checked={
                    form.isNew
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "isNew",
                      value
                    )
                  }
                />

                <ToggleField
                  label="ضمن العروض"
                  description="يظهر كمنتج عليه عرض أو خصم."
                  checked={
                    form.isSale
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "isSale",
                      value
                    )
                  }
                />
              </FormSection>
            </div>
          </div>


          {/* Footer */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-6 sm:flex-row">
            <button
              type="button"
              onClick={
                onClose
              }
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-black text-slate-600 transition hover:bg-slate-100"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white transition hover:bg-blue-800"
            >
              <CheckCircle2
                size={17}
              />

              {product
                ? "حفظ التعديلات"
                : "إنشاء المنتج"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* =========================
   DELETE MODAL
========================= */

function DeleteModal({
  product,
  onClose,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <Trash2
            size={21}
          />
        </div>

        <h2 className="mt-4 text-lg font-black text-slate-900">
          أرشفة المنتج؟
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          هل تريد أرشفة المنتج
          <strong className="mx-1 text-slate-800">
            {
              product.name
            }
          </strong>
          ؟
        </p>

        <p className="mt-2 text-xs leading-5 text-red-500">
          المنتج لن يُحذف فعليًا من قاعدة البيانات؛ سيتم وضعه في حالة ARCHIVED وإخفاؤه من المتجر للحفاظ على السجل التاريخي.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={
              onClose
            }
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={
              onConfirm
            }
            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-black text-white hover:bg-red-700"
          >
            أرشفة المنتج
          </button>
        </div>
      </div>
    </div>
  );
}


/* =========================
   UI HELPERS
========================= */

function SummaryCard({
  icon: Icon,
  title,
  value,
  accent = "blue",
}) {
  const styles = {
    blue:
      "bg-blue-50 text-blue-700",

    orange:
      "bg-orange-50 text-orange-600",

    red:
      "bg-red-50 text-red-600",
  };


  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-slate-500">
          {title}
        </p>

        <p className="mt-2 text-2xl font-black text-slate-900">
          {value}
        </p>
      </div>

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          styles[accent]
        }`}
      >
        <Icon size={21} />
      </div>
    </div>
  );
}


function Badge({
  icon: Icon,
  label,
  className,
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-black ${className}`}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}


function StockBadge({
  isOut,
  isLow,
  stock,
}) {
  if (isOut) {
    return (
      <span className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-black text-red-600">
        نفد
      </span>
    );
  }


  if (isLow) {
    return (
      <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-600">
        {stock} — منخفض
      </span>
    );
  }


  return (
    <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600">
      {stock} متاح
    </span>
  );
}


function InfoMini({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-bold text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-700">
        {value}
      </p>
    </div>
  );
}


function ActionItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}


function publishedIcon(
  published
) {
  return published
    ? EyeOff
    : Eye;
}


function EmptyProducts({
  hasFilters,
  onAdd,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
        <Package size={32} />
      </div>

      <p className="mt-4 font-black text-slate-700">
        {hasFilters
          ? "لا توجد نتائج مطابقة"
          : "لا توجد منتجات حتى الآن"}
      </p>

      <p className="mt-1 text-sm text-slate-400">
        {hasFilters
          ? "جرّب تغيير البحث أو الفلاتر."
          : "أضف أول منتج إلى كتالوج OPTICANA."}
      </p>

      {!hasFilters && (
        <button
          type="button"
          onClick={
            onAdd
          }
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
        >
          <Plus size={17} />
          إضافة أول منتج
        </button>
      )}
    </div>
  );
}


function FormSection({
  title,
  children,
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
      <div>
        <h3 className="font-black text-slate-900">
          {title}
        </h3>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}


function TextField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}

        {required && (
          <span className="mr-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}


function NumberInput({
  label,
  value,
  onChange,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        type="number"
        min="0"
        value={
          value
        }
        disabled={
          disabled
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        className={`w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 ${
          disabled
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : "bg-white"
        }`}
      />
    </div>
  );
}


function TextArea({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <textarea
        rows={4}
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}


function ToggleField({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
      <div>
        <p className="font-black text-slate-800">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(
            !checked
          )
        }
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked
            ? "bg-blue-700"
            : "bg-slate-300"
        }`}
        aria-pressed={
          checked
        }
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked
              ? "right-1"
              : "right-6"
          }`}
        />
      </button>
    </div>
  );
}


export default Products;