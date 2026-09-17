import {
  ArrowLeft,
  Check,
  Eye,
  Heart,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

import {
  getStoreContent,
  getStoreInfo,
} from "../services/storeService";

import Loading from "../components/ui/Loading";


/* =====================================
   ABOUT
===================================== */

function About() {
  const [
    content,
    setContent,
  ] = useState(null);

  const [
    store,
    setStore,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  /* =====================================
     LOAD CMS
  ===================================== */

  useEffect(() => {
    let mounted = true;


    async function loadAbout() {
      try {
        setLoading(true);


        const [
          nextContent,
          nextStore,
        ] = await Promise.all([
          getStoreContent(),
          getStoreInfo(),
        ]);


        if (!mounted) {
          return;
        }


        setContent(
          nextContent || {}
        );

        setStore(
          nextStore || {}
        );
      } catch (error) {
        console.error(
          "About 3.0:",
          error
        );


        if (mounted) {
          setContent({});
          setStore({});
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }


    loadAbout();


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
     CMS DATA
  ===================================== */

  const about =
    content?.about ||
    {};


  const title =
    about.title ||
    "من نحن";


  const description =
    about.description ||
    "نقدم في OPTICANA تجربة تجمع بين الأناقة والجودة والاهتمام بتفاصيل العميل.";


  const image =
    about.image ||
    null;


  const vision =
    about.vision ||
    "لم تتم إضافة رؤية المتجر بعد.";


  const mission =
    about.mission ||
    "لم تتم إضافة رسالة المتجر بعد.";


  const features =
    Array.isArray(
      about.features
    ) &&
    about.features.length > 0
      ? about.features
      : [
          {
            id:
              "placeholder-quality",
            title:
              "جودة موثوقة",
            description:
              "أضف وصف هذه الميزة من لوحة إدارة المتجر.",
          },
          {
            id:
              "placeholder-service",
            title:
              "خدمة مميزة",
            description:
              "أضف وصف هذه الميزة من لوحة إدارة المتجر.",
          },
          {
            id:
              "placeholder-variety",
            title:
              "تنوع المنتجات",
            description:
              "أضف وصف هذه الميزة من لوحة إدارة المتجر.",
          },
          {
            id:
              "placeholder-support",
            title:
              "دعم مستمر",
            description:
              "أضف وصف هذه الميزة من لوحة إدارة المتجر.",
          },
        ];


  const stats =
    Array.isArray(
      about.stats
    ) &&
    about.stats.length > 0
      ? about.stats
      : [
          {
            id:
              "placeholder-stat-1",
            value:
              "—",
            label:
              "إحصائية المتجر",
          },
          {
            id:
              "placeholder-stat-2",
            value:
              "—",
            label:
              "إحصائية المتجر",
          },
          {
            id:
              "placeholder-stat-3",
            value:
              "—",
            label:
              "إحصائية المتجر",
          },
          {
            id:
              "placeholder-stat-4",
            value:
              "—",
            label:
              "إحصائية المتجر",
          },
        ];


  const storeName =
    store?.name ||
    "OPTICANA";


  const slogan =
    store?.slogan ||
    "عيونك أحلى معانا";


  return (
    <main className="overflow-hidden bg-[#fbfcfa] text-[#20251f]">


      {/* =====================================
          HERO
      ===================================== */}

      <section className="relative overflow-hidden border-b border-[#e2e7df] bg-white">

        <div className="pointer-events-none absolute -right-28 top-0 h-80 w-80 rounded-full bg-[#dfe9db] opacity-70 blur-3xl" />

        <div className="pointer-events-none absolute -left-28 bottom-0 h-72 w-72 rounded-full bg-[#eef1df] opacity-80 blur-3xl" />


        <div className="relative mx-auto flex min-h-[62vh] max-w-7xl flex-col-reverse items-center justify-between gap-12 px-6 py-16 lg:flex-row lg:py-20">


          {/* TEXT */}

          <motion.div
            initial={{
              opacity: 0,
              x: 35,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="w-full lg:w-[50%]"
          >

            <div className="max-w-2xl">

              <span className="inline-flex items-center gap-2 rounded-full bg-[#eef2eb] px-4 py-2 text-xs font-black text-[#596655]">

                <Sparkles
                  size={14}
                />

                {slogan}

              </span>


              <h1 className="mt-7 text-5xl font-black leading-tight tracking-tight text-[#20251f] sm:text-6xl">
                {title}
              </h1>


              <p className="mt-7 max-w-xl text-base leading-8 text-[#727c70] sm:text-lg">
                {description}
              </p>


              <div className="mt-9 flex flex-wrap gap-3">

                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2f382c] px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#3c4838]"
                >
                  اكتشف منتجاتنا

                  <ArrowLeft
                    size={17}
                  />
                </Link>


                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#d4ded1] bg-white px-6 py-3.5 text-sm font-black text-[#4c5949] transition hover:border-[#B4C4AD] hover:bg-[#f1f4ee]"
                >
                  تواصل معنا
                </Link>

              </div>

            </div>

          </motion.div>


          {/* IMAGE */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.7,
              delay: 0.1,
            }}
            className="w-full lg:w-[44%]"
          >

            <div className="relative">

              <div className="absolute -inset-5 rounded-[3rem] bg-[#dce6d8]/70 blur-2xl" />


              <div className="relative aspect-[0.95] overflow-hidden rounded-[2.7rem] border border-white bg-[#eef2eb] shadow-2xl">

                {image ? (
                  <img
                    src={
                      image
                    }
                    alt={
                      title
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#eef2eb] via-white to-[#dfe8db] p-10 text-center">

                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#B4C4AD] text-3xl font-black text-[#283226]">
                      O
                    </div>


                    <p className="mt-6 text-2xl font-black text-[#364132]">
                      {
                        storeName
                      }
                    </p>


                    <p className="mt-2 text-sm font-bold text-[#788374]">
                      أضف صورة قسم "من نحن" من لوحة الإدارة
                    </p>

                  </div>
                )}

              </div>

            </div>

          </motion.div>

        </div>

      </section>


      {/* =====================================
          VISION / MISSION
      ===================================== */}

      <section className="py-20 sm:py-24">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid gap-6 lg:grid-cols-2">


            <InfoCard
              icon={
                Eye
              }
              eyebrow="رؤيتنا"
              title="إلى أين نتجه؟"
              description={
                vision
              }
            />


            <InfoCard
              icon={
                Target
              }
              eyebrow="رسالتنا"
              title="ماذا نقدم؟"
              description={
                mission
              }
            />

          </div>

        </div>

      </section>


      {/* =====================================
          FEATURES
      ===================================== */}

      <section className="border-y border-[#e2e7df] bg-white py-20">

        <div className="mx-auto max-w-7xl px-6">

          <div className="max-w-2xl">

            <p className="text-xs font-black text-[#687565]">
              لماذا نحن؟
            </p>

            <h2 className="mt-2 text-4xl font-black text-[#263024]">
              ما الذي يميز {
                storeName
              }؟
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#7d8879]">
              هذه المزايا يتم التحكم بها بالكامل من لوحة إدارة المتجر.
            </p>

          </div>


          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">

            {features
              .slice(
                0,
                4
              )
              .map(
                (
                  feature,
                  index
                ) => (
                  <FeatureCard
                    key={
                      feature.id ||
                      index
                    }
                    feature={
                      feature
                    }
                    index={
                      index
                    }
                  />
                )
              )}

          </div>

        </div>

      </section>


      {/* =====================================
          STATS
      ===================================== */}

      <section className="py-20">

        <div className="mx-auto max-w-7xl px-6">

          <div className="rounded-[2rem] bg-[#2f382c] p-7 text-white sm:p-10">

            <div className="mb-8">

              <p className="text-xs font-black text-[#B4C4AD]">
                {storeName}
              </p>

              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                {about.statsTitle ||
                  "OPTICANA بالأرقام"}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
                {about.statsDescription ||
                  "إحصائيات المتجر قابلة للتحديث من لوحة الإدارة."}
              </p>

            </div>


            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

              {stats
                .slice(
                  0,
                  4
                )
                .map(
                  (
                    stat,
                    index
                  ) => (
                    <motion.div
                      key={
                        stat.id ||
                        index
                      }
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        delay:
                          index *
                          0.06,
                      }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center"
                    >

                      <p className="text-3xl font-black text-[#B4C4AD] sm:text-4xl">
                        {
                          stat.value
                        }
                      </p>

                      <p className="mt-2 text-xs font-bold text-white/55">
                        {
                          stat.label
                        }
                      </p>

                    </motion.div>
                  )
                )}

            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          CTA
      ===================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-24">

        <div className="relative overflow-hidden rounded-[2.5rem] border border-[#dce5d8] bg-[#eef2eb] p-8 sm:p-12">

          <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#B4C4AD]/50 blur-3xl" />


          <div className="relative flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">

            <div className="max-w-2xl">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#B4C4AD] text-[#263024]">

                <Heart
                  size={22}
                />

              </div>


              <h2 className="mt-5 text-3xl font-black text-[#263024] sm:text-4xl">
                {
                  about.ctaTitle ||
                  storeName
                }
              </h2>


              <p className="mt-3 text-sm leading-8 text-[#71806e]">
                {
                  about.ctaDescription ||
                  slogan
                }
              </p>

            </div>


            <Link
              to={
                about.ctaLink ||
                "/products"
              }
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#2f382c] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#3c4838]"
            >
              {
                about.ctaButtonText ||
                "تسوق الآن"
              }

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


/* =====================================
   INFO CARD
===================================== */

function InfoCard({
  icon: Icon,
  eyebrow,
  title,
  description,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      className="rounded-[2rem] border border-[#dfe6dc] bg-white p-7 shadow-sm sm:p-9"
    >

      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#eef2eb] text-[#657361]">

        <Icon
          size={24}
        />

      </div>


      <p className="mt-7 text-xs font-black text-[#71806e]">
        {
          eyebrow
        }
      </p>


      <h2 className="mt-2 text-2xl font-black text-[#263024] sm:text-3xl">
        {
          title
        }
      </h2>


      <p className="mt-4 text-sm leading-8 text-[#788374]">
        {
          description
        }
      </p>

    </motion.div>
  );
}


/* =====================================
   FEATURE CARD
===================================== */

function FeatureCard({
  feature,
  index,
}) {
  const icons = [
    Sparkles,
    Heart,
    Users,
    Check,
  ];


  const Icon =
    icons[
      index %
        icons.length
    ];


  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        delay:
          index *
          0.05,
      }}
      className="rounded-[1.75rem] border border-[#e0e6dd] bg-[#fbfcfa] p-5 transition hover:-translate-y-1 hover:border-[#cbd7c7] hover:shadow-lg sm:p-6"
    >

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8eee5] text-[#586654]">

        <Icon
          size={21}
        />

      </div>


      <h3 className="mt-5 text-base font-black text-[#30392e] sm:text-lg">
        {
          feature.title ||
          "ميزة جديدة"
        }
      </h3>


      <p className="mt-2 text-xs leading-6 text-[#808a7d] sm:text-sm">
        {
          feature.description ||
          "يمكن إضافة وصف هذه الميزة من لوحة الإدارة."
        }
      </p>

    </motion.div>
  );
}


export default About;