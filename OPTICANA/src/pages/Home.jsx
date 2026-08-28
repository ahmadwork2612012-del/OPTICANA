import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import toast from "react-hot-toast";

import ProductCard from "../components/cards/ProductCard";
import EmptyState from "../components/common/EmptyState";
import Reveal from "../components/ui/Reveal";
import Loading from "../components/ui/Loading";

import {
  getProducts,
  getOffers,
} from "../services/productService";

import {
  getStoreCategories,
} from "../services/categoryService";

import {
  getStoreContent,
  getStoreInfo,
} from "../services/storeService";

import {
  getApprovedReviews,
} from "../services/reviewService";


/* =====================================
   HOME
===================================== */

function Home() {
  const [
    content,
    setContent,
  ] = useState(null);


  const [
    store,
    setStore,
  ] = useState(null);


  const [
    products,
    setProducts,
  ] = useState([]);


  const [
    offers,
    setOffers,
  ] = useState([]);


  const [
    categories,
    setCategories,
  ] = useState([]);


  const [
    reviews,
    setReviews,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  /* =====================================
     LOAD HOME DATA
  ===================================== */

  const loadHomeData =
    async () => {
      try {
        setLoading(
          true
        );


        const [
          nextContent,
          nextStore,
          nextProducts,
          nextOffers,
          nextCategories,
          approvedReviews,
        ] =
          await Promise.all([
            getStoreContent(),
            getStoreInfo(),
            getProducts(),
            getOffers(),
            getStoreCategories(),
            getApprovedReviews(),
          ]);


        setContent(
          nextContent || {}
        );


        setStore(
          nextStore || {}
        );


        setProducts(
          Array.isArray(
            nextProducts
          )
            ? nextProducts
            : []
        );


        setOffers(
          Array.isArray(
            nextOffers
          )
            ? nextOffers
            : []
        );


        setCategories(
          Array.isArray(
            nextCategories
          )
            ? nextCategories
            : []
        );


        setReviews(
          Array.isArray(
            approvedReviews
          )
            ? approvedReviews
            : []
        );

      } catch (error) {
        console.error(
          "Home 3.0:",
          error
        );


        toast.error(
          error?.message ||
            "تعذر تحميل محتوى المتجر"
        );

      } finally {
        setLoading(
          false
        );
      }
    };


  useEffect(() => {
    let mounted =
      true;


    const load =
      async () => {
        if (!mounted) {
          return;
        }


        await loadHomeData();
      };


    load();


    return () => {
      mounted = false;
    };
  }, []);


  /* =====================================
     LOADING
  ===================================== */

  if (loading) {
    return (
      <Loading />
    );
  }


  /* =====================================
     CONTENT
  ===================================== */

  if (!content) {
    return (
      <main className="min-h-[80vh] bg-[#fafbf8] px-6 py-24">

        <EmptyState
          title="تعذر تحميل الصفحة الرئيسية"
          description="حاول تحديث الصفحة مرة أخرى."
        />

      </main>
    );
  }


  const home =
    content.home ||
    {};


  const hero =
    home.hero ||
    {};


  const announcement =
    home.announcement ||
    {};


  const featured =
    home.featuredProducts ||
    {};


  const categoriesConfig =
    home.categories ||
    {};


  const whyUs =
    home.whyUs ||
    {};


  const statistics =
    home.statistics ||
    {};


  const offersConfig =
    home.offers ||
    {};


  const reviewsConfig =
    home.reviews ||
    {};


  const faq =
    home.faq ||
    {};


  const cta =
    home.cta ||
    {};


  /* =====================================
     VISIBLE CATEGORIES
     Backend already filters:
     isActive = true
     showOnStore = true
  ===================================== */

  const visibleCategories =
    categories.slice(
      0,
      Number(
        categoriesConfig.limit ||
          categories.length
      )
    );


  /* =====================================
     FEATURED PRODUCTS
  ===================================== */

  const featuredProducts =
    products
      .filter(
        (product) =>
          product?.featured ===
          true
      )
      .slice(
        0,
        Number(
          featured.limit ||
            8
        )
      );


  /* =====================================
     NEW PRODUCTS
  ===================================== */

  const recentProducts =
    products
      .filter(
        (product) =>
          product?.isNew ===
          true
      )
      .slice(
        0,
        8
      );


  return (
    <main className="overflow-hidden bg-[#fbfcfa] text-[#20251f]">


      {/* =====================================
          ANNOUNCEMENT
      ===================================== */}

      {announcement.enabled && (
        <div className="border-b border-[#dce4d8] bg-[#eef2eb]">

          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-6 py-2.5 text-center text-xs font-black text-[#566352] sm:text-sm">

            <Sparkles
              size={14}
            />

            <span>
              {
                announcement.text
              }
            </span>


            {announcement.link && (
              <Link
                to={
                  announcement.link
                }
                className="underline decoration-[#aab7a5] underline-offset-4"
              >
                اكتشف
              </Link>
            )}

          </div>

        </div>
      )}


      {/* =====================================
          HERO
      ===================================== */}

      {hero.enabled && (
        <section className="relative overflow-hidden">

          <div className="pointer-events-none absolute -right-28 top-20 h-80 w-80 rounded-full bg-[#dce6d8] opacity-60 blur-3xl" />

          <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#eef1df] opacity-80 blur-3xl" />


          <div className="mx-auto flex min-h-[78vh] max-w-7xl flex-col-reverse items-center justify-between gap-14 px-6 py-14 lg:flex-row lg:py-20">

            {/* TEXT */}

            <Reveal
              className="w-full lg:w-[48%]"
            >

              <div className="max-w-2xl">

                <span className="inline-flex items-center gap-2 rounded-full border border-[#d6e0d2] bg-[#eef2eb] px-4 py-2 text-xs font-black text-[#596755]">

                  <Sparkles
                    size={14}
                  />

                  {store?.slogan ||
                    "عيونك أحلى معانا"}

                </span>


                <h1 className="mt-7 text-5xl font-black leading-[1.15] tracking-tight text-[#20251f] sm:text-6xl lg:text-7xl">
                  {
                    hero.title
                  }
                </h1>


                <p className="mt-7 max-w-xl text-base leading-8 text-[#727c70] sm:text-lg">
                  {
                    hero.subtitle
                  }
                </p>


                {/* ACTIONS */}

                <div className="mt-9 flex flex-wrap gap-3">

                  {hero.primaryButton
                    ?.enabled && (
                    <Link
                      to={
                        hero
                          .primaryButton
                          .link ||
                        "/products"
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-[#2f382c] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#2f382c]/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#3c4838] hover:shadow-xl"
                    >
                      {
                        hero
                          .primaryButton
                          .text ||
                        "تسوق الآن"
                      }

                      <ArrowLeft
                        size={17}
                      />
                    </Link>
                  )}


                  {hero.secondaryButton
                    ?.enabled && (
                    <Link
                      to={
                        hero
                          .secondaryButton
                          .link ||
                        "/about"
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-[#d4ded1] bg-white px-6 py-3.5 text-sm font-black text-[#4c5949] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#B4C4AD] hover:bg-[#f1f4ee] hover:shadow-md"
                    >
                      {
                        hero
                          .secondaryButton
                          .text ||
                        "عن OPTICANA"
                      }
                    </Link>
                  )}

                </div>


                {/* HERO STATS */}

                {statistics.enabled &&
                  statistics.items?.length >
                    0 && (
                    <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">

                      {statistics.items
                        .slice(
                          0,
                          4
                        )
                        .map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={
                                item.id ||
                                index
                              }
                              className="rounded-2xl border border-[#e1e6df] bg-white p-4 text-center shadow-sm"
                            >

                              <p className="text-2xl font-black text-[#374333]">
                                {
                                  item.value
                                }
                              </p>

                              <p className="mt-1 text-[11px] font-bold text-[#8a9487]">
                                {
                                  item.label
                                }
                              </p>

                            </div>
                          )
                        )}

                    </div>
                  )}

              </div>

            </Reveal>


            {/* HERO IMAGE */}

            <Reveal
              delay={0.15}
              className="w-full lg:w-[44%]"
            >

              <div className="relative">

                <div className="absolute -inset-5 rounded-[3rem] bg-[#dce6d8]/70 blur-2xl" />

                <div className="relative overflow-hidden rounded-[2.7rem] border border-white bg-[#eef2eb] shadow-2xl">

                  <div className="aspect-[0.92]">

                    {hero.image ? (
                      <img
                        src={
                          hero.image
                        }
                        alt={
                          hero.title ||
                          store?.name ||
                          "OPTICANA"
                        }
                        className="h-full w-full object-cover transition duration-700 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#eef2eb] via-white to-[#dfe8db] p-10 text-center">

                        <div>

                          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#B4C4AD] text-3xl font-black text-[#283226]">
                            O
                          </div>

                          <p className="mt-5 text-2xl font-black text-[#364132]">
                            {
                              store?.name ||
                              "OPTICANA"
                            }
                          </p>

                          <p className="mt-2 text-sm font-bold text-[#788374]">
                            الصورة الرئيسية ستضاف من CMS
                          </p>

                        </div>

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </Reveal>

          </div>

        </section>
      )}


      {/* =====================================
          WHY US
      ===================================== */}

      {whyUs.enabled &&
        whyUs.items?.length >
          0 && (
          <section className="border-y border-[#e3e8e0] bg-white py-14">

            <div className="mx-auto max-w-7xl px-6">

              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

                <SectionHeading
                  title={
                    whyUs.title ||
                    "لماذا OPTICANA؟"
                  }
                  description={
                    whyUs.description
                  }
                />

                <div className="hidden h-px flex-1 bg-[#e7ece5] lg:mx-10 lg:block" />

              </div>


              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">

                {whyUs.items
                  .slice(
                    0,
                    4
                  )
                  .map(
                    (
                      item,
                      index
                    ) => {

                      const icons = [
                        Truck,
                        ShieldCheck,
                        Sparkles,
                        Headphones,
                      ];


                      const Icon =
                        icons[
                          index %
                            icons.length
                        ];


                      return (
                        <Reveal
                          key={
                            item.id ||
                            index
                          }
                          delay={
                            index *
                            0.04
                          }
                        >

                          <div className="group h-full rounded-2xl border border-[#e2e7df] bg-[#fbfcfa] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#cbd7c7] hover:shadow-xl sm:p-5">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8eee5] text-[#566451] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#B4C4AD] group-hover:text-[#263024]">
                              <Icon
                                size={19}
                              />
                            </div>


                            <h3 className="mt-4 text-sm font-black text-[#293126] sm:text-base">
                              {
                                item.title
                              }
                            </h3>


                            <p className="mt-2 line-clamp-2 text-[11px] leading-6 text-[#7d8779] sm:text-xs">
                              {
                                item.description
                              }
                            </p>

                          </div>

                        </Reveal>
                      );
                    }
                  )}

              </div>

            </div>

          </section>
        )}


      {/* =====================================
          CATEGORIES
          FROM PUBLIC CATEGORIES API
      ===================================== */}

      {categoriesConfig.enabled &&
        visibleCategories.length >
          0 && (
          <section className="py-20">

            <div className="mx-auto max-w-7xl px-6">

              <SectionHeading
                eyebrow="اختياراتك"
                title={
                  categoriesConfig.title ||
                  "تسوق حسب الفئة"
                }
                description={
                  categoriesConfig.description
                }
              />


              <HorizontalCategories
                categories={
                  visibleCategories
                }
              />

            </div>

          </section>
        )}


      {/* =====================================
          FEATURED PRODUCTS
      ===================================== */}

      {featured.enabled &&
        featuredProducts.length >
          0 && (
          <ProductSection
            eyebrow="اختيارات OPTICANA"
            title={
              featured.title
            }
            description={
              featured.description
            }
            products={
              featuredProducts
            }
            link="/products"
            linkText="عرض كل المنتجات"
          />
        )}


      {/* =====================================
          NEW PRODUCTS
      ===================================== */}

      {recentProducts.length >
        0 && (
        <ProductSection
          eyebrow="وصل حديثًا"
          title="أحدث المنتجات"
          description="منتجات جديدة منشورة من لوحة الإدارة."
          products={
            recentProducts
          }
          link="/products"
          linkText="تصفح المنتجات"
          tone="soft"
        />
      )}


      {/* =====================================
          OFFERS
      ===================================== */}

      {offersConfig.enabled &&
        offers.length >
          0 && (
          <section className="bg-[#eef2eb] py-20">

            <div className="mx-auto max-w-7xl px-6">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                <SectionHeading
                  eyebrow="عروض OPTICANA"
                  title={
                    offersConfig.title
                  }
                  description={
                    offersConfig.description
                  }
                />


                <Link
                  to="/offers"
                  className="inline-flex items-center gap-2 text-sm font-black text-[#596655]"
                >
                  عرض الكل

                  <ArrowLeft
                    size={16}
                  />
                </Link>

              </div>


              <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">

                {offers
                  .slice(
                    0,
                    4
                  )
                  .map(
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

            </div>

          </section>
        )}


      {/* =====================================
          REVIEWS
      ===================================== */}

      {reviewsConfig.enabled && (
        <section className="py-20">

          <div className="mx-auto max-w-7xl px-6">

            <SectionHeading
              eyebrow="تجارب العملاء"
              title={
                reviewsConfig.title ||
                "آراء عملائنا"
              }
              description={
                reviewsConfig.description ||
                "تجارب حقيقية من عملاء OPTICANA."
              }
            />


            {reviews.length >
            0 ? (
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {reviews
                  .slice(
                    0,
                    6
                  )
                  .map(
                    (
                      review,
                      index
                    ) => (
                      <Reveal
                        key={
                          review.id ||
                          index
                        }
                        delay={
                          index *
                          0.05
                        }
                      >

                        <div className="h-full rounded-[1.5rem] border border-[#e1e6df] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

                          <Quote
                            size={22}
                            className="text-[#b8c6b2]"
                          />


                          <p className="mt-4 text-sm leading-7 text-[#687365]">
                            {
                              review.comment ||
                              review.message ||
                              "تجربة مميزة مع OPTICANA."
                            }
                          </p>


                          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#edf0eb] pt-4">

                            <div className="min-w-0">

                              <p className="truncate text-sm font-black text-[#30392e]">
                                {
                                  review.customerName ||
                                  review.customer?.name ||
                                  "عميل OPTICANA"
                                }
                              </p>


                              {review.productName && (
                                <p className="mt-1 truncate text-[10px] font-bold text-[#929b90]">
                                  {
                                    review.productName
                                  }
                                </p>
                              )}

                            </div>


                            <div className="flex shrink-0 items-center gap-0.5">

                              {[
                                1,
                                2,
                                3,
                                4,
                                5,
                              ].map(
                                (
                                  star
                                ) => (
                                  <Star
                                    key={
                                      star
                                    }
                                    size={
                                      12
                                    }
                                    className={
                                      star <=
                                      Number(
                                        review.rating ||
                                          0
                                      )
                                        ? "fill-[#b49a55] text-[#b49a55]"
                                        : "text-[#d5dbd2]"
                                    }
                                  />
                                )
                              )}

                            </div>

                          </div>

                        </div>

                      </Reveal>
                    )
                  )}

              </div>
            ) : (
              <div className="mt-8 rounded-[1.75rem] border border-dashed border-[#d8e1d4] bg-white px-6 py-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef2eb] text-[#657361]">
                  <Star
                    size={25}
                  />
                </div>


                <p className="mt-4 text-sm font-black text-[#4f5d4c]">
                  كن أول من يشاركنا تجربته
                </p>


                <p className="mx-auto mt-1 max-w-md text-xs leading-6 text-[#8a9487]">
                  ستظهر تقييمات العملاء المعتمدة هنا بعد مراجعتها من فريق OPTICANA.
                </p>

              </div>
            )}

          </div>

        </section>
      )}


      {/* =====================================
          FAQ
      ===================================== */}

      {faq.enabled &&
        faq.items?.length >
          0 && (
          <FaqSection
            title={
              faq.title
            }
            description={
              faq.description
            }
            items={
              faq.items
            }
          />
        )}


      {/* =====================================
          CTA
      ===================================== */}

      {cta.enabled && (
        <section className="mx-auto max-w-7xl px-6 pb-24 pt-4">

          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#2f382c] px-7 py-14 text-white sm:px-12 sm:py-16">

            <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-[#B4C4AD]/20 blur-3xl" />

            <div className="absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-[#B4C4AD]/10 blur-3xl" />


            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">

              <div className="max-w-2xl">

                <p className="text-xs font-black text-[#B4C4AD]">
                  OPTICANA
                </p>


                <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                  {
                    cta.title
                  }
                </h2>


                <p className="mt-4 text-sm leading-7 text-white/65">
                  {
                    cta.description
                  }
                </p>

              </div>


              {cta.buttonText && (
                <Link
                  to={
                    cta.buttonLink ||
                    "/products"
                  }
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#B4C4AD] px-6 py-3.5 text-sm font-black text-[#263024] transition hover:bg-[#c4d0bf]"
                >
                  {
                    cta.buttonText
                  }

                  <ArrowLeft
                    size={17}
                  />
                </Link>
              )}

            </div>

          </div>

        </section>
      )}

    </main>
  );
}


/* =====================================
   HORIZONTAL CATEGORIES
===================================== */

function HorizontalCategories({
  categories,
}) {
  const scrollRef =
    useRef(null);


  const scrollByAmount =
    (
      amount
    ) => {
      scrollRef.current?.scrollBy({
        left:
          amount,
        behavior:
          "smooth",
      });
    };


  return (
    <div className="relative mt-10">

      {/* LEFT */}

      <button
        type="button"
        onClick={() =>
          scrollByAmount(
            -320
          )
        }
        aria-label="الفئات السابقة"
        className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#dfe6dc] bg-white/95 text-[#52604e] shadow-lg backdrop-blur transition duration-200 hover:scale-105 hover:border-[#cbd7c7] hover:bg-[#f5f8f3] sm:flex"
      >
        <ChevronLeft
          size={19}
        />
      </button>


      {/* RIGHT */}

      <button
        type="button"
        onClick={() =>
          scrollByAmount(
            320
          )
        }
        aria-label="الفئات التالية"
        className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#dfe6dc] bg-white/95 text-[#52604e] shadow-lg backdrop-blur transition duration-200 hover:scale-105 hover:border-[#cbd7c7] hover:bg-[#f5f8f3] sm:flex"
      >
        <ChevronRight
          size={19}
        />
      </button>


      {/* EDGE FADE */}

      <div className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-16 bg-gradient-to-r from-[#fbfcfa] to-transparent lg:block" />

      <div className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-16 bg-gradient-to-l from-[#fbfcfa] to-transparent lg:block" />


      {/* SCROLL */}

      <div
        ref={
          scrollRef
        }
        dir="rtl"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-none"
        style={{
          scrollbarWidth:
            "none",

          msOverflowStyle:
            "none",
        }}
      >

        {categories.map(
          (
            category
          ) => (
            <Link
              key={
                category.id
              }
              to={`/products?category=${encodeURIComponent(
                category.name
              )}`}
              className="group relative min-w-[220px] shrink-0 snap-start overflow-hidden rounded-[1.75rem] border border-[#dde4da] bg-[#edf1ea] transition-all duration-500 hover:-translate-y-2 hover:border-[#c8d5c4] hover:shadow-2xl sm:min-w-[250px] lg:min-w-[280px] xl:min-w-[300px]"            >

             {/* IMAGE */}

<div className="h-64 overflow-hidden sm:h-72 lg:h-80">

  {category.image ? (
    <img
      src={category.image}
      alt={category.name}
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  ) : (
    <div className="h-full w-full bg-gradient-to-br from-[#e9eee6] to-[#dbe5d7] transition-transform duration-700 group-hover:scale-105" />
  )}

</div>


              {/* OVERLAY */}

              <div className="absolute inset-0 bg-gradient-to-t from-[#172017]/90 via-[#172017]/20 to-transparent transition-all duration-500 group-hover:from-[#172017]/95 group-hover:via-[#172017]/30" />


              {/* CONTENT */}

              <div className="absolute inset-x-0 bottom-0 p-5">

                <p className="text-xs font-black text-[#d9e4d4]">
                  {
                    category.productCount
                  }{" "}
                  منتج
                </p>


                <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">
                  {
                    category.name
                  }
                </h3>


                <span className="mt-4 inline-flex items-center gap-2 text-xs font-black text-white/90 transition-all duration-300 group-hover:gap-4 group-hover:text-white sm:text-sm">

                  تصفح الفئة

                  <ArrowLeft
                    size={14}
                  />

                </span>

              </div>

            </Link>
          )
        )}

      </div>

    </div>
  );
}


/* =====================================
   PRODUCT SECTION
===================================== */

function ProductSection({
  eyebrow,
  title,
  description,
  products,
  link,
  linkText,
  tone = "white",
}) {
  return (
    <section
      className={
        tone ===
        "soft"
          ? "bg-[#f2f5ef] py-20"
          : "py-20"
      }
    >

      <div className="mx-auto max-w-7xl px-6">

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>

            {eyebrow && (
              <p className="text-xs font-black tracking-wide text-[#667462]">
                {
                  eyebrow
                }
              </p>
            )}


            <h2 className="mt-2 text-3xl font-black text-[#263024] sm:text-4xl">
              {
                title
              }
            </h2>


            {description && (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#788374]">
                {
                  description
                }
              </p>
            )}

          </div>


          {link && (
            <Link
              to={
                link
              }
              className="inline-flex items-center gap-2 text-sm font-black text-[#596655]"
            >

              {
                linkText
              }

              <ArrowLeft
                size={16}
              />

            </Link>
          )}

        </div>


        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">

          {products.map(
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

      </div>

    </section>
  );
}


/* =====================================
   SECTION HEADING
===================================== */

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="max-w-2xl">

      {eyebrow && (
        <p className="text-xs font-black tracking-wide text-[#6c7968]">
          {
            eyebrow
          }
        </p>
      )}


      <h2 className="mt-2 text-3xl font-black tracking-tight text-[#263024] sm:text-4xl lg:text-5xl">
        {
          title
        }
      </h2>


      {description && (
        <p className="mt-4 text-sm leading-8 text-[#7a8578] sm:text-base">
          {
            description
          }
        </p>
      )}

    </div>
  );
}


/* =====================================
   FAQ
===================================== */

function FaqSection({
  title,
  description,
  items,
}) {
  const [
    openIndex,
    setOpenIndex,
  ] = useState(0);


  return (
    <section className="border-y border-[#e2e8df] bg-white py-20">

      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.7fr_1.3fr]">

        <div>

          <p className="text-xs font-black text-[#6a7767]">
            الأسئلة الشائعة
          </p>


          <h2 className="mt-3 text-3xl font-black text-[#263024] sm:text-4xl">
            {
              title
            }
          </h2>


          <p className="mt-4 max-w-lg text-sm leading-8 text-[#7c877a]">
            {
              description
            }
          </p>

        </div>


        <div className="space-y-3">

          {items.map(
            (
              item,
              index
            ) => {
              const opened =
                openIndex ===
                index;


              return (
                <div
                  key={
                    item.id ||
                    index
                  }
                  className="overflow-hidden rounded-2xl border border-[#dfe6dc] bg-[#fbfcfa]"
                >

                  <button
                    type="button"
                    onClick={() =>
                      setOpenIndex(
                        opened
                          ? -1
                          : index
                      )
                    }
                    className="flex w-full items-center justify-between gap-5 px-5 py-5 text-right"
                  >

                    <span className="font-black text-[#30392e]">
                      {
                        item.question
                      }
                    </span>


                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-[#6c7967] transition ${
                        opened
                          ? "rotate-180"
                          : ""
                      }`}
                    />

                  </button>


                  {opened && (
                    <div className="border-t border-[#e6ebe3] px-5 py-5 text-sm leading-7 text-[#788374]">
                      {
                        item.answer
                      }
                    </div>
                  )}

                </div>
              );
            }
          )}

        </div>

      </div>

    </section>
  );
}


export default Home;