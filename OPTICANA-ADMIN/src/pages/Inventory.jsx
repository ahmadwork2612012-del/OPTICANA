import {
  Search,
  Warehouse,
  AlertTriangle,
  PackageX,
  Plus,
  Minus,
  History,
  X,
  Eye,
  ShoppingCart,
  ShoppingBag,
  Wrench,
  Settings2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  TrendingUp,
  CircleAlert,
  CalendarDays,
  ChevronDown,
  Boxes,
  Activity,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import useProductStore from "../store/productStore";
import useInventoryStore from "../store/inventoryStore";


/* =====================================
   MOVEMENT FILTERS
===================================== */

const MOVEMENT_FILTERS = {
  all: {
    label: "كل الحركات",
  },

  sale: {
    label: "مبيعات",
  },

  purchase: {
    label: "مشتريات",
  },

  repair: {
    label: "صيانة",
  },

  stock_in: {
    label: "إضافة يدوية",
  },

  stock_out: {
    label: "خصم يدوي",
  },
};


/* =====================================
   PAGE
===================================== */

function Inventory() {
  /* =====================================
     PRODUCT STORE
  ===================================== */

  const products =
    useProductStore(
      (state) =>
        state.products
    );

  const productsLoading =
    useProductStore(
      (state) =>
        state.loading
    );

  const fetchProducts =
    useProductStore(
      (state) =>
        state.fetchProducts
    );

  const getProductById =
    useProductStore(
      (state) =>
        state.getProductById
    );


  /* =====================================
     INVENTORY STORE
  ===================================== */

  const movements =
    useInventoryStore(
      (state) =>
        state.movements
    );

  const inventoryLoading =
    useInventoryStore(
      (state) =>
        state.isLoading
    );

  const fetchMovements =
    useInventoryStore(
      (state) =>
        state.fetchMovements
    );

  const fetchProductMovements =
    useInventoryStore(
      (state) =>
        state.fetchProductMovements
    );

  const adjustInventory =
    useInventoryStore(
      (state) =>
        state.adjustStock
    );


  /* =====================================
     UI STATE
  ===================================== */

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [
    movementSearch,
    setMovementSearch,
  ] = useState("");

  const [
    movementFilter,
    setMovementFilter,
  ] = useState("all");

  const [
    selectedAdjustmentProduct,
    setSelectedAdjustmentProduct,
  ] = useState(null);

  const [
    selectedProductMovements,
    setSelectedProductMovements,
  ] = useState(null);

  const [
    selectedMovement,
    setSelectedMovement,
  ] = useState(null);

  const [
    showAllMovements,
    setShowAllMovements,
  ] = useState(false);

  const [
    adjustmentType,
    setAdjustmentType,
  ] = useState("add");

  const [
    quantity,
    setQuantity,
  ] = useState("");

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    isSubmittingAdjustment,
    setIsSubmittingAdjustment,
  ] = useState(false);


  /* =====================================
     INITIAL LOAD
  ===================================== */

  useEffect(() => {
    const loadInventory =
      async () => {
        try {
          await Promise.all([
            fetchProducts(),
            fetchMovements(),
          ]);
        } catch (
          error
        ) {
          toast.error(
            error?.message ||
              "تعذر تحميل بيانات المخزون"
          );
        }
      };

    loadInventory();
  }, [
    fetchProducts,
    fetchMovements,
  ]);


  /* =====================================
     PRODUCT SUMMARY
  ===================================== */

  const totalUnits =
    useMemo(() => {
      return products.reduce(
        (
          total,
          product
        ) =>
          total +
          Number(
            product.stock ||
              0
          ),
        0
      );
    }, [products]);


  const inventoryValue =
    useMemo(() => {
      return products.reduce(
        (
          total,
          product
        ) =>
          total +
          Number(
            product.purchasePrice ||
              0
          ) *
            Number(
              product.stock ||
                0
            ),
        0
      );
    }, [products]);


  const potentialRetailValue =
    useMemo(() => {
      return products.reduce(
        (
          total,
          product
        ) =>
          total +
          Number(
            product.sellingPrice ||
              product.price ||
              0
          ) *
            Number(
              product.stock ||
                0
            ),
        0
      );
    }, [products]);


  const potentialGrossProfit =
    potentialRetailValue -
    inventoryValue;


  const lowStockProducts =
    useMemo(() => {
      return products.filter(
        (product) =>
          Number(
            product.stock ||
              0
          ) > 0 &&
          Number(
            product.stock ||
              0
          ) <=
            Number(
              product.reorderLevel ||
                0
            )
      );
    }, [products]);


  const outOfStockProducts =
    useMemo(() => {
      return products.filter(
        (product) =>
          Number(
            product.stock ||
              0
          ) === 0
      );
    }, [products]);


  /* =====================================
     PRODUCT FILTER
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

          const matchesFilter =
            filter ===
            "all"
              ? true
              : filter ===
                  "low"
                ? Number(
                    product.stock ||
                      0
                  ) >
                    0 &&
                  Number(
                    product.stock ||
                      0
                  ) <=
                    Number(
                      product.reorderLevel ||
                        0
                    )
                : filter ===
                    "out"
                  ? Number(
                      product.stock ||
                        0
                    ) ===
                    0
                  : true;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      products,
      search,
      filter,
    ]);


  /* =====================================
     MOVEMENT FILTER
  ===================================== */

  const filteredAllMovements =
    useMemo(() => {
      const value =
        movementSearch
          .trim()
          .toLowerCase();

      return [
        ...movements,
      ]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt ||
                0
            ) -
            new Date(
              a.createdAt ||
                0
            )
        )
        .filter(
          (movement) => {
            const matchesSearch =
              !value ||
              movement.productName
                ?.toLowerCase()
                .includes(
                  value
                ) ||
              movement.reference
                ?.toLowerCase()
                .includes(
                  value
                ) ||
              movement.productId
                ?.toString()
                .toLowerCase()
                .includes(
                  value
                );

            const matchesType =
              movementFilter ===
                "all" ||
              movement.type ===
                movementFilter;

            return (
              matchesSearch &&
              matchesType
            );
          }
        );
    }, [
      movements,
      movementSearch,
      movementFilter,
    ]);


  /* =====================================
     LAST 24 HOURS
  ===================================== */

  const recentMovements =
    useMemo(() => {
      const now =
        Date.now();

      const twentyFourHoursAgo =
        now -
        24 *
          60 *
          60 *
          1000;

      return [
        ...movements,
      ]
        .filter(
          (movement) => {
            const time =
              new Date(
                movement.createdAt ||
                  0
              ).getTime();

            return (
              time >=
              twentyFourHoursAgo
            );
          }
        )
        .sort(
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
    }, [movements]);


  /* =====================================
     GROUP ALL MOVEMENTS
  ===================================== */

  const groupedMovements =
    useMemo(() => {
      const groups =
        {};

      filteredAllMovements.forEach(
        (movement) => {
          const date =
            movement.createdAt
              ? getDateKey(
                  movement.createdAt
                )
              : "unknown";

          if (
            !groups[date]
          ) {
            groups[date] =
              [];
          }

          groups[
            date
          ].push(
            movement
          );
        }
      );

      return Object.entries(
        groups
      ).sort(
        (
          [dateA],
          [dateB]
        ) => {
          if (
            dateA ===
            "unknown"
          ) {
            return 1;
          }

          if (
            dateB ===
            "unknown"
          ) {
            return -1;
          }

          return (
            new Date(
              `${dateB}T00:00:00`
            ) -
            new Date(
              `${dateA}T00:00:00`
            )
          );
        }
      );
    }, [
      filteredAllMovements,
    ]);


  /* =====================================
     MOVEMENT SUMMARY
  ===================================== */

  const totalMovementIn =
    movements
      .filter(
        (movement) =>
          Number(
            movement.quantity ||
              0
          ) > 0
      )
      .reduce(
        (
          sum,
          movement
        ) =>
          sum +
          Number(
            movement.quantity ||
              0
          ),
        0
      );


  const totalMovementOut =
    Math.abs(
      movements
        .filter(
          (movement) =>
            Number(
              movement.quantity ||
                0
            ) < 0
        )
        .reduce(
          (
            sum,
            movement
          ) =>
            sum +
            Number(
              movement.quantity ||
                0
            ),
          0
        )
    );


  const recentMovementIn =
    recentMovements
      .filter(
        (movement) =>
          Number(
            movement.quantity ||
              0
          ) > 0
      )
      .reduce(
        (
          sum,
          movement
        ) =>
          sum +
          Number(
            movement.quantity ||
              0
          ),
        0
      );


  const recentMovementOut =
    Math.abs(
      recentMovements
        .filter(
          (movement) =>
            Number(
              movement.quantity ||
                0
            ) < 0
        )
        .reduce(
          (
            sum,
            movement
          ) =>
            sum +
            Number(
              movement.quantity ||
                0
            ),
          0
        )
    );


  /* =====================================
     ADJUSTMENT
  ===================================== */

  const openAdjustment = (
    product,
    type
  ) => {
    setSelectedAdjustmentProduct(
      product
    );

    setAdjustmentType(
      type
    );

    setQuantity(
      ""
    );

    setReason(
      ""
    );
  };


  const closeAdjustment =
    () => {
      if (
        isSubmittingAdjustment
      ) {
        return;
      }

      setSelectedAdjustmentProduct(
        null
      );

      setQuantity(
        ""
      );

      setReason(
        ""
      );
    };


  const submitAdjustment =
    async () => {
      const amount =
        Number(
          quantity
        );


      if (
        !selectedAdjustmentProduct
      ) {
        return;
      }


      if (
        !Number.isInteger(
          amount
        ) ||
        amount <=
          0
      ) {
        toast.error(
          "أدخل كمية صحيحة"
        );

        return;
      }


      const currentStock =
        Number(
          selectedAdjustmentProduct.stock ||
            0
        );


      if (
        adjustmentType ===
          "remove" &&
        amount >
          currentStock
      ) {
        toast.error(
          "الكمية أكبر من المخزون الحالي"
        );

        return;
      }


      const change =
        adjustmentType ===
        "add"
          ? amount
          : -amount;


      try {
        setIsSubmittingAdjustment(
          true
        );


        await adjustInventory(
          selectedAdjustmentProduct.id,
          change,
          reason.trim() ||
            "تعديل يدوي"
        );


        await Promise.all([
          getProductById(
            selectedAdjustmentProduct.id
          ),
          fetchProductMovements(
            selectedAdjustmentProduct.id
          ),
        ]);


        toast.success(
          adjustmentType ===
            "add"
            ? "تمت إضافة الكمية للمخزون"
            : "تم خصم الكمية من المخزون"
        );


        setSelectedAdjustmentProduct(
          null
        );

        setQuantity(
          ""
        );

        setReason(
          ""
        );

      } catch (
        error
      ) {
        toast.error(
          error?.message ||
            "تعذر تعديل المخزون"
        );
      } finally {
        setIsSubmittingAdjustment(
          false
        );
      }
    };


  /* =====================================
     PRODUCT MOVEMENTS
  ===================================== */

  const getProductMovements =
    (
      productId
    ) => {
      return movements
        .filter(
          (movement) =>
            String(
              movement.productId
            ) ===
            String(
              productId
            )
        )
        .sort(
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
    };


  /* =====================================
     PRODUCT MOVEMENT OPEN
  ===================================== */

  const openProductMovements =
    async (
      product
    ) => {
      try {
        const loaded =
          await fetchProductMovements(
            product.id
          );

        setSelectedProductMovements(
          {
            ...product,
            movements:
              loaded,
          }
        );
      } catch (
        error
      ) {
        toast.error(
          error?.message ||
            "تعذر تحميل حركات المنتج"
        );

        setSelectedProductMovements(
          product
        );
      }
    };


  return (
    <div className="space-y-6">

      {/* =================================
          HEADER
      ================================= */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">

            <Warehouse
              size={
                15
              }
            />

            إدارة المخزون

          </div>


          <h1 className="text-3xl font-black text-slate-900">
            المخزون
          </h1>


          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            متابعة الكميات وقيمة المخزون وجميع الحركات المؤثرة
            على المنتجات من مكان واحد.
          </p>

        </div>


        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">

          <Warehouse
            size={
              18
            }
          />

          مخزون OPTICANA

        </div>

      </div>


      {/* =================================
          SUMMARY
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <SummaryCard
          icon={
            Boxes
          }
          title="المنتجات"
          value={
            products.length
          }
          accent="blue"
        />


        <SummaryCard
          icon={
            Warehouse
          }
          title="إجمالي القطع"
          value={`${totalUnits} قطعة`}
          accent="blue"
        />


        <SummaryCard
          icon={
            Package
          }
          title="قيمة المخزون"
          value={`${inventoryValue.toLocaleString()} ج.م`}
          description="بسعر الشراء"
          accent="purple"
        />


        <SummaryCard
          icon={
            TrendingUp
          }
          title="قيمة البيع المحتملة"
          value={`${potentialRetailValue.toLocaleString()} ج.م`}
          description={`ربح إجمالي محتمل ${potentialGrossProfit.toLocaleString()} ج.م`}
          accent="green"
        />


        <SummaryCard
          icon={
            AlertTriangle
          }
          title="يحتاج انتباه"
          value={
            lowStockProducts.length +
            outOfStockProducts.length
          }
          description={`${lowStockProducts.length} منخفض • ${outOfStockProducts.length} نافد`}
          accent="orange"
        />

      </div>


      {/* =================================
          MOVEMENT KPIS
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <MiniMetric
          icon={
            ArrowDownToLine
          }
          label="الكميات الداخلة"
          value={`${totalMovementIn} قطعة`}
          tone="green"
        />


        <MiniMetric
          icon={
            ArrowUpFromLine
          }
          label="الكميات الخارجة"
          value={`${totalMovementOut} قطعة`}
          tone="red"
        />


        <MiniMetric
          icon={
            Activity
          }
          label="حركات آخر 24 ساعة"
          value={
            recentMovements.length
          }
          tone="blue"
        />


        <MiniMetric
          icon={
            History
          }
          label="حركة 24 ساعة"
          value={`${recentMovementIn} داخل • ${recentMovementOut} خارج`}
          tone="blue"
        />

      </div>


      {/* =================================
          PRODUCTS TABLE
      ================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 xl:flex-row">

          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

            <Search
              size={
                18
              }
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
                  setSearch("")
                }
                className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700"
              >
                <X
                  size={
                    15
                  }
                />
              </button>
            )}

          </div>


          <div className="flex flex-wrap gap-2">

            <FilterButton
              active={
                filter ===
                "all"
              }
              onClick={() =>
                setFilter(
                  "all"
                )
              }
            >
              الكل
            </FilterButton>


            <FilterButton
              active={
                filter ===
                "low"
              }
              onClick={() =>
                setFilter(
                  "low"
                )
              }
            >
              منخفض
            </FilterButton>


            <FilterButton
              active={
                filter ===
                "out"
              }
              onClick={() =>
                setFilter(
                  "out"
                )
              }
            >
              نافد
            </FilterButton>

          </div>

        </div>


        {productsLoading &&
        products.length ===
          0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center">

            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

            <p className="mt-4 text-sm font-bold text-slate-500">
              جاري تحميل المنتجات...
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1150px] text-right">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-400">

                  <th className="px-6 py-4">
                    المنتج
                  </th>

                  <th className="px-6 py-4">
                    SKU
                  </th>

                  <th className="px-6 py-4">
                    المخزون
                  </th>

                  <th className="px-6 py-4">
                    حد إعادة الطلب
                  </th>

                  <th className="px-6 py-4">
                    قيمة المخزون
                  </th>

                  <th className="px-6 py-4">
                    الحالة
                  </th>

                  <th className="px-6 py-4">
                    الإجراءات
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {filteredProducts.map(
                  (
                    product
                  ) => {
                    const stock =
                      Number(
                        product.stock ||
                          0
                      );

                    const reorder =
                      Number(
                        product.reorderLevel ||
                          0
                      );

                    const isOut =
                      stock ===
                      0;

                    const isLow =
                      !isOut &&
                      stock <=
                        reorder;

                    const stockValue =
                      Number(
                        product.purchasePrice ||
                          0
                      ) *
                      stock;


                    return (
                      <tr
                        key={
                          product.id
                        }
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-400">

                              {product.image ? (
                                <img
                                  src={
                                    product.image
                                  }
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package
                                  size={
                                    18
                                  }
                                />
                              )}

                            </div>


                            <div>

                              <p className="font-black text-slate-800">
                                {
                                  product.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {
                                  product.category ||
                                  "بدون تصنيف"
                                }
                              </p>

                            </div>

                          </div>

                        </td>


                        <td className="px-6 py-5 text-sm font-semibold text-slate-500">
                          {
                            product.sku ||
                            "—"
                          }
                        </td>


                        <td className="px-6 py-5">

                          <span className="text-lg font-black text-slate-900">
                            {
                              stock
                            }
                          </span>

                          <span className="mr-1 text-xs text-slate-400">
                            قطعة
                          </span>

                        </td>


                        <td className="px-6 py-5 text-sm font-semibold text-slate-500">
                          {
                            reorder
                          }
                        </td>


                        <td className="px-6 py-5">

                          <div>

                            <p className="font-black text-slate-800">
                              {
                                stockValue.toLocaleString()
                              }{" "}
                              ج.م
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                              بسعر الشراء
                            </p>

                          </div>

                        </td>


                        <td className="px-6 py-5">

                          <StockStatus
                            isOut={
                              isOut
                            }
                            isLow={
                              isLow
                            }
                          />

                        </td>


                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openAdjustment(
                                  product,
                                  "add"
                                )
                              }
                              className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100"
                            >
                              <Plus
                                size={
                                  15
                                }
                              />

                              إضافة
                            </button>


                            <button
                              type="button"
                              disabled={
                                stock ===
                                0
                              }
                              onClick={() =>
                                openAdjustment(
                                  product,
                                  "remove"
                                )
                              }
                              className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus
                                size={
                                  15
                                }
                              />

                              خصم
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                openProductMovements(
                                  product
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
                              title="حركات المنتج"
                            >
                              <Eye
                                size={
                                  17
                                }
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>


            {filteredProducts.length ===
              0 && (
              <div className="flex min-h-60 flex-col items-center justify-center text-center">

                <PackageX
                  size={
                    42
                  }
                  className="text-slate-300"
                />

                <p className="mt-4 font-bold text-slate-700">
                  لا توجد منتجات
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  جرّب تغيير البحث أو الفلتر.
                </p>

              </div>
            )}

          </div>
        )}

      </div>


      {/* =================================
          RECENT MOVEMENTS
      ================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 p-5">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-blue-50 p-2 text-blue-700">

                <History
                  size={
                    19
                  }
                />

              </div>


              <div>

                <h2 className="font-black text-slate-900">
                  آخر حركات المخزون
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  الحركات المسجلة خلال آخر 24 ساعة.
                </p>

              </div>

            </div>


            <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-black text-slate-500">

              <CalendarDays
                size={
                  13
                }
              />

              آخر 24 ساعة

            </span>

          </div>

        </div>


        {inventoryLoading &&
        movements.length ===
          0 ? (
          <div className="p-12 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

            <p className="mt-4 text-sm font-bold text-slate-500">
              جاري تحميل الحركات...
            </p>

          </div>
        ) : recentMovements.length ===
          0 ? (
          <div className="p-12 text-center">

            <History
              size={
                38
              }
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-bold text-slate-600">
              لا توجد حركات خلال آخر 24 ساعة
            </p>

            <p className="mt-1 text-xs text-slate-400">
              ستظهر المبيعات والمشتريات والصيانة والتعديلات هنا.
            </p>

          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {recentMovements.map(
              (
                movement
              ) => (
                <MovementRow
                  key={
                    movement.id
                  }
                  movement={
                    movement
                  }
                  onOpen={() =>
                    setSelectedMovement(
                      movement
                    )
                  }
                />
              )
            )}

          </div>
        )}


        <div className="border-t border-slate-100 bg-slate-50 p-4">

          <button
            type="button"
            onClick={() =>
              setShowAllMovements(
                true
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50"
          >
            عرض كل الحركات

            <ChevronDown
              size={
                16
              }
            />

          </button>

        </div>

      </div>


      {/* =================================
          ADJUSTMENT MODAL
      ================================= */}

      {selectedAdjustmentProduct && (
        <AdjustmentModal
          product={
            selectedAdjustmentProduct
          }
          adjustmentType={
            adjustmentType
          }
          quantity={
            quantity
          }
          reason={
            reason
          }
          setQuantity={
            setQuantity
          }
          setReason={
            setReason
          }
          isSubmitting={
            isSubmittingAdjustment
          }
          onClose={
            closeAdjustment
          }
          onSubmit={
            submitAdjustment
          }
          productMovements={getProductMovements(
            selectedAdjustmentProduct.id
          )}
        />
      )}


      {/* =================================
          PRODUCT MOVEMENTS MODAL
      ================================= */}

      {selectedProductMovements && (
        <ProductMovementsModal
          product={
            selectedProductMovements
          }
          movements={
            selectedProductMovements.movements ||
            getProductMovements(
              selectedProductMovements.id
            )
          }
          onClose={() =>
            setSelectedProductMovements(
              null
            )
          }
          onOpenMovement={(
            movement
          ) => {
            setSelectedProductMovements(
              null
            );

            setSelectedMovement(
              movement
            );
          }}
        />
      )}


      {/* =================================
          MOVEMENT DETAILS
      ================================= */}

      {selectedMovement && (
        <MovementDetails
          movement={
            selectedMovement
          }
          onClose={() =>
            setSelectedMovement(
              null
            )
          }
        />
      )}


      {/* =================================
          ALL MOVEMENTS
      ================================= */}

      {showAllMovements && (
        <AllMovementsModal
          groups={
            groupedMovements
          }
          search={
            movementSearch
          }
          setSearch={
            setMovementSearch
          }
          filter={
            movementFilter
          }
          setFilter={
            setMovementFilter
          }
          onClose={() =>
            setShowAllMovements(
              false
            )
          }
          onOpenMovement={
            (movement) => {
              setShowAllMovements(
                false
              );

              setSelectedMovement(
                movement
              );
            }
          }
        />
      )}

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
  description,
  accent = "blue",
}) {
  const colors = {
    blue:
      "bg-blue-50 text-blue-700",

    purple:
      "bg-violet-50 text-violet-600",

    green:
      "bg-emerald-50 text-emerald-600",

    orange:
      "bg-orange-50 text-orange-600",
  };


  return (
    <div className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div>

        <p className="text-sm font-semibold text-slate-500">
          {
            title
          }
        </p>

        <p className="mt-2 text-2xl font-black text-slate-900">
          {
            value
          }
        </p>


        {description && (
          <p className="mt-1 text-[11px] text-slate-400">
            {
              description
            }
          </p>
        )}

      </div>


      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors[accent]}`}
      >
        <Icon
          size={
            21
          }
        />
      </div>

    </div>
  );
}


/* =====================================
   MINI METRIC
===================================== */

function MiniMetric({
  icon: Icon,
  label,
  value,
  tone = "blue",
}) {
  const colors = {
    blue:
      "bg-blue-50 text-blue-700",

    green:
      "bg-emerald-50 text-emerald-600",

    red:
      "bg-red-50 text-red-600",
  };


  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <div>

        <p className="text-xs font-bold text-slate-400">
          {
            label
          }
        </p>

        <p className="mt-1 text-lg font-black text-slate-900">
          {
            value
          }
        </p>

      </div>


      <div
        className={`rounded-xl p-2.5 ${colors[tone]}`}
      >
        <Icon
          size={
            18
          }
        />
      </div>

    </div>
  );
}


/* =====================================
   FILTER BUTTON
===================================== */

function FilterButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
        active
          ? "bg-blue-700 text-white"
          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
      }`}
    >
      {
        children
      }
    </button>
  );
}


