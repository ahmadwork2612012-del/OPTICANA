import {
  SlidersHorizontal,
  X,
} from "lucide-react";

import useSearchStore from "../../store/searchStore";

function ProductFilters({
  count,
  categories = [],
  colors = [],
  materials = [],
  sizes = [],
}) {
  const {
    filters,
    setCategory,
    openSearch,
    setFilters,
  } =
    useSearchStore();

  const quickCategories = [
    "الكل",
    ...categories.filter(
      (item) =>
        item &&
        item !== "الكل"
    ),
  ];

  const categoryOptions = [
    "الكل",
    ...categories.filter(
      (item) =>
        item &&
        item !== "الكل"
    ),
  ];

  const colorOptions = [
    "الكل",
    ...colors.filter(
      (item) =>
        item &&
        item !== "الكل"
    ),
  ];

  const materialOptions = [
    "الكل",
    ...materials.filter(
      (item) =>
        item &&
        item !== "الكل"
    ),
  ];

  const sizeOptions = [
    "الكل",
    ...sizes.filter(
      (item) =>
        item &&
        item !== "الكل"
    ),
  ];

  const hasActiveFilters =
    filters.category !==
      "الكل" ||
    filters.color !==
      "الكل" ||
    filters.material !==
      "الكل" ||
    filters.size !==
      "الكل" ||
    Boolean(
      filters.minPrice
    ) ||
    Boolean(
      filters.maxPrice
    );

  return (
    <div className="mt-10 space-y-4">

      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-[#dfe6dc] bg-[#fafbf8] p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">

        <div className="flex flex-wrap items-center gap-2">

          <button
            type="button"
            onClick={
              openSearch
            }
            className="flex items-center gap-2 rounded-xl bg-[#2f382c] px-5 py-3 text-sm font-black text-white transition hover:bg-[#3c4838]"
          >
            <SlidersHorizontal
              size={17}
            />

            فلترة المنتجات
          </button>

          <div className="flex flex-wrap gap-2">

            {quickCategories.map(
              (category) => (
                <button
                  key={
                    category
                  }
                  type="button"
                  onClick={() =>
                    setCategory(
                      category
                    )
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    filters.category ===
                    category
                      ? "border-[#B4C4AD] bg-[#B4C4AD] text-[#263024]"
                      : "border-[#dfe6dc] bg-white text-[#5f6c5a] hover:border-[#B4C4AD] hover:bg-[#f0f3ed]"
                  }`}
                >
                  {
                    category
                  }
                </button>
              )
            )}

          </div>

        </div>

        <span className="text-sm font-bold text-[#7b8778]">
          تم العثور على
          <span className="mx-2 text-2xl font-black text-[#2f382c]">
            {count}
          </span>
          منتج
        </span>

      </div>


      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">

          {filters.category !==
            "الكل" && (
            <FilterChip
              label={
                filters.category
              }
              onClear={() =>
                setCategory(
                  "الكل"
                )
              }
            />
          )}

          {filters.color !==
            "الكل" && (
            <FilterChip
              label={
                filters.color
              }
              onClear={() =>
                setFilters({
                  ...filters,
                  color:
                    "الكل",
                })
              }
            />
          )}

          {filters.material !==
            "الكل" && (
            <FilterChip
              label={
                filters.material
              }
              onClear={() =>
                setFilters({
                  ...filters,
                  material:
                    "الكل",
                })
              }
            />
          )}

          {filters.size !==
            "الكل" && (
            <FilterChip
              label={
                filters.size
              }
              onClear={() =>
                setFilters({
                  ...filters,
                  size:
                    "الكل",
                })
              }
            />
          )}

          {filters.minPrice && (
            <FilterChip
              label={`من ${filters.minPrice} ج.م`}
              onClear={() =>
                setFilters({
                  ...filters,
                  minPrice:
                    "",
                })
              }
            />
          )}

          {filters.maxPrice && (
            <FilterChip
              label={`إلى ${filters.maxPrice} ج.م`}
              onClear={() =>
                setFilters({
                  ...filters,
                  maxPrice:
                    "",
                })
              }
            />
          )}

        </div>
      )}


      {/* Hidden native options
          passed to drawer via store-aware page.
          Kept exported for compatibility. */}

      <input
        type="hidden"
        value=""
        readOnly
        data-category-options={
          categoryOptions.join(
            "|"
          )
        }
        data-color-options={
          colorOptions.join(
            "|"
          )
        }
        data-material-options={
          materialOptions.join(
            "|"
          )
        }
        data-size-options={
          sizeOptions.join(
            "|"
          )
        }
      />

    </div>
  );
}


function FilterChip({
  label,
  onClear,
}) {
  return (
    <button
      type="button"
      onClick={
        onClear
      }
      className="flex items-center gap-2 rounded-full border border-[#d9e2d5] bg-[#f0f4ed] px-4 py-2 text-sm font-bold text-[#53604f] transition hover:bg-[#e8eee4]"
    >
      {label}

      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs">
        <X size={11} />
      </span>
    </button>
  );
}

export default ProductFilters;