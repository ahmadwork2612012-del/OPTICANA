import {
  Search,
  X,
  SlidersHorizontal,
  Loader2,
  Package,
  ArrowLeft,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getProducts,
} from "../../services/productService";

const ALL_FILTER =
  "الكل";


function SearchDrawer({
  isOpen,
  onClose,
  filters,
  setFilters,
}) {
  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  /* =====================================
     LOAD ADMIN PRODUCTS
  ===================================== */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(
          true
        );

        const data =
          await getProducts();

        if (!mounted) {
          return;
        }

        setProducts(
          Array.isArray(
            data
          )
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "SearchDrawer:",
          error
        );

        if (mounted) {
          setProducts(
            []
          );
        }
      } finally {
        if (mounted) {
          setLoading(
            false
          );
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [isOpen]);


  /* =====================================
     DYNAMIC FILTER OPTIONS
  ===================================== */

  const options =
    useMemo(() => {
      const getValues =
        (key) =>
          [
            ...new Set(
              products
                .map(
                  (product) =>
                    product?.[
                      key
                    ]
                )
                .filter(Boolean)
            ),
          ].sort(
            (
              a,
              b
            ) =>
              String(
                a
              ).localeCompare(
                String(
                  b
                ),
                "ar"
              )
          );

      return {
        categories:
          getValues(
            "category"
          ),

        colors:
          getValues(
            "color"
          ),

        materials:
          getValues(
            "material"
          ),

        sizes:
          getValues(
            "size"
          ),
      };
    }, [
      products,
    ]);


  /* =====================================
     SEARCH
  ===================================== */

  const results =
    useMemo(() => {
      const value =
        query
          .trim()
          .toLowerCase();

      let list =
        products;

      if (value) {
        list =
          list.filter(
            (product) => {
              const fields = [
                product.name,
                product.sku,
                product.category,
                product.description,
                product.color,
                product.material,
                product.size,
              ];

              return fields.some(
                (field) =>
                  String(
                    field || ""
                  )
                    .toLowerCase()
                    .includes(
                      value
                    )
              );
            }
          );
      }


      if (
        filters.category !==
        ALL_FILTER
      ) {
        list =
          list.filter(
            (product) =>
              product.category ===
              filters.category
          );
      }


      if (
        filters.color !==
        ALL_FILTER
      ) {
        list =
          list.filter(
            (product) =>
              product.color ===
              filters.color
          );
      }


      if (
        filters.material !==
        ALL_FILTER
      ) {
        list =
          list.filter(
            (product) =>
              product.material ===
              filters.material
          );
      }


      if (
        filters.size !==
        ALL_FILTER
      ) {
        list =
          list.filter(
            (product) =>
              product.size ===
              filters.size
          );
      }


      if (
        filters.minPrice
      ) {
        list =
          list.filter(
            (product) =>
              Number(
                product.price ||
                  0
              ) >=
              Number(
                filters.minPrice
              )
          );
      }


      if (
        filters.maxPrice
      ) {
        list =
          list.filter(
            (product) =>
              Number(
                product.price ||
                  0
              ) <=
              Number(
                filters.maxPrice
              )
          );
      }


      return list;
    }, [
      products,
      query,
      filters,
    ]);


  /* =====================================
     RESET
  ===================================== */

  const resetFilters =
    () => {
      setFilters({
        category:
          ALL_FILTER,

        color:
          ALL_FILTER,

        material:
          ALL_FILTER,

        size:
          ALL_FILTER,

        minPrice:
          "",

        maxPrice:
          "",
      });

      setQuery("");
    };


  /* =====================================
     CLOSE
  ===================================== */

  const handleClose =
    () => {
      setQuery("");

      onClose();
    };


  if (!isOpen) {
    return null;
  }


  return (
    <div
      className="fixed inset-0 z-[999]"
      onClick={
        handleClose
      }
    >

      {/* BACKDROP */}

      <div className="absolute inset-0 bg-[#20271f]/35 backdrop-blur-sm" />


      {/* DRAWER */}

      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        className="absolute left-0 right-0 top-0 max-h-[92vh] overflow-y-auto rounded-b-[2rem] border-b border-[#dfe6dc] bg-[#fbfcfa] shadow-2xl"
      >

        <div className="mx-auto max-w-7xl px-6 py-6 sm:py-8">


          {/* =================================
              HEADER
          ================================= */}

          <div className="flex items-start justify-between gap-5">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#eef2eb] px-3 py-1.5 text-xs font-black text-[#596655]">

                <Search
                  size={14}
                />

                البحث في OPTICANA

              </div>


              <h2 className="text-3xl font-black text-[#20251f] sm:text-4xl">
                ابحث عن منتجك
              </h2>


              <p className="mt-2 text-sm leading-7 text-[#7d8879]">
                البحث يعمل مباشرة على المنتجات المنشورة من لوحة الإدارة.
              </p>

            </div>


            <button
              type="button"
              onClick={
                handleClose
              }
              aria-label="إغلاق"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dfe6dc] bg-white text-[#697366] transition hover:bg-[#eef2eb]"
            >
              <X
                size={20}
              />
            </button>

          </div>


          {/* =================================
              SEARCH INPUT
          ================================= */}

          <div className="relative mt-7">

            <Search
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#899487]"
            />

            <input
              autoFocus
              value={
                query
              }
              onChange={(
                event
              ) =>
                setQuery(
                  event.target
                    .value
                )
              }
              placeholder="اكتب اسم المنتج أو SKU أو الفئة..."
              className="w-full rounded-2xl border border-[#dfe6dc] bg-white py-4 pl-12 pr-12 text-sm font-bold text-[#293126] outline-none transition focus:border-[#B4C4AD] focus:ring-4 focus:ring-[#eef2eb]"
            />


            {query && (
              <button
                type="button"
                onClick={() =>
                  setQuery("")
                }
                className="absolute left-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#899487] hover:bg-[#eef2eb]"
              >
                <X
                  size={15}
                />
              </button>
            )}

          </div>


          {/* =================================
              FILTERS
          ================================= */}

          {loading ? (
            <div className="flex min-h-40 items-center justify-center">

              <div className="flex items-center gap-3 text-[#667362]">

                <Loader2
                  size={22}
                  className="animate-spin"
                />

                <span className="text-sm font-bold">
                  جاري تحميل المنتجات...
                </span>

              </div>

            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

              <SelectField
                label="الفئة"
                value={
                  filters.category
                }
                options={
                  options.categories
                }
                onChange={(
                  value
                ) =>
                  setFilters({
                    ...filters,
                    category:
                      value,
                  })
                }
              />

              <SelectField
                label="اللون"
                value={
                  filters.color
                }
                options={
                  options.colors
                }
                onChange={(
                  value
                ) =>
                  setFilters({
                    ...filters,
                    color:
                      value,
                  })
                }
              />

              <SelectField
                label="الخامة"
                value={
                  filters.material
                }
                options={
                  options.materials
                }
                onChange={(
                  value
                ) =>
                  setFilters({
                    ...filters,
                    material:
                      value,
                  })
                }
              />

              <SelectField
                label="المقاس"
                value={
                  filters.size
                }
                options={
                  options.sizes
                }
                onChange={(
                  value
                ) =>
                  setFilters({
                    ...filters,
                    size:
                      value,
                  })
                }
              />

            </div>
          )}


          {/* =================================
              PRICE
          ================================= */}

          <div className="mt-4 grid gap-4 md:grid-cols-2">

            <PriceInput
              label="السعر من"
              value={
                filters.minPrice
              }
              onChange={(
                value
              ) =>
                setFilters({
                  ...filters,
                  minPrice:
                    value,
                })
              }
            />

            <PriceInput
              label="السعر إلى"
              value={
                filters.maxPrice
              }
              onChange={(
                value
              ) =>
                setFilters({
                  ...filters,
                  maxPrice:
                    value,
                })
              }
            />

          </div>


          {/* =================================
              RESULTS
          ================================= */}

          {query.trim() ? (
            <div className="mt-8">

              <div className="flex items-center justify-between gap-4">

                <p className="text-sm font-black text-[#4d5b4a]">
                  النتائج:
                  <span className="mr-2 text-xl text-[#2f382c]">
                    {
                      results.length
                    }
                  </span>
                </p>

              </div>


              {results.length >
              0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  {results
                    .slice(
                      0,
                      12
                    )
                    .map(
                      (
                        product
                      ) => (
                        <Link
                          key={
                            product.id
                          }
                          to={`/product/${product.id}`}
                          onClick={
                            handleClose
                          }
                          className="group flex items-center gap-3 rounded-2xl border border-[#dfe6dc] bg-white p-3 transition hover:border-[#B4C4AD] hover:bg-[#f5f7f3]"
                        >

                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#eef2eb]">

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
                              <div className="flex h-full items-center justify-center text-[#7d8b79]">
                                <Package
                                  size={
                                    22
                                  }
                                />
                              </div>
                            )}

                          </div>


                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-black text-[#273025]">
                              {
                                product.name
                              }
                            </p>

                            <p className="mt-1 truncate text-[11px] font-bold text-[#909a8d]">
                              {
                                product.category ||
                                "منتج"
                              }

                              {product.sku &&
                                ` • ${product.sku}`}
                            </p>

                            <p className="mt-1 text-xs font-black text-[#53604f]">
                              {Number(
                                product.price ||
                                  0
                              ).toLocaleString()}{" "}
                              ج.م
                            </p>

                          </div>


                          <ArrowLeft
                            size={
                              17
                            }
                            className="shrink-0 text-[#8c978a] transition group-hover:-translate-x-1 group-hover:text-[#53604f]"
                          />

                        </Link>
                      )
                    )}

                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-[#ccd8c8] bg-white px-6 py-12 text-center">

                  <Search
                    size={30}
                    className="mx-auto text-[#b0bab0]"
                  />

                  <p className="mt-3 text-sm font-black text-[#596655]">
                    لا توجد نتائج
                  </p>

                  <p className="mt-1 text-xs text-[#919b90]">
                    جرّب اسمًا أو رقمًا أو فئة مختلفة.
                  </p>

                </div>
              )}

            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-[#d5ded2] bg-[#f7f9f5] px-6 py-10 text-center">

              <SlidersHorizontal
                size={28}
                className="mx-auto text-[#99a596]"
              />

              <p className="mt-3 text-sm font-black text-[#586654]">
                ابدأ بالبحث أو استخدم الفلاتر
              </p>

              <p className="mt-1 text-xs text-[#919a90]">
                جميع الخيارات مأخوذة من منتجات Admin.
              </p>

            </div>
          )}


          {/* =================================
              ACTIONS
          ================================= */}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#e4e8e1] pt-6 sm:flex-row">

            <button
              type="button"
              onClick={
                resetFilters
              }
              className="flex-1 rounded-xl border border-[#d8dfd5] bg-white py-3.5 text-sm font-black text-[#626d60] transition hover:bg-[#f5f7f3]"
            >
              إعادة تعيين
            </button>


            <Link
              to="/products"
              onClick={
                handleClose
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2f382c] py-3.5 text-sm font-black text-white transition hover:bg-[#3c4838]"
            >
              عرض المنتجات

              <ArrowLeft
                size={
                  17
                }
              />
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   SELECT
===================================== */

function SelectField({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-black text-[#4c5849]">
        {label}
      </label>

      <select
        value={
          value ||
          ALL_FILTER
        }
        onChange={(event) =>
          onChange(
            event.target
              .value
          )
        }
        className="w-full rounded-xl border border-[#dfe6dc] bg-white px-4 py-3 text-sm font-bold text-[#596655] outline-none transition focus:border-[#B4C4AD] focus:ring-4 focus:ring-[#eef2eb]"
      >

        <option value={ALL_FILTER}>
          الكل
        </option>

        {options.map(
          (option) => (
            <option
              key={
                option
              }
              value={
                option
              }
            >
              {
                option
              }
            </option>
          )
        )}

      </select>

    </div>
  );
}


/* =====================================
   PRICE
===================================== */

function PriceInput({
  label,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-black text-[#4c5849]">
        {label}
      </label>

      <div className="relative">

        <input
          type="number"
          min="0"
          value={
            value || ""
          }
          onChange={(event) =>
            onChange(
              event.target
                .value
            )
          }
          placeholder="0"
          className="w-full rounded-xl border border-[#dfe6dc] bg-white px-4 py-3 text-sm font-bold text-[#293126] outline-none transition focus:border-[#B4C4AD] focus:ring-4 focus:ring-[#eef2eb]"
        />

        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8b9588]">
          ج.م
        </span>

      </div>

    </div>
  );
}


export default SearchDrawer;