/* =====================================
   STOCK STATUS
===================================== */

function StockStatus({
  isOut,
  isLow,
}) {
  if (isOut) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-black text-red-600">

        <CircleAlert
          size={
            13
          }
        />

        نافد المخزون

      </span>
    );
  }


  if (isLow) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-600">

        <AlertTriangle
          size={
            13
          }
        />

        منخفض

      </span>
    );
  }


  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600">

      <Package
        size={
          13
        }
      />

      جيد

    </span>
  );
}


/* =====================================
   MOVEMENT ROW
===================================== */

function MovementRow({
  movement,
  onOpen,
}) {
  const isAddition =
    Number(
      movement.quantity ||
        0
    ) > 0;


  const config =
    getMovementConfig(
      movement.type
    );


  const Icon =
    config.icon;


  return (
    <button
      type="button"
      onClick={() =>
        onOpen(
          movement
        )
      }
      className="flex w-full items-center justify-between gap-4 p-5 text-right transition hover:bg-slate-50"
    >

      <div className="flex min-w-0 items-center gap-3">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}
        >
          <Icon
            size={
              18
            }
          />
        </div>


        <div className="min-w-0">

          <p className="truncate text-sm font-bold text-slate-800">
            {
              movement.productName ||
              "منتج غير معروف"
            }
          </p>


          <div className="mt-1 flex flex-wrap items-center gap-2">

            <span
              className={`rounded-md px-2 py-1 text-[10px] font-black ${config.badgeClass}`}
            >
              {
                config.label
              }
            </span>


            {movement.reference && (
              <span className="truncate text-[11px] text-slate-400">
                {
                  movement.reference
                }
              </span>
            )}

          </div>

        </div>

      </div>


      <div className="flex shrink-0 items-center gap-4">

        <div className="text-left">

          <p
            className={`font-black ${
              isAddition
                ? "text-emerald-600"
                : "text-red-500"
            }`}
          >
            {isAddition
              ? "+"
              : ""}

            {
              movement.quantity
            }
          </p>


          <p className="mt-1 text-[11px] text-slate-400">
            {
              formatTime(
                movement.createdAt
              )
            }
          </p>

        </div>


        <Eye
          size={
            16
          }
          className="text-slate-300"
        />

      </div>

    </button>
  );
}


