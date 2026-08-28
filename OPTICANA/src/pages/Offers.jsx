import {
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Tag,
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
import Reveal from "../components/ui/Reveal";
import Loading from "../components/ui/Loading";

import {
  getProducts,
} from "../services/productService";

import {
  getStoreContent,
} from "../services/storeService";


/* =====================================
   OFFERS
===================================== */

function Offers() {
  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    content,
    setContent,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  /* =====================================
     LOAD ADMIN DATA
  ===================================== */

  const loadOffers =
    async () => {
      try {
        setLoading(
          true
        );


        const [
          nextProducts,
          nextContent,
        ] = await Promise.all([
          getProducts(),
          getStoreContent(),
        ]);


        setProducts(
          Array.isArray(
            nextProducts
          )
            ? nextProducts
            : []
        );


        setContent(
          nextContent || {}
        );

      } catch (error) {
        console.error(
          "Offers 3.0:",
          error
        );


        setProducts(
          []
        );


        setContent(
          {}
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

      await loadOffers();
    }


    load();


    const handleStorage = () => {
      loadOffers();
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
     OFFER PRODUCTS
     ONLY FROM ADMIN
  ===================================== */

  const offerProducts =
    useMemo(() => {
      return products.filter(
        (product) => {

          const isPublished =
            product?.isPublished ===
            true;


          const showOnStore =
            product?.showOnStore ===
            true;


          const isSale =
            product?.isSale ===
            true;


          const stock =
            Number(
              product?.stock ||
                0
            );


          const oldPrice =
            Number(
              product?.oldPrice ||
                0
            );


          const currentPrice =
            Number(
              product?.price ??
                product?.sellingPrice ??
                0
            );


          return (
            isPublished &&
            showOnStore &&
            isSale &&
            stock > 0 &&
            oldPrice >
              currentPrice
          );
        }
      );
    }, [
      products,
    ]);


  /* =====================================
     CMS
  ===================================== */

  const home =
    content?.home ||
    {};


  const offerConfig =
    home.offers ||
    {};


  const title =
    offerConfig.title ||
    "عروض OPTICANA";


  const description =
    offerConfig.description ||
    "اكتشف المنتجات التي عليها خصومات حاليًا.";


  /* =====================================
     LOADING
  ===================================== */

  if (loading) {
    return (
      <Loading
        label="جاري تحميل العروض..."
      />
    );
  }


  /* =====================================
     PAGE
  ===================================== */

  return (
    <main className="min-h-screen bg-[#fbfcfa]">


      {/* =====================================
          HERO
      ===================================== */}

      <section className="border-b border-[#e2e7df] bg-white">

        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-18">

          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 rounded-full bg-[#eef2eb] px-3.5 py-2 text-xs font-black text-[#596655]">

                <Sparkles
                  size={14}
                />

                عروض OPTICANA

              </div>


              <h1 className="mt-5 text-4xl font-black tracking-tight text-[#20251f] sm:text-5xl">
                {
                  title
                }
              </h1>


              <p className="mt-4 text-sm leading-8 text-[#7b8578] sm:text-base">
                {
                  description
                }
              </p>

            </div>


            <Link
              to="/products"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#cfdacb] bg-white px-5 py-3 text-sm font-black text-[#4f5d4c] transition hover:border-[#B4C4AD] hover:bg-[#eef2eb]"
            >

              كل المنتجات

              <ArrowLeft
                size={17}
              />

            </Link>

          </div>

        </div>

      </section>


      {/* =====================================
          OFFER STRIP
      ===================================== */}

      <section className="border-b border-[#dfe7dc] bg-[#eef2eb]">

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B4C4AD] text-[#263024]">

              <Tag
                size={18}
              />

            </div>


            <div>

              <p className="text-sm font-black text-[#34402f]">
                عروض المتجر
              </p>


              <p className="mt-0.5 text-xs font-bold text-[#7a8776]">
                {
                  offerProducts.length
                }{" "}
                منتج عليه خصم حاليًا
              </p>

            </div>

          </div>


          <div className="flex items-center gap-2 text-xs font-black text-[#63705f]">

            <ShoppingBag
              size={15}
            />

            البيانات محدثة من لوحة الإدارة

          </div>

        </div>

      </section>


      {/* =====================================
          PRODUCTS / EMPTY
      ===================================== */}

      <section className="py-16 sm:py-20">

        <div className="mx-auto max-w-7xl px-6">


          {offerProducts.length >
          0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">

              {offerProducts.map(
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
            <div className="mx-auto max-w-3xl">

              <div className="rounded-[2rem] border border-dashed border-[#ced9ca] bg-white p-8 text-center shadow-sm sm:p-12">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef2eb] text-[#6c7b67]">

                  <Tag
                    size={30}
                  />

                </div>


                <div className="mt-5">

                  <EmptyState
                    title="لا توجد عروض حاليًا"
                    description="ستظهر هنا المنتجات التي يفعّل لها Admin خيار العرض ويحدد لها سعرًا قديمًا وسعرًا حاليًا."
                  />

                </div>


                <Link
                  to="/products"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#2f382c] px-5 py-3 text-sm font-black text-white transition hover:bg-[#3c4838]"
                >

                  تصفح المنتجات

                  <ArrowLeft
                    size={17}
                  />

                </Link>

              </div>

            </div>
          )}

        </div>

      </section>


      {/* =====================================
          BOTTOM CTA
      ===================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-20">

        <div className="overflow-hidden rounded-[2rem] bg-[#2f382c] p-7 text-white sm:p-10">

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

            <div>

              <p className="text-xs font-black text-[#B4C4AD]">
                OPTICANA
              </p>


              <h2 className="mt-2 text-2xl font-black">
                ما لقيت اللي تدور عليه؟
              </h2>


              <p className="mt-2 text-sm leading-7 text-white/60">
                تصفح المجموعة الكاملة من المنتجات المنشورة في المتجر.
              </p>

            </div>


            <Link
              to="/products"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#B4C4AD] px-5 py-3.5 text-sm font-black text-[#263024] transition hover:bg-[#c3d0bd]"
            >

              تصفح المنتجات

              <ArrowLeft
                size={17}
              />

            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}


export default Offers;
