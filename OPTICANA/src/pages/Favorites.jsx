import {
  ArrowLeft,
  Heart,
  Package,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import ProductCard from "../components/cards/ProductCard";
import EmptyState from "../components/common/EmptyState";
import ProductGridSkeleton from "../components/ui/ProductGridSkeleton";

import useFavoriteStore from "../store/favoriteStore";

import {
  getProducts,
} from "../services/productService";


/* =====================================
   FAVORITES
===================================== */

function Favorites() {
  const favorites =
    useFavoriteStore(
      (state) =>
        state.favorites
    );


  const [
    products,
    setProducts,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  /* =====================================
     LOAD CURRENT ADMIN PRODUCTS
  ===================================== */

  const loadProducts =
    async () => {
      try {
        setLoading(
          true
        );


        const data =
          await getProducts();


        setProducts(
          Array.isArray(
            data
          )
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Favorites 3.0:",
          error
        );


        setProducts(
          []
        );
      } finally {
        setLoading(
          false
        );
      }
    };


  useEffect(() => {
    let mounted = true;


    async function load() {
      if (!mounted) {
        return;
      }


      await loadProducts();
    }


    load();


    /*
     * تحديث الصفحة عندما تتغير
     * بيانات Admin في نفس المتصفح.
     */
    const handleStorage = () => {
      loadProducts();
    };


    window.addEventListener(
      "storage",
      handleStorage
    );


    return () => {
      mounted = false;

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);


  /* =====================================
     CURRENT ADMIN PRODUCT MAP
  ===================================== */

  const productMap =
    useMemo(() => {
      const map =
        new Map();


      products.forEach(
        (product) => {
          if (!product?.id) {
            return;
          }


          map.set(
            String(
              product.id
            ),
            product
          );
        }
      );


      return map;
    }, [
      products,
    ]);


  /* =====================================
     CURRENT FAVORITES
  ===================================== */

  const favoriteProducts =
    useMemo(() => {
      return favorites
        .map(
          (favorite) =>
            productMap.get(
              String(
                favorite?.id
              )
            )
        )
        .filter(Boolean);
    }, [
      favorites,
      productMap,
    ]);


  /* =====================================
     TOTAL
  ===================================== */

  const favoriteCount =
    favoriteProducts.length;


  /* =====================================
     LOADING
  ===================================== */

  if (loading) {
    return (
      <section className="bg-[#fbfcfa] py-20">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mb-10 space-y-3">

            <div className="h-3 w-20 animate-pulse rounded-full bg-[#e7ece4]" />

            <div className="h-10 w-56 animate-pulse rounded-full bg-[#e7ece4]" />

            <div className="h-4 w-72 max-w-full animate-pulse rounded-full bg-[#eef2eb]" />

          </div>


          <ProductGridSkeleton
            count={8}
          />

        </div>

      </section>
    );
  }


  /* =====================================
     EMPTY
  ===================================== */

  if (
    favoriteCount ===
    0
  ) {
    return (
      <section className="min-h-[70vh] bg-[#fbfcfa] py-20 sm:py-24">

        <div className="mx-auto max-w-5xl px-6">


          {/* HEADER */}

          <div className="mb-10">

            <p className="text-xs font-black text-[#768273]">
              OPTICANA
            </p>


            <div className="mt-2 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef2eb] text-[#657361]">

                <Heart
                  size={23}
                />

              </div>


              <h1 className="text-4xl font-black text-[#20251f] sm:text-5xl">
                المفضلة
              </h1>

            </div>

          </div>


          {/* EMPTY STATE */}

          <div className="rounded-[2rem] border border-[#dfe6dc] bg-white p-8 text-center shadow-sm sm:p-12">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef2eb] text-[#71806d]">

              <Heart
                size={30}
              />

            </div>


            <EmptyState
              title="لا توجد منتجات مفضلة"
              description="أضف المنتجات التي تعجبك إلى المفضلة لتجدها هنا."
            />


            <Link
              to="/products"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2f382c] px-5 py-3 text-sm font-black text-white transition hover:bg-[#3c4838]"
            >

              تصفح المنتجات

              <ArrowLeft
                size={17}
              />

            </Link>

          </div>

        </div>

      </section>
    );
  }


  /* =====================================
     PAGE
  ===================================== */

  return (
    <section className="bg-[#fbfcfa] py-16 sm:py-20">

      <div className="mx-auto max-w-7xl px-6">


        {/* =================================
            HEADER
        ================================= */}

        <div className="flex flex-wrap items-end justify-between gap-5">

          <div>

            <p className="text-xs font-black text-[#6b7868]">
              OPTICANA
            </p>


            <div className="mt-2 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef2eb] text-[#657361]">

                <Heart
                  size={23}
                />

              </div>


              <h1 className="text-4xl font-black text-[#20251f] sm:text-5xl">
                المنتجات المفضلة
              </h1>

            </div>


            <p className="mt-3 text-sm font-bold text-[#818b80]">

              لديك{" "}

              <span className="text-[#4f5d4c]">
                {
                  favoriteCount
                }
              </span>

              {" "}

              منتج في المفضلة

            </p>

          </div>


          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl border border-[#cfdacb] bg-white px-5 py-3 text-sm font-black text-[#4f5d4c] transition hover:border-[#B4C4AD] hover:bg-[#eef2eb]"
          >

            متابعة التسوق

            <ArrowLeft
              size={17}
            />

          </Link>

        </div>


        {/* =================================
            PRODUCTS
        ================================= */}

        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-4 lg:gap-6">

          {favoriteProducts.map(
            (
              product
            ) => (
              <ProductCard
                key={
                  product.id
                }
                product={
                  product
                }
              />
            )
          )}

        </div>


        {/* =================================
            INFO
        ================================= */}

        <div className="mt-10 flex items-start gap-3 rounded-2xl border border-[#dfe6dc] bg-white p-4">

          <Package
            size={19}
            className="mt-0.5 shrink-0 text-[#788675]"
          />


          <p className="text-xs leading-6 text-[#7d8779]">
            المفضلة تعرض فقط المنتجات الموجودة حاليًا في بيانات المتجر القادمة من لوحة الإدارة.
          </p>

        </div>

      </div>

    </section>
  );
}


export default Favorites;