/* =====================================
   PRODUCT MOVEMENTS
===================================== */

function ProductMovementsModal({
  product,
  movements,
  onClose,
  onOpenMovement,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div>

            <p className="text-xs font-bold text-blue-600">
              سجل المنتج
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-900">
              {
                product.name
              }
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              المخزون الحالي:{" "}
              {
                product.stock
              }{" "}
              قطعة
            </p>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X
              size={
                19
              }
            />
          </button>

        </div>


        <div className="overflow-y-auto">

          {movements.length ===
          0 ? (
            <div className="p-12 text-center">

              <History
                size={
                  36
                }
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-bold text-slate-600">
                لا توجد حركات لهذا المنتج
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {movements.map(
                (
                  movement
                ) => (
                  <MovementRow
                    key={
                      movement.id
                    }
                    movement={
                      movement
                    }
                    onOpen={
                      onOpenMovement
                    }
                  />
                )
              )}

            </div>
          )}

        </div>


        <div className="border-t border-slate-200 bg-slate-50 p-5">

          <button
            type="button"
            onClick={
              onClose
            }
            className="w-full rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white hover:bg-blue-800"
          >
            إغلاق
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   ALL MOVEMENTS
===================================== */

function AllMovementsModal({
  groups,
  search,
  setSearch,
  filter,
  setFilter,
  onClose,
  onOpenMovement,
}) {
  const totalVisible =
    groups.reduce(
      (
        sum,
        [, items]
      ) =>
        sum +
        items.length,
      0
    );


  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        <div className="border-b border-slate-200 p-6">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-xs font-bold text-blue-600">
                سجل المخزون الكامل
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                كل حركات المخزون
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {
                  totalVisible
                }{" "}
                حركة مطابقة للفلاتر.
              </p>

            </div>


            <button
              type="button"
              onClick={
                onClose
              }
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
            >
              <X
                size={
                  20
                }
              />
            </button>

          </div>


          <div className="mt-5 flex flex-col gap-3 lg:flex-row">

            <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

              <Search
                size={
                  17
                }
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
                placeholder="ابحث باسم المنتج أو المرجع أو المعرف..."
                className="w-full bg-transparent text-sm outline-none"
              />


              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch(
                      ""
                    )
                  }
                  className="rounded-lg p-1 text-slate-400 hover:bg-white"
                >
                  <X
                    size={
                      14
                    }
                  />
                </button>
              )}

            </div>


            <select
              value={
                filter
              }
              onChange={(
                event
              ) =>
                setFilter(
                  event.target
                    .value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:border-blue-500 lg:w-52"
            >

              {Object.entries(
                MOVEMENT_FILTERS
              ).map(
                ([
                  key,
                  value,
                ]) => (
                  <option
                    key={
                      key
                    }
                    value={
                      key
                    }
                  >
                    {
                      value.label
                    }
                  </option>
                )
              )}

            </select>

          </div>

        </div>


        <div className="overflow-y-auto">

          {groups.length ===
          0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">

              <History
                size={
                  42
                }
                className="text-slate-300"
              />

              <p className="mt-4 font-bold text-slate-700">
                لا توجد حركات مطابقة
              </p>

              <p className="mt-1 text-sm text-slate-400">
                جرّب تغيير البحث أو نوع الحركة.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {groups.map(
                ([
                  date,
                  items,
                ]) => (

                  <section
                    key={
                      date
                    }
                  >

                    <div className="sticky top-0 z-10 border-y border-slate-100 bg-slate-50/95 px-6 py-3 backdrop-blur">

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2">

                          <CalendarDays
                            size={
                              15
                            }
                            className="text-blue-700"
                          />

                          <p className="text-sm font-black text-slate-800">
                            {
                              formatGroupDate(
                                date
                              )
                            }
                          </p>

                        </div>


                        <span className="rounded-md bg-white px-2 py-1 text-[10px] font-black text-slate-400">
                          {
                            items.length
                          }{" "}
                          حركة
                        </span>

                      </div>

                    </div>


                    <div className="divide-y divide-slate-100">

                      {items.map(
                        (
                          movement
                        ) => (
                          <MovementRow
                            key={
                              movement.id
                            }
                            movement={
                              movement
                            }
                            onOpen={
                              onOpenMovement
                            }
                          />
                        )
                      )}

                    </div>

                  </section>
                )
              )}

            </div>
          )}

        </div>


        <div className="border-t border-slate-200 bg-slate-50 p-5">

          <button
            type="button"
            onClick={
              onClose
            }
            className="w-full rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white hover:bg-blue-800"
          >
            إغلاق
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   ADJUSTMENT MODAL
===================================== */

function AdjustmentModal({
  product,
  adjustmentType,
  quantity,
  reason,
  setQuantity,
  setReason,
  isSubmitting,
  onClose,
  onSubmit,
  productMovements,
}) {
  const previewStock =
    Math.max(
      0,
      Number(
        product.stock ||
          0
      ) +
        (
          adjustmentType ===
          "add"
            ? Number(
                quantity ||
                  0
              )
            : -Number(
                quantity ||
                  0
              )
        )
    );


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-6">

          <div>

            <p className="text-xs font-bold text-blue-600">
              تعديل المخزون
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {adjustmentType ===
              "add"
                ? "إضافة للمخزون"
                : "خصم من المخزون"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {
                product.name
              }
            </p>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isSubmitting
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
          >
            <X
              size={
                20
              }
            />
          </button>

        </div>


        <div className="min-h-0 overflow-y-auto p-6">

          <div className="rounded-2xl bg-slate-50 p-4">

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-500">
                المخزون الحالي
              </span>

              <span className="text-xl font-black text-slate-900">
                {
                  product.stock
                }{" "}
                قطعة
              </span>

            </div>

          </div>


          <div className="mt-5 space-y-4">

            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                الكمية
              </label>


              <input
                type="number"
                min="1"
                step="1"
                value={
                  quantity
                }
                onChange={(
                  event
                ) =>
                  setQuantity(
                    event.target
                      .value
                  )
                }
                placeholder="أدخل الكمية"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                autoFocus
                disabled={
                  isSubmitting
                }
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                السبب / المرجع
              </label>


              <input
                value={
                  reason
                }
                onChange={(
                  event
                ) =>
                  setReason(
                    event.target
                      .value
                  )
                }
                placeholder={
                  adjustmentType ===
                  "add"
                    ? "مثال: جرد أو توريد"
                    : "مثال: تلف أو فقد"
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                disabled={
                  isSubmitting
                }
              />

            </div>


            <div
              className={`rounded-xl p-4 ${
                adjustmentType ===
                "add"
                  ? "bg-emerald-50"
                  : "bg-red-50"
              }`}
            >

              <div className="flex items-center justify-between text-sm">

                <span
                  className={
                    adjustmentType ===
                    "add"
                      ? "text-emerald-700"
                      : "text-red-700"
                  }
                >
                  المخزون بعد العملية
                </span>


                <span
                  className={`font-black ${
                    adjustmentType ===
                    "add"
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {
                    previewStock
                  }{" "}
                  قطعة
                </span>

              </div>

            </div>


            {productMovements.length >
              0 && (
              <div>

                <div className="mb-3 flex items-center gap-2">

                  <History
                    size={
                      16
                    }
                    className="text-slate-400"
                  />

                  <p className="text-xs font-black text-slate-600">
                    آخر حركات المنتج
                  </p>

                </div>


                <div className="space-y-2">

                  {productMovements
                    .slice(
                      0,
                      4
                    )
                    .map(
                      (
                        movement
                      ) => (
                        <div
                          key={
                            movement.id
                          }
                          className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                        >

                          <div>

                            <p className="text-xs font-bold text-slate-700">
                              {
                                getMovementConfig(
                                  movement.type
                                ).label
                              }
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              {
                                movement.reference ||
                                "—"
                              }
                            </p>

                          </div>


                          <span
                            className={`text-sm font-black ${
                              Number(
                                movement.quantity ||
                                  0
                              ) >
                              0
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            {Number(
                              movement.quantity ||
                                0
                            ) >
                            0
                              ? "+"
                              : ""}

                            {
                              movement.quantity
                            }
                          </span>

                        </div>
                      )
                    )}

                </div>

              </div>
            )}

          </div>

        </div>


        <div className="flex shrink-0 gap-3 border-t border-slate-200 bg-slate-50 p-5">

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isSubmitting
            }
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-black text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            إلغاء
          </button>


          <button
            type="button"
            onClick={
              onSubmit
            }
            disabled={
              isSubmitting
            }
            className={`flex flex-1 items-center justify-center rounded-xl py-3.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300 ${
              adjustmentType ===
              "add"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSubmitting
              ? "جاري الحفظ..."
              : adjustmentType ===
                "add"
                ? "تأكيد الإضافة"
                : "تأكيد الخصم"}
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   MOVEMENT DETAILS
===================================== */

function MovementDetails({
  movement,
  onClose,
}) {
  const config =
    getMovementConfig(
      movement.type
    );

  const Icon =
    config.icon;

  const isAddition =
    Number(
      movement.quantity ||
        0
    ) > 0;


  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 p-6">

          <div>

            <p className="text-xs font-bold text-blue-600">
              حركة مخزون
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-900">
              تفاصيل الحركة
            </h2>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X
              size={
                19
              }
            />
          </button>

        </div>


        <div className="space-y-4 p-6">

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.iconClass}`}
            >
              <Icon
                size={
                  20
                }
              />
            </div>


            <div>

              <p className="font-black text-slate-800">
                {
                  movement.productName ||
                  "منتج غير معروف"
                }
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {
                  config.label
                }
              </p>

            </div>

          </div>


          <InfoRow
            label="الكمية"
            value={
              <span
                className={
                  isAddition
                    ? "font-black text-emerald-600"
                    : "font-black text-red-500"
                }
              >
                {isAddition
                  ? "+"
                  : ""}

                {
                  movement.quantity
                }{" "}
                قطعة
              </span>
            }
          />


          <InfoRow
            label="المصدر"
            value={
              getSourceLabel(
                movement.source
              )
            }
          />


          <InfoRow
            label="المرجع"
            value={
              movement.reference ||
              "—"
            }
          />


          <InfoRow
            label="معرف المنتج"
            value={
              movement.productId ??
              "—"
            }
          />


          <InfoRow
            label="المخزون بعد الحركة"
            value={
              movement.stockAfter ??
              "—"
            }
          />


          <InfoRow
            label="التاريخ والوقت"
            value={
              formatDate(
                movement.createdAt
              )
            }
          />


          <InfoRow
            label="معرف الحركة"
            value={
              movement.id ||
              "—"
            }
          />

        </div>


        <div className="border-t border-slate-200 bg-slate-50 p-5">

          <button
            type="button"
            onClick={
              onClose
            }
            className="w-full rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white hover:bg-blue-800"
          >
            إغلاق
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   HELPERS
===================================== */

