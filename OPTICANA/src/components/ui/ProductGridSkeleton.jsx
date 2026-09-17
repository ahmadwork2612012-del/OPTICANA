import ProductSkeleton from "./ProductSkeleton";


function ProductGridSkeleton({
  count = 8,
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">

      {Array.from(
        {
          length: count,
        }
      ).map(
        (_, index) => (
          <ProductSkeleton
            key={index}
          />
        )
      )}

    </div>
  );
}


export default ProductGridSkeleton;