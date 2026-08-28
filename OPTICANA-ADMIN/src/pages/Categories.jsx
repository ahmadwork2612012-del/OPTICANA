import {
  Search,
  Plus,
  Tags,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  ImagePlus,
  GripVertical,
  Store,
  Package,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Power,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import useCategoryStore from "../store/categoryStore";
import useProductStore from "../store/productStore";
import useMediaStore from "../store/mediaStore";

import {
  fileToDataUrl,
} from "../utils/imageUtils";


function Categories() {
  /* =====================================
     CATEGORY STORE
  ===================================== */

  const categories =
    useCategoryStore(
      (state) => state.categories
    );

  const isLoading =
    useCategoryStore(
      (state) => state.isLoading
    );

  const fetchCategories =
    useCategoryStore(
      (state) => state.fetchCategories
    );

  const addCategory =
    useCategoryStore(
      (state) => state.addCategory
    );

  const updateCategory =
    useCategoryStore(
      (state) => state.updateCategory
    );

  const deleteCategory =
    useCategoryStore(
      (state) => state.deleteCategory
    );

  const toggleActive =
    useCategoryStore(
      (state) => state.toggleActive
    );

  const toggleStoreVisibility =
    useCategoryStore(
      (state) =>
        state.toggleStoreVisibility
    );

  const setOrder =
    useCategoryStore(
      (state) => state.setOrder
    );

  const setImage =
    useCategoryStore(
      (state) => state.setImage
    );

  const removeImage =
    useCategoryStore(
      (state) => state.removeImage
    );

  const categoryNameExists =
    useCategoryStore(
      (state) =>
        state.categoryNameExists
    );

  const categorySlugExists =
    useCategoryStore(
      (state) =>
        state.categorySlugExists
    );


  /* =====================================
     PRODUCT STORE
  ===================================== */

  const products =
    useProductStore(
      (state) => state.products
    );

  const fetchProducts =
    useProductStore(
      (state) => state.fetchProducts
    );


  /* =====================================
     MEDIA STORE
  ===================================== */

  const media =
    useMediaStore(
      (state) => state.media
    );

  const addMedia =
    useMediaStore(
      (state) => state.addMedia
    );

  const updateMedia =
    useMediaStore(
      (state) => state.updateMedia
    );

  const deleteMedia =
    useMediaStore(
      (state) => state.deleteMedia
    );


  /* =====================================
     LOAD BACKEND DATA
  ===================================== */

  useEffect(() => {
    let mounted = true;


    async function load() {
      try {
        await Promise.all([
          fetchCategories(),
          fetchProducts(),
        ]);
      } catch (error) {
        if (!mounted) {
          return;
        }

        toast.error(
          error?.message ||
            "تعذر تحميل بيانات التصنيفات"
        );
      }
    }


    load();


    return () => {
      mounted = false;
    };
  }, [
    fetchCategories,
    fetchProducts,
  ]);


  /* =====================================
     UI
  ===================================== */

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [storeFilter, setStoreFilter] =
    useState("all");

  const [showForm, setShowForm] =
    useState(false);

  const [
    editingCategory,
    setEditingCategory,
  ] = useState(null);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(null);


  /* =====================================
     SORT
  ===================================== */

  const sortedCategories =
    useMemo(() => {
      return [
        ...categories,
      ].sort(
        (a, b) => {
          const orderA =
            Number(
              a.order || 0
            );

          const orderB =
            Number(
              b.order || 0
            );


          if (
            orderA !== orderB
          ) {
            return (
              orderA -
              orderB
            );
          }


          return String(
            a.name || ""
          ).localeCompare(
            String(
              b.name || ""
            ),
            "ar"
          );
        }
      );
    }, [
      categories,
    ]);


  /* =====================================
     PRODUCT HELPERS
  ===================================== */

  const getCategoryProducts =
    (
      category
    ) => {
      const categoryId =
        category?.id;


      const categoryName =
        category?.name
          ?.trim()
          .toLowerCase();


      return products.filter(
        (product) => {
          /*
            Prefer the real categoryId
            when available.

            Fallback to category name
            for older/local product
            shapes.
          */

          if (
            product?.categoryId &&
            categoryId
          ) {
            return (
              String(
                product.categoryId
              ) ===
              String(
                categoryId
              )
            );
          }


          return (
            product?.category
              ?.trim()
              .toLowerCase() ===
            categoryName
          );
        }
      );
    };


  const getCategoryProductCount =
    (
      category
    ) => {
      /*
        Prefer Backend _count when
        available because it is the
        database source of truth.
      */

      if (
        Number.isFinite(
          Number(
            category?.productCount
          )
        )
      ) {
        return Number(
          category.productCount
        );
      }


      return getCategoryProducts(
        category
      ).length;
    };


  const getPublishedProductCount =
    (
      category
    ) =>
      getCategoryProducts(
        category
      ).filter(
        (product) =>
          product.isPublished &&
          product.showOnStore
      ).length;


  /* =====================================
     FILTERED CATEGORIES
  ===================================== */

  const filteredCategories =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();


      return sortedCategories.filter(
        (category) => {
          const matchesSearch =
            !value ||
            category.name
              ?.toLowerCase()
              .includes(
                value
              ) ||
            category.slug
              ?.toLowerCase()
              .includes(
                value
              ) ||
            category.description
              ?.toLowerCase()
              .includes(
                value
              );


          const matchesStatus =
            statusFilter ===
              "all" ||
            (
              statusFilter ===
                "active" &&
              category.active
            ) ||
            (
              statusFilter ===
                "inactive" &&
              !category.active
            );


          const matchesStore =
            storeFilter ===
              "all" ||
            (
              storeFilter ===
                "visible" &&
              category.showOnStore
            ) ||
            (
              storeFilter ===
                "hidden" &&
              !category.showOnStore
            );


          return (
            matchesSearch &&
            matchesStatus &&
            matchesStore
          );
        }
      );
    }, [
      sortedCategories,
      search,
      statusFilter,
      storeFilter,
    ]);


  /* =====================================
     SUMMARY
  ===================================== */

  const totalCategories =
    categories.length;


  const activeCategories =
    categories.filter(
      (category) =>
        category.active
    ).length;


  const visibleCategories =
    categories.filter(
      (category) =>
        category.active &&
        category.showOnStore
    ).length;


  const assignedProducts =
    categories.reduce(
      (
        sum,
        category
      ) =>
        sum +
        getCategoryProductCount(
          category
        ),
      0
    );


  /* =====================================
     FORM
  ===================================== */

  const openAddForm =
    () => {
      setEditingCategory(
        null
      );

      setShowForm(
        true
      );
    };


  const openEditForm =
    (
      category
    ) => {
      setEditingCategory(
        category
      );

      setShowForm(
        true
      );

      setMenuOpen(
        null
      );
    };


  const closeForm =
    () => {
      setShowForm(
        false
      );

      setEditingCategory(
        null
      );
    };


  /* =====================================
     SAVE
  ===================================== */

  const handleSave =
    async (
      categoryData
    ) => {
      const name =
        categoryData.name
          ?.trim() ||
        "";


      const generatedSlug =
        name
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


      const slug =
        categoryData.slug
          ?.trim() ||
        generatedSlug;


      if (!name) {
        toast.error(
          "أدخل اسم التصنيف"
        );

        return;
      }


      if (
        categoryNameExists(
          name,
          editingCategory?.id ||
            null
        )
      ) {
        toast.error(
          "اسم التصنيف موجود بالفعل"
        );

        return;
      }


      if (
        slug &&
        categorySlugExists(
          slug,
          editingCategory?.id ||
            null
        )
      ) {
        toast.error(
          "Slug مستخدم بالفعل"
        );

        return;
      }


      const data = {
        name,

        slug,

        description:
          categoryData.description
            ?.trim() ||
          "",

        image:
          categoryData.image ||
          null,

        order:
          Number(
            categoryData.order ??
              0
          ),

        active:
          categoryData.active ??
          true,

        showOnStore:
          categoryData.showOnStore ??
          true,
      };


      try {
        if (
          editingCategory
        ) {
          await updateCategory(
            editingCategory.id,
            data
          );


          toast.success(
            "تم تحديث التصنيف بنجاح"
          );
        } else {
          await addCategory(
            data
          );


          toast.success(
            "تم إنشاء التصنيف بنجاح"
          );
        }


        closeForm();

      } catch (error) {
        console.error(
          "Categories save:",
          error
        );


        toast.error(
          error?.message ||
            "تعذر حفظ التصنيف"
        );
      }
    };


  /* =====================================
     ACTIVE
  ===================================== */

  const handleToggleActive =
    async (
      category
    ) => {
      try {
        await toggleActive(
          category.id
        );


        toast.success(
          category.active
            ? "تم تعطيل التصنيف"
            : "تم تفعيل التصنيف"
        );

      } catch (error) {
        toast.error(
          error?.message ||
            "تعذر تحديث حالة التصنيف"
        );
      } finally {
        setMenuOpen(
          null
        );
      }
    };


  /* =====================================
     STORE VISIBILITY
  ===================================== */

  const handleToggleStore =
    async (
      category
    ) => {
      try {
        await toggleStoreVisibility(
          category.id
        );


        toast.success(
          category.showOnStore
            ? "تم إخفاء التصنيف من المتجر"
            : "تم إظهار التصنيف في المتجر"
        );

      } catch (error) {
        toast.error(
          error?.message ||
            "تعذر تحديث ظهور التصنيف"
        );
      } finally {
        setMenuOpen(
          null
        );
      }
    };


  /* =====================================
     MOVE
  ===================================== */

  const moveCategory =
    async (
      category,
      direction
    ) => {
      const index =
        sortedCategories.findIndex(
          (item) =>
            String(
              item.id
            ) ===
            String(
              category.id
            )
        );


      if (
        index ===
        -1
      ) {
        return;
      }


      const targetIndex =
        direction ===
          "up"
          ? index - 1
          : index + 1;


      if (
        targetIndex <
          0 ||
        targetIndex >=
          sortedCategories.length
      ) {
        return;
      }


      const current =
        sortedCategories[
          index
        ];

      const target =
        sortedCategories[
          targetIndex
        ];


      try {
        await Promise.all([
          setOrder(
            current.id,
            target.order
          ),

          setOrder(
            target.id,
            current.order
          ),
        ]);


        toast.success(
          "تم تحديث ترتيب التصنيفات"
        );

      } catch (error) {
        toast.error(
          error?.message ||
            "تعذر تحديث ترتيب التصنيفات"
        );
      }
    };


  /* =====================================
     IMAGE UPLOAD
  ===================================== */

  const handleImageUpload =
    async (
      event,
      category
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("اختر صورة صحيحة");
        event.target.value = "";
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("حجم الصورة يجب ألا يتجاوز 5MB");
        event.target.value = "";
        return;
      }

      try {
        const url = await fileToDataUrl(file);
        const existingMedia = media.find(
          (item) =>
            item.entityType === "category" &&
            String(item.entityId) === String(category.id)
        );

        let storedUrl = url;

        if (existingMedia) {
          const updatedMedia = await updateMedia(existingMedia.id, {
            name: file.name,
            mimeType: file.type,
            size: file.size,
            url,
            folder: "categories",
            entityType: "category",
            entityId: category.id,
          });
          storedUrl = updatedMedia?.url || storedUrl;
        } else {
          const uploadedMedia = await addMedia({
            name: file.name,
            mimeType: file.type,
            size: file.size,
            url,
            folder: "categories",
            entityType: "category",
            entityId: category.id,
          });
          storedUrl = uploadedMedia?.url || storedUrl;
        }

        await setImage(category.id, storedUrl);

        setSelectedCategory((current) =>
          current && String(current.id) === String(category.id)
            ? { ...current, image: storedUrl }
            : current
        );

        toast.success("تم تحديث صورة التصنيف");
      } catch (error) {
        toast.error(error?.message || "تعذر رفع صورة التصنيف");
      } finally {
        event.target.value = "";
      }
    };

  /* =====================================
     REMOVE IMAGE
  ===================================== */

  const handleRemoveImage =
    async (
      category
    ) => {
      try {
        const linkedMediaIds =
          media
            .filter(
              (item) =>
                item.entityType ===
                  "category" &&
                String(
                  item.entityId
                ) ===
                  String(
                    category.id
                  )
            )
            .map(
              (item) =>
                item.id
            );


        linkedMediaIds.forEach(
          (id) =>
            deleteMedia(
              id
            )
        );


        await removeImage(
          category.id
        );


        setSelectedCategory(
          (
            current
          ) =>
            current &&
            String(
              current.id
            ) ===
              String(
                category.id
              )
              ? {
                  ...current,

                  image:
                    null,
                }
              : current
        );


        toast.success(
          "تم حذف صورة التصنيف"
        );

      } catch (error) {
        toast.error(
          error?.message ||
            "تعذر حذف صورة التصنيف"
        );
      }
    };


  /* =====================================
     DELETE
  ===================================== */

  const confirmDelete =
    async () => {
      if (!deleteTarget) {
        return;
      }


      const linkedCount =
        getCategoryProductCount(
          deleteTarget
        );


      if (
        linkedCount >
        0
      ) {
        toast.error(
          `لا يمكن حذف التصنيف لأنه مرتبط بـ ${linkedCount} منتج`
        );

        return;
      }


      try {
        const linkedMediaIds =
          media
            .filter(
              (item) =>
                item.entityType ===
                  "category" &&
                String(
                  item.entityId
                ) ===
                  String(
                    deleteTarget.id
                  )
            )
            .map(
              (item) =>
                item.id
            );


        linkedMediaIds.forEach(
          (id) =>
            deleteMedia(
              id
            )
        );


        await deleteCategory(
          deleteTarget.id
        );


        toast.success(
          "تم حذف التصنيف بنجاح"
        );


        setDeleteTarget(
          null
        );

        setSelectedCategory(
          null
        );

        setMenuOpen(
          null
        );

      } catch (error) {
        console.error(
          "Categories delete:",
          error
        );


        toast.error(
          error?.message ||
            "تعذر حذف التصنيف"
        );
      }
    };


  /* =====================================
     LOADING
  ===================================== */

  if (
    isLoading &&
    categories.length ===
      0
  ) {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
            <Tags size={15} />
            إدارة الكتالوج
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            التصنيفات
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            جاري تحميل التصنيفات من قاعدة البيانات...
          </p>
        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="space-y-4">
            {Array.from(
              {
                length: 5,
              }
            ).map(
              (
                _,
                index
              ) => (
                <div
                  key={
                    index
                  }
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
            <Tags size={15} />
            إدارة الكتالوج
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            التصنيفات
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            إدارة تصنيفات منتجات OPTICANA،
            ترتيبها والتحكم في ظهورها داخل المتجر.
          </p>

        </div>


        <button
          type="button"
          onClick={
            openAddForm
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-800"
        >
          <Plus size={18} />
          إضافة تصنيف
        </button>

      </div>


      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          icon={Tags}
          title="إجمالي التصنيفات"
          value={
            totalCategories
          }
          accent="blue"
        />

        <SummaryCard
          icon={
            CheckCircle2
          }
          title="التصنيفات النشطة"
          value={
            activeCategories
          }
          accent="green"
        />

        <SummaryCard
          icon={Store}
          title="ظاهرة في المتجر"
          value={
            visibleCategories
          }
          accent="purple"
        />

        <SummaryCard
          icon={Package}
          title="المنتجات المصنفة"
          value={
            assignedProducts
          }
          accent="orange"
        />

      </div>


      {/* FILTERS */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-3 xl:flex-row">

          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

            <Search
              size={18}
              className="text-slate-400"
            />

            <input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="ابحث باسم التصنيف أو Slug..."
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
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target
                  .value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:border-blue-500 xl:w-48"
          >
            <option value="all">
              كل الحالات
            </option>

            <option value="active">
              نشطة
            </option>

            <option value="inactive">
              غير نشطة
            </option>
          </select>


          <select
            value={
              storeFilter
            }
            onChange={(
              event
            ) =>
              setStoreFilter(
                event.target
                  .value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:border-blue-500 xl:w-52"
          >
            <option value="all">
              كل حالات المتجر
            </option>

            <option value="visible">
              ظاهرة في المتجر
            </option>

            <option value="hidden">
              مخفية عن المتجر
            </option>
          </select>

        </div>

      </div>


      {/* CATEGORIES */}

      {filteredCategories.length ===
      0 ? (
        <EmptyState
          hasFilters={
            Boolean(
              search
            ) ||
            statusFilter !==
              "all" ||
            storeFilter !==
              "all"
          }
          onAdd={
            openAddForm
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-right">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-400">

                  <th className="px-5 py-4">
                    الترتيب
                  </th>

                  <th className="px-5 py-4">
                    التصنيف
                  </th>

                  <th className="px-5 py-4">
                    المنتجات
                  </th>

                  <th className="px-5 py-4">
                    حالة النظام
                  </th>

                  <th className="px-5 py-4">
                    المتجر
                  </th>

                  <th className="px-5 py-4">
                    آخر تحديث
                  </th>

                  <th className="px-5 py-4">
                    الإجراءات
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {filteredCategories.map(
                  (
                    category
                  ) => {

                    const total =
                      getCategoryProductCount(
                        category
                      );


                    const published =
                      getPublishedProductCount(
                        category
                      );


                    const realIndex =
                      sortedCategories.findIndex(
                        (item) =>
                          String(
                            item.id
                          ) ===
                          String(
                            category.id
                          )
                      );


                    const isFirst =
                      realIndex ===
                      0;


                    const isLast =
                      realIndex ===
                      sortedCategories.length -
                        1;


                    return (
                      <tr
                        key={
                          category.id
                        }
                        className="transition hover:bg-slate-50"
                      >

                        {/* ORDER */}

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                              <GripVertical
                                size={17}
                              />
                            </div>


                            <div className="flex flex-col gap-1">

                              <button
                                type="button"
                                disabled={
                                  isFirst
                                }
                                onClick={() =>
                                  moveCategory(
                                    category,
                                    "up"
                                  )
                                }
                                className="rounded-md p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
                                title="تحريك للأعلى"
                              >
                                <ChevronUp
                                  size={14}
                                />
                              </button>


                              <button
                                type="button"
                                disabled={
                                  isLast
                                }
                                onClick={() =>
                                  moveCategory(
                                    category,
                                    "down"
                                  )
                                }
                                className="rounded-md p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30"
                                title="تحريك للأسفل"
                              >
                                <ChevronDown
                                  size={14}
                                />
                              </button>

                            </div>


                            <span className="text-xs font-black text-slate-500">
                              {
                                category.order
                              }
                            </span>

                          </div>

                        </td>


                        {/* CATEGORY */}

                        <td className="px-5 py-5">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCategory(
                                category
                              )
                            }
                            className="flex items-center gap-3 text-right"
                          >

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-blue-700">

                              {category.image ? (
                                <img
                                  src={
                                    category.image
                                  }
                                  alt={
                                    category.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Tags
                                  size={20}
                                />
                              )}

                            </div>


                            <div className="min-w-0">

                              <p className="truncate font-black text-slate-800">
                                {
                                  category.name
                                }
                              </p>

                              <p className="mt-1 truncate text-xs text-slate-400">
                                /
                                {
                                  category.slug
                                }
                              </p>

                            </div>

                          </button>

                        </td>


                        {/* PRODUCTS */}

                        <td className="px-5 py-5">

                          <div>

                            <p className="font-black text-slate-800">
                              {
                                total
                              }
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                              {
                                published
                              }{" "}
                              في المتجر
                            </p>

                          </div>

                        </td>


                        {/* SYSTEM STATUS */}

                        <td className="px-5 py-5">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black ${
                              category.active
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {category.active ? (
                              <CheckCircle2
                                size={14}
                              />
                            ) : (
                              <Power
                                size={14}
                              />
                            )}

                            {category.active
                              ? "نشط"
                              : "معطل"}
                          </span>

                        </td>


                        {/* STORE */}

                        <td className="px-5 py-5">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black ${
                              category.active &&
                              category.showOnStore
                                ? "bg-blue-50 text-blue-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {category.active &&
                            category.showOnStore ? (
                              <Eye
                                size={14}
                              />
                            ) : (
                              <EyeOff
                                size={14}
                              />
                            )}

                            {category.active &&
                            category.showOnStore
                              ? "ظاهر"
                              : "مخفي"}
                          </span>

                        </td>


                        {/* UPDATED */}

                        <td className="px-5 py-5">

                          <span className="text-xs text-slate-400">
                            {
                              formatDate(
                                category.updatedAt
                              )
                            }
                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="px-5 py-5">

                          <div className="relative flex items-center gap-1">

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCategory(
                                  category
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700"
                              title="عرض"
                            >
                              <Eye
                                size={17}
                              />
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  category
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700"
                              title="تعديل"
                            >
                              <Pencil
                                size={17}
                              />
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                setMenuOpen(
                                  menuOpen ===
                                    category.id
                                    ? null
                                    : category.id
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              title="المزيد"
                            >
                              <MoreVertical
                                size={17}
                              />
                            </button>


                            {menuOpen ===
                              category.id && (
                              <div className="absolute left-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">

                                <ActionButton
                                  icon={
                                    category.active
                                      ? Power
                                      : CheckCircle2
                                  }
                                  label={
                                    category.active
                                      ? "تعطيل التصنيف"
                                      : "تفعيل التصنيف"
                                  }
                                  onClick={() =>
                                    handleToggleActive(
                                      category
                                    )
                                  }
                                />


                                <ActionButton
                                  icon={
                                    category.showOnStore
                                      ? EyeOff
                                      : Eye
                                  }
                                  label={
                                    category.showOnStore
                                      ? "إخفاء من المتجر"
                                      : "إظهار في المتجر"
                                  }
                                  onClick={() =>
                                    handleToggleStore(
                                      category
                                    )
                                  }
                                />


                                <ActionButton
                                  icon={
                                    Trash2
                                  }
                                  label="حذف"
                                  danger
                                  onClick={() => {
                                    setDeleteTarget(
                                      category
                                    );

                                    setMenuOpen(
                                      null
                                    );
                                  }}
                                />

                              </div>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}


      {/* ADD / EDIT */}

      {showForm && (
        <CategoryForm
          category={
            editingCategory
          }
          onClose={
            closeForm
          }
          onSave={
            handleSave
          }
        />
      )}


      {/* DETAILS */}

      {selectedCategory && (
        <CategoryDetails
          category={
            selectedCategory
          }
          productCount={
            getCategoryProductCount(
              selectedCategory
            )
          }
          publishedProductCount={
            getPublishedProductCount(
              selectedCategory
            )
          }
          onClose={() =>
            setSelectedCategory(
              null
            )
          }
          onEdit={() => {
            const category =
              selectedCategory;

            setSelectedCategory(
              null
            );

            openEditForm(
              category
            );
          }}
          onToggleActive={() =>
            handleToggleActive(
              selectedCategory
            )
          }
          onToggleStore={() =>
            handleToggleStore(
              selectedCategory
            )
          }
          onDelete={() => {
            const category =
              selectedCategory;

            setSelectedCategory(
              null
            );

            setDeleteTarget(
              category
            );
          }}
          onImageUpload={(
            event
          ) =>
            handleImageUpload(
              event,
              selectedCategory
            )
          }
          onRemoveImage={() =>
            handleRemoveImage(
              selectedCategory
            )
          }
        />
      )}


      {/* DELETE */}

      {deleteTarget && (
        <DeleteModal
          category={
            deleteTarget
          }
          productCount={
            getCategoryProductCount(
              deleteTarget
            )
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


/* =====================================
   CATEGORY FORM
===================================== */

function CategoryForm({
  category,
  onClose,
  onSave,
}) {
  const [
    form,
    setForm,
  ] = useState({
    name:
      category?.name ||
      "",

    slug:
      category?.slug ||
      "",

    description:
      category?.description ||
      "",

    image:
      category?.image ||
      null,

    order:
      category?.order ??
      0,

    active:
      category?.active ??
      true,

    showOnStore:
      category?.showOnStore ??
      true,
  });


  const [
    imageUploading,
    setImageUploading,
  ] = useState(false);


  const updateField =
    (
      key,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,

          [key]:
            value,
        })
      );
    };


  const uploadImage =
    async (
      event
    ) => {
      const file =
        event.target
          .files?.[0];


      if (!file) {
        return;
      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        toast.error(
          "اختر صورة صحيحة"
        );

        event.target.value =
          "";

        return;
      }


      if (
        file.size >
        5 *
          1024 *
          1024
      ) {
        toast.error(
          "حجم الصورة يجب ألا يتجاوز 5MB"
        );

        event.target.value =
          "";

        return;
      }


      try {
        setImageUploading(
          true
        );


        const url =
          await fileToDataUrl(
            file
          );


        setForm(
          (current) => ({
            ...current,

            image:
              url,
          })
        );


        toast.success(
          "تم تجهيز صورة التصنيف"
        );

      } catch (error) {
        toast.error(
          error?.message ||
            "تعذر تجهيز الصورة"
        );
      } finally {
        setImageUploading(
          false
        );

        event.target.value =
          "";
      }
    };


  const submit =
    (
      event
    ) => {
      event.preventDefault();


      const name =
        form.name.trim();


      if (!name) {
        toast.error(
          "أدخل اسم التصنيف"
        );

        return;
      }


      onSave({
        ...form,

        name,

        slug:
          form.slug.trim(),

        description:
          form.description.trim(),

        order:
          Number(
            form.order ||
              0
          ),

        active:
          Boolean(
            form.active
          ),

        showOnStore:
          Boolean(
            form.showOnStore
          ),
      });
    };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div>

            <p className="text-xs font-bold text-blue-600">
              إدارة الكتالوج
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {category
                ? "تعديل التصنيف"
                : "إضافة تصنيف جديد"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              أنشئ تصنيفًا قابلًا للاستخدام في
              الإدارة والمتجر.
            </p>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>


        <form
          onSubmit={
            submit
          }
          className="overflow-y-auto"
        >

          <div className="space-y-6 p-6">

            {/* IMAGE */}

            <div className="rounded-2xl border border-slate-200 p-5">

              <div className="mb-4">

                <h3 className="font-black text-slate-900">
                  صورة التصنيف
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  ستستخدم في صفحات المتجر والتصنيفات.
                </p>

              </div>


              <div className="flex flex-col gap-4 sm:flex-row">

                <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">

                  {form.image ? (
                    <img
                      src={
                        form.image
                      }
                      alt={
                        form.name ||
                        "التصنيف"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Tags
                      size={36}
                      className="text-slate-300"
                    />
                  )}

                </div>


                <div className="flex flex-1 flex-col justify-center">

                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800">

                    <ImagePlus
                      size={17}
                    />

                    {imageUploading
                      ? "جاري تجهيز الصورة..."
                      : form.image
                        ? "تغيير الصورة"
                        : "رفع صورة"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        uploadImage
                      }
                      disabled={
                        imageUploading
                      }
                      className="hidden"
                    />

                  </label>


                  {form.image && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm(
                          (
                            current
                          ) => ({
                            ...current,

                            image:
                              null,
                          })
                        )
                      }
                      className="mt-2 rounded-xl py-2 text-xs font-bold text-red-500 hover:bg-red-50"
                    >
                      إزالة الصورة
                    </button>
                  )}


                  <p className="mt-2 text-[11px] text-slate-400">
                    PNG / JPG / WEBP — حتى 5MB
                  </p>

                </div>

              </div>

            </div>


            {/* BASIC */}

            <div className="space-y-4 rounded-2xl border border-slate-200 p-5">

              <h3 className="font-black text-slate-900">
                المعلومات الأساسية
              </h3>


              <TextField
                label="اسم التصنيف"
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
                placeholder="مثال: النظارات الطبية"
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
                placeholder="medical-glasses"
              />


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
                placeholder="وصف مختصر للتصنيف..."
              />

            </div>


            {/* DISPLAY */}

            <div className="space-y-4 rounded-2xl border border-slate-200 p-5">

              <h3 className="font-black text-slate-900">
                الظهور والتنظيم
              </h3>


              <NumberField
                label="الترتيب"
                value={
                  form.order
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "order",
                    value
                  )
                }
              />


              <ToggleField
                label="التصنيف نشط"
                description="يمكن استخدام التصنيف داخل الإدارة والمتجر."
                checked={
                  form.active
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "active",
                    value
                  )
                }
              />


              <ToggleField
                label="إظهار في المتجر"
                description="السماح بظهور التصنيف في واجهة المتجر."
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

            </div>

          </div>


          <div className="flex gap-3 border-t border-slate-200 bg-slate-50 p-6">

            <button
              type="button"
              onClick={
                onClose
              }
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-black text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white hover:bg-blue-800"
            >
              {category
                ? "حفظ التعديلات"
                : "إنشاء التصنيف"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =====================================
   DETAILS
===================================== */

function CategoryDetails({
  category,
  productCount,
  publishedProductCount,
  onClose,
  onEdit,
  onToggleActive,
  onToggleStore,
  onDelete,
  onImageUpload,
  onRemoveImage,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div className="flex min-w-0 items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-blue-700">

              {category.image ? (
                <img
                  src={
                    category.image
                  }
                  alt={
                    category.name
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <Tags
                  size={23}
                />
              )}

            </div>


            <div className="min-w-0">

              <p className="text-xs font-bold text-blue-600">
                ملف التصنيف
              </p>

              <h2 className="mt-1 truncate text-2xl font-black text-slate-900">
                {
                  category.name
                }
              </h2>

              <p className="mt-1 truncate text-xs text-slate-400">
                /
                {
                  category.slug
                }
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>


        <div className="overflow-y-auto p-6">

          {/* SUMMARY */}

          <div className="grid gap-3 sm:grid-cols-3">

            <DetailMetric
              icon={
                Package
              }
              label="إجمالي المنتجات"
              value={
                productCount
              }
            />


            <DetailMetric
              icon={
                Store
              }
              label="منشور في المتجر"
              value={
                publishedProductCount
              }
            />


            <DetailMetric
              icon={
                category.active
                  ? CheckCircle2
                  : Power
              }
              label="الحالة"
              value={
                category.active
                  ? "نشط"
                  : "معطل"
              }
            />

          </div>


          {/* IMAGE */}

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">

            <div className="flex items-center justify-between gap-3">

              <div>

                <h3 className="font-black text-slate-900">
                  صورة التصنيف
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  الصورة الحالية المرتبطة بالتصنيف.
                </p>

              </div>


              <label className="cursor-pointer rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-black text-blue-700 hover:bg-blue-100">

                تغيير الصورة

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={
                    onImageUpload
                  }
                />

              </label>

            </div>


            {category.image ? (
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200">

                <img
                  src={
                    category.image
                  }
                  alt={
                    category.name
                  }
                  className="h-64 w-full object-cover"
                />


                <button
                  type="button"
                  onClick={
                    onRemoveImage
                  }
                  className="absolute left-3 top-3 rounded-xl bg-red-500 px-3 py-2 text-xs font-black text-white shadow-lg hover:bg-red-600"
                >
                  إزالة الصورة
                </button>

              </div>
            ) : (
              <div className="mt-4 flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">

                <ImagePlus
                  size={32}
                  className="text-slate-300"
                />

                <p className="mt-3 text-sm font-bold text-slate-500">
                  لا توجد صورة
                </p>

              </div>
            )}

          </div>


          {/* DESCRIPTION */}

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">

            <p className="text-xs font-bold text-slate-400">
              الوصف
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {
                category.description ||
                "لا يوجد وصف لهذا التصنيف."
              }
            </p>

          </div>


          {/* STORE STATE */}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold text-slate-400">
                    حالة التصنيف
                  </p>

                  <p className="mt-1 font-black text-slate-800">
                    {category.active
                      ? "نشط"
                      : "معطل"}
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    onToggleActive
                  }
                  className={`rounded-xl px-4 py-2.5 text-xs font-black ${
                    category.active
                      ? "bg-slate-100 text-slate-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {category.active
                    ? "تعطيل"
                    : "تفعيل"}
                </button>

              </div>

            </div>


            <div className="rounded-2xl border border-slate-200 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold text-slate-400">
                    ظهور المتجر
                  </p>

                  <p className="mt-1 font-black text-slate-800">
                    {category.active &&
                    category.showOnStore
                      ? "ظاهر"
                      : "مخفي"}
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    onToggleStore
                  }
                  className={`rounded-xl px-4 py-2.5 text-xs font-black ${
                    category.showOnStore
                      ? "bg-slate-100 text-slate-600"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {category.showOnStore
                    ? "إخفاء"
                    : "إظهار"}
                </button>

              </div>

            </div>

          </div>


          {/* META */}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">

            <MetaBox
              label="الترتيب"
              value={
                category.order
              }
            />

            <MetaBox
              label="أنشئ في"
              value={
                formatDate(
                  category.createdAt
                )
              }
            />

            <MetaBox
              label="آخر تحديث"
              value={
                formatDate(
                  category.updatedAt
                )
              }
            />

            <MetaBox
              label="معرف التصنيف"
              value={
                category.id
              }
            />

          </div>

        </div>


        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row">

          <button
            type="button"
            onClick={
              onDelete
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-5 py-3 text-sm font-black text-red-500 hover:bg-red-50"
          >
            <Trash2 size={16} />
            حذف
          </button>


          <button
            type="button"
            onClick={
              onEdit
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-100"
          >
            <Pencil size={16} />
            تعديل
          </button>


          <button
            type="button"
            onClick={
              onClose
            }
            className="flex-1 rounded-xl bg-blue-700 py-3 text-sm font-black text-white hover:bg-blue-800"
          >
            إغلاق
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   DELETE MODAL
===================================== */

function DeleteModal({
  category,
  productCount,
  onClose,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <Trash2 size={21} />
        </div>


        <h2 className="mt-4 text-lg font-black text-slate-900">
          حذف التصنيف؟
        </h2>


        <p className="mt-2 text-sm leading-6 text-slate-500">
          هل تريد حذف التصنيف
          <strong className="mx-1 text-slate-800">
            {
              category.name
            }
          </strong>
          نهائيًا؟
        </p>


        {productCount > 0 ? (
          <div className="mt-3 rounded-xl bg-orange-50 p-3 text-xs leading-5 text-orange-700">

            <p className="font-black">
              لا يمكن حذف هذا التصنيف حاليًا.
            </p>

            <p className="mt-1">
              يوجد{" "}
              <strong>
                {
                  productCount
                }
              </strong>{" "}
              منتج مرتبط به.
              انقل المنتجات إلى تصنيف آخر أولًا.
            </p>

          </div>
        ) : (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-600">
            سيتم حذف التصنيف من إدارة الكتالوج.
            المنتجات الأخرى لن تتأثر لأنها غير مرتبطة به حاليًا.
          </p>
        )}


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
            disabled={
              productCount >
              0
            }
            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            حذف التصنيف
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   SUMMARY CARD
===================================== */

function SummaryCard({
  icon: Icon,
  title,
  value,
  accent = "blue",
}) {
  const styles = {
    blue:
      "bg-blue-50 text-blue-700",

    green:
      "bg-emerald-50 text-emerald-600",

    purple:
      "bg-violet-50 text-violet-600",

    orange:
      "bg-orange-50 text-orange-600",
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
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles[accent]}`}
      >
        <Icon size={21} />
      </div>

    </div>
  );
}


/* =====================================
   EMPTY
===================================== */

function EmptyState({
  hasFilters,
  onAdd,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
        <Tags size={32} />
      </div>


      <p className="mt-4 font-black text-slate-700">
        {hasFilters
          ? "لا توجد نتائج مطابقة"
          : "لا توجد تصنيفات حتى الآن"}
      </p>


      <p className="mt-1 text-sm text-slate-400">
        {hasFilters
          ? "جرّب تغيير البحث أو الفلاتر."
          : "أنشئ أول تصنيف لكتالوج OPTICANA."}
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
          إضافة أول تصنيف
        </button>
      )}

    </div>
  );
}


/* =====================================
   ACTION
===================================== */

function ActionButton({
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


/* =====================================
   DETAIL METRIC
===================================== */

function DetailMetric({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <div className="flex items-center justify-between">

        <p className="text-xs font-bold text-slate-400">
          {label}
        </p>


        <div className="rounded-lg bg-white p-2 text-blue-700 shadow-sm">
          <Icon size={15} />
        </div>

      </div>


      <p className="mt-2 text-lg font-black text-slate-900">
        {value}
      </p>

    </div>
  );
}


/* =====================================
   META
===================================== */

function MetaBox({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">

      <p className="text-[11px] font-bold text-slate-400">
        {label}
      </p>


      <p className="mt-1 break-words text-sm font-black text-slate-700">
        {value}
      </p>

    </div>
  );
}


/* =====================================
   TEXT FIELD
===================================== */

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
        onChange={(event) =>
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


/* =====================================
   NUMBER FIELD
===================================== */

function NumberField({
  label,
  value,
  onChange,
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
        onChange={(event) =>
          onChange(
            event.target
              .value
          )
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />

    </div>
  );
}


/* =====================================
   TEXT AREA
===================================== */

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
        onChange={(event) =>
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


/* =====================================
   TOGGLE
===================================== */

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
          {
            description
          }
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


/* =====================================
   DATE
===================================== */

function formatDate(
  date
) {
  if (!date) {
    return "—";
  }


  return new Date(
    date
  ).toLocaleString(
    "ar-EG",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  );
}


export default Categories;