function getMovementConfig(
  type
) {
  const config = {
    sale: {
      label: "بيع",
      icon:
        ShoppingCart,
      iconClass:
        "bg-red-50 text-red-500",
      badgeClass:
        "bg-red-50 text-red-600",
    },

    purchase: {
      label: "شراء",
      icon:
        ShoppingBag,
      iconClass:
        "bg-emerald-50 text-emerald-600",
      badgeClass:
        "bg-emerald-50 text-emerald-600",
    },

    repair: {
      label: "صيانة",
      icon:
        Wrench,
      iconClass:
        "bg-violet-50 text-violet-600",
      badgeClass:
        "bg-violet-50 text-violet-600",
    },

    stock_in: {
      label: "إضافة يدوية",
      icon:
        ArrowDownToLine,
      iconClass:
        "bg-blue-50 text-blue-700",
      badgeClass:
        "bg-blue-50 text-blue-700",
    },

    stock_out: {
      label: "خصم يدوي",
      icon:
        ArrowUpFromLine,
      iconClass:
        "bg-orange-50 text-orange-600",
      badgeClass:
        "bg-orange-50 text-orange-600",
    },
  };


  return (
    config[type] || {
      label:
        "حركة أخرى",
      icon:
        Settings2,
      iconClass:
        "bg-slate-100 text-slate-500",
      badgeClass:
        "bg-slate-100 text-slate-500",
    }
  );
}


function getSourceLabel(
  source
) {
  const labels = {
    store:
      "المحل",

    online:
      "المتجر الإلكتروني",

    purchase:
      "المشتريات",

    repair:
      "الصيانة",

    manual:
      "يدوي",

    inventory:
      "المخزون",
  };


  return (
    labels[source] ||
    source ||
    "غير محدد"
  );
}


function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 p-3">

      <span className="text-xs font-bold text-slate-400">
        {
          label
        }
      </span>


      <span className="max-w-[65%] break-words text-left text-sm font-bold text-slate-700">
        {
          value
        }
      </span>

    </div>
  );
}


function getDateKey(
  date
) {
  if (!date) {
    return "unknown";
  }

  const value =
    new Date(
      date
    );

  const year =
    value.getFullYear();

  const month =
    String(
      value.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      value.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function formatTime(
  date
) {
  if (!date) {
    return "—";
  }

  return new Date(
    date
  ).toLocaleTimeString(
    "ar-EG",
    {
      hour:
        "2-digit",
      minute:
        "2-digit",
    }
  );
}


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


function formatGroupDate(
  date
) {
  if (
    !date ||
    date ===
      "unknown"
  ) {
    return "بدون تاريخ";
  }

  const [
    year,
    month,
    day,
  ] =
    date.split(
      "-"
    );

  return new Date(
    Number(
      year
    ),
    Number(
      month
    ) - 1,
    Number(
      day
    )
  ).toLocaleDateString(
    "ar-EG",
    {
      weekday:
        "long",
      year:
        "numeric",
      month:
        "long",
      day:
        "numeric",
    }
  );
}


export default Inventory;