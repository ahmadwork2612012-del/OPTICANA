import ProductCard from "../cards/ProductCard";
import ProductFilters from "./ProductFilters";
import Reveal from "../ui/Reveal";
import ProductGridSkeleton from "../ui/ProductGridSkeleton";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  getProducts,
} from "../../services/productService";

import useSearchStore from "../../store/searchStore";

import SectionTitle from "../common/SectionTitle";
import EmptyState from "../common/EmptyState";


function Products() {
  const {
    filters,
    setCategory,
  } = useSearchStore();


  const [
    products,
    setProducts,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    searchParams,
  ] = useSearchParams();


  /* =====================================
     LOAD FROM ADMIN SERVICE
  ===================================== */

  useEffect(() => {
    let mounted = true;


    async function loadProducts() {
      try {
        setLoading(
          true
        );

        setError("");


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
          "Products 3.0:",
          error
        );


        if (mounted) {
          setError(
            "تعذر تحميل المنتجات حاليًا."
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
  }, []);


  /* =====================================
     CATEGORY FROM URL
  ===================================== */

  useEffect(() => {
    const category =
      searchParams.get(
        "category"
      );


    if (!category) {
      return;
    }


    setCategory(
      category
    );
  }, [
    searchParams,
    setCategory,
  ]);


  /* =====================================
     DYNAMIC FILTER OPTIONS
  ===================================== */

  const filterOptions =
    useMemo(() => {
      const uniqueValues =
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
          uniqueValues(
            "category"
          ),

        colors:
          uniqueValues(
            "color"
          ),

        materials:
          uniqueValues(
            "material"
          ),

        sizes:
          uniqueValues(
            "size"
          ),
      };
    }, [
      products,
    ]);


  /* =====================================
     FILTER PRODUCTS
  ===================================== */

  const filteredProducts =
    useMemo(() => {
      return products.filter(
        (product) => {

          /* CATEGORY */

          if (
            filters.category !==
              "الكل" &&
            product.category !==
              filters.category
          ) {
            return false;
          }


          /* COLOR */

          if (
            filters.color !==
              "الكل" &&
            product.color !==
              filters.color
          ) {
            return false;
          }


          /* MATERIAL */

          if (
            filters.material !==
              "الكل" &&
            product.material !==
              filters.material
          ) {
            return false;
          }


          /* SIZE */

          if (
            filters.size !==
              "الكل" &&
            product.size !==
              filters.size
          ) {
            return false;
          }


          /* MIN PRICE */

          if (
            filters.minPrice &&
            Number(
              product.price || 0
            ) <
              Number(
                filters.minPrice
              )
          ) {
            return false;
          }


          /* MAX PRICE */

          if (
            filters.maxPrice &&
            Number(
              product.price || 0
            ) >
              Number(
                filters.maxPrice
              )
          ) {
            return false;
          }


          return true;
        }
      );
    }, [
      products,
      filters,
    ]);


  /* =====================================
     LOADING
  ===================================== */

  if (loading) {
    return (
      <section className="bg-white py-16 sm:py-20">

        <div className="mx-auto max-w-7xl px-6">

          {/* HEADER SKELETON */}

          <div className="mb-10 space-y-3">

            <div className="h-9 w-48 animate-pulse rounded-full bg-[#e7ece4] sm:h-11 sm:w-64" />

            <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-[#eef2eb]" />

            <div className="h-4 w-2/3 max-w-md animate-pulse rounded-full bg-[#f2f4f0]" />

          </div>


          {/* FILTER SKELETON */}

          <div className="mb-10 flex flex-wrap gap-3">

            <div className="h-11 w-28 animate-pulse rounded-xl bg-[#eef2eb]" />

            <div className="h-11 w-28 animate-pulse rounded-xl bg-[#eef2eb]" />

            <div className="h-11 w-28 animate-pulse rounded-xl bg-[#eef2eb]" />

            <div className="h-11 w-28 animate-pulse rounded-xl bg-[#eef2eb]" />

          </div>


          {/* PRODUCTS */}

          <ProductGridSkeleton
            count={8}
          />

        </div>

      </section>
    );
  }


  /* =====================================
     ERROR
  ===================================== */

  if (error) {
    return (
      <section className="bg-white py-24">

        <div className="mx-auto max-w-7xl px-6">

          <EmptyState
            title="تعذر تحميل المنتجات"
            description={
              error
            }
          />

        </div>

      </section>
    );
  }


  return (
    <section className="bg-white py-16 sm:py-20">

      <div className="mx-auto max-w-7xl px-6">


        {/* =================================
            HEADER
        ================================= */}

        <SectionTitle
          title={
            filters.category ===
            "الكل"
              ? "جميع المنتجات"
              : filters.category
          }
          description={
            filters.category ===
            "الكل"
              ? "تصفح المنتجات المنشورة والمتاحة من OPTICANA."
              : `تصفح جميع منتجات ${filters.category}.`
          }
        />


        {/* =================================
            FILTERS
        ================================= */}

        <ProductFilters
          count={
            filteredProducts.length
          }
          categories={
            filterOptions.categories
          }
          colors={
            filterOptions.colors
          }
          materials={
            filterOptions.materials
          }
          sizes={
            filterOptions.sizes
          }
        />


        {/* =================================
            PRODUCTS
        ================================= */}

        {filteredProducts.length >
        0 ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-4 lg:gap-6">

            {filteredProducts.map(
              (
                product,
                index
              ) => (
                <Reveal
                  key={
                    product.id
                  }
                  delay={
                    index *
                    0.04
                  }
                >
                  <ProductCard
                    product={
                      product
                    }
                  />
                </Reveal>
              )
            )}

          </div>
        ) : (
          <div className="mt-16">

            <EmptyState
              title="لا توجد منتجات مطابقة"
              description="جرّب تغيير الفلاتر أو اختيار تصنيف آخر."
            />

          </div>
        )}

      </div>

    </section>
  );
}


export default Products;