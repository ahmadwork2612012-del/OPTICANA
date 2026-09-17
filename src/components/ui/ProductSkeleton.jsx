function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#dfe6dc] bg-white shadow-sm sm:rounded-[2rem]">

      {/* IMAGE */}

      <div className="h-44 animate-pulse bg-[#eef2eb] sm:h-72" />


      {/* CONTENT */}

      <div className="space-y-3 p-3 sm:p-5">

        {/* CATEGORY */}

        <div className="h-2.5 w-16 animate-pulse rounded-full bg-[#e7ece4] sm:h-3 sm:w-20" />


        {/* NAME */}

        <div className="space-y-2">

          <div className="h-4 w-4/5 animate-pulse rounded-full bg-[#e7ece4] sm:h-5" />

          <div className="h-4 w-3/5 animate-pulse rounded-full bg-[#edf1eb] sm:h-5" />

        </div>


        {/* RATING */}

        <div className="flex items-center gap-2">

          <div className="h-3 w-20 animate-pulse rounded-full bg-[#edf1eb]" />

          <div className="h-2.5 w-8 animate-pulse rounded-full bg-[#edf1eb]" />

        </div>


        {/* PRICE */}

        <div className="flex items-end gap-2 pt-1">

          <div className="h-6 w-24 animate-pulse rounded-full bg-[#e4eae1] sm:h-8 sm:w-28" />

          <div className="h-3 w-14 animate-pulse rounded-full bg-[#edf1eb]" />

        </div>


        {/* STOCK */}

        <div className="h-3 w-16 animate-pulse rounded-full bg-[#edf1eb]" />


        {/* ACTIONS */}

        <div className="flex gap-2 pt-1">

          <div className="h-10 flex-1 animate-pulse rounded-lg bg-[#e4eae1] sm:h-12 sm:rounded-xl" />

          <div className="h-10 w-10 animate-pulse rounded-lg bg-[#edf1eb] sm:h-12 sm:w-12 sm:rounded-xl" />

        </div>

      </div>

    </div>
  );
}


export default ProductSkeleton;