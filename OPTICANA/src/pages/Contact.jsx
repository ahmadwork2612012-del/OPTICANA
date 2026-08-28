import {
  ArrowLeft,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
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
   CONTACT
===================================== */

function Contact() {
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
     LOAD ADMIN DATA
  ===================================== */

  useEffect(() => {
    let mounted = true;


    async function loadContact() {
      try {
        setLoading(
          true
        );


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
          "Contact 3.0:",
          error
        );


        if (mounted) {
          setContent({});
          setStore({});
        }
      } finally {
        if (mounted) {
          setLoading(
            false
          );
        }
      }
    }


    loadContact();


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
     CMS
  ===================================== */

  const contact =
    content?.contact ||
    {};


  const title =
    contact.title ||
    "تواصل معنا";


  const description =
    contact.description ||
    "يسعدنا استقبال استفساراتك ومساعدتك في اختيار ما يناسبك.";


  /* =====================================
     STORE DATA
  ===================================== */

  const storeName =
    store?.name ||
    "OPTICANA";


  const phone =
    store?.phone ||
    "";


  const whatsapp =
    store?.whatsapp ||
    store?.whatsappLink ||
    "";


  const email =
    store?.email ||
    "";


  const address =
    store?.address ||
    "";


  const workingHours =
    store?.workingHours ||
    "";


  const mapUrl =
    store?.mapUrl ||
    "";


  const instagram =
    store?.instagram ||
    "";


  const facebook =
    store?.facebook ||
    "";


  const tiktok =
    store?.tiktok ||
    "";


  /* =====================================
     DISPLAY HELPERS
  ===================================== */

  const displayValue = (
    value
  ) =>
    value?.trim()
      ? value
      : "لم تتم الإضافة بعد";


  const hasWhatsapp =
    Boolean(
      whatsapp?.trim()
    );


  const hasMap =
    Boolean(
      mapUrl?.trim()
    );


  return (
    <main className="overflow-hidden bg-[#fbfcfa] text-[#20251f]">


      {/* =====================================
          HERO
      ===================================== */}

      <section className="border-b border-[#e2e7df] bg-white">

        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration:
                0.6,
            }}
            className="max-w-3xl"
          >

            <span className="inline-flex items-center rounded-full bg-[#eef2eb] px-4 py-2 text-xs font-black text-[#5c6b58]">
              {storeName}
            </span>


            <h1 className="mt-5 text-5xl font-black tracking-tight text-[#20251f] sm:text-6xl">
              {title}
            </h1>


            <p className="mt-5 max-w-2xl text-sm leading-8 text-[#788374] sm:text-base">
              {description}
            </p>

          </motion.div>

        </div>

      </section>


      {/* =====================================
          CONTACT CONTENT
      ===================================== */}

      <section className="py-16 sm:py-20">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">


            {/* =================================
                CONTACT CARDS
            ================================= */}

            <div className="grid grid-cols-2 gap-3 sm:gap-5">


              {/* PHONE */}

              <ContactCard
                icon={
                  Phone
                }
                title="الهاتف"
                value={
                  displayValue(
                    phone
                  )
                }
                href={
                  phone
                    ? `tel:${phone}`
                    : undefined
                }
                muted={
                  !phone
                }
              />


              {/* WHATSAPP */}

              <ContactCard
                icon={
                  MessageCircle
                }
                title="واتساب"
                value={
                  hasWhatsapp
                    ? "تواصل معنا مباشرة"
                    : "لم تتم الإضافة بعد"
                }
                href={
                  hasWhatsapp
                    ? `https://wa.me/${whatsapp}`
                    : undefined
                }
                external={
                  hasWhatsapp
                }
                muted={
                  !hasWhatsapp
                }
              />


              {/* EMAIL */}

              <ContactCard
                icon={
                  Mail
                }
                title="البريد الإلكتروني"
                value={
                  displayValue(
                    email
                  )
                }
                href={
                  email
                    ? `mailto:${email}`
                    : undefined
                }
                muted={
                  !email
                }
              />


              {/* WORKING HOURS */}

              <ContactCard
                icon={
                  Clock
                }
                title="ساعات العمل"
                value={
                  displayValue(
                    workingHours
                  )
                }
                muted={
                  !workingHours
                }
              />


              {/* ADDRESS */}

              <div className="col-span-2 rounded-[1.75rem] border border-[#dfe6dc] bg-white p-6 shadow-sm sm:p-7">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef2eb] text-[#63715f]">
                    <MapPin
                      size={
                        20
                      }
                    />
                  </div>


                  <div className="min-w-0">

                    <p className="text-sm font-black text-[#30392e]">
                      عنوان المحل
                    </p>


                    <p
                      className={`mt-2 text-sm leading-7 ${
                        address
                          ? "text-[#7a8578]"
                          : "text-[#a0a99e]"
                      }`}
                    >
                      {
                        displayValue(
                          address
                        )
                      }
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================
                MAP
            ================================= */}

            <div className="overflow-hidden rounded-[2rem] border border-[#dfe6dc] bg-white shadow-sm">

              {hasMap ? (
                <iframe
                  src={
                    mapUrl
                  }
                  title="موقع OPTICANA"
                  className="h-[380px] w-full border-0 sm:h-[500px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="flex min-h-[380px] h-full flex-col items-center justify-center bg-[#eef2eb] p-8 text-center sm:min-h-[500px]">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#B4C4AD] text-[#263024]">

                    <MapPin
                      size={
                        30
                      }
                    />

                  </div>


                  <h2 className="mt-5 text-xl font-black text-[#30392e]">
                    موقع {storeName}
                  </h2>


                  <p className="mt-2 max-w-sm text-sm leading-7 text-[#7d8879]">
                    لم تتم إضافة رابط الخريطة بعد.
                  </p>


                  <p className="mt-4 text-xs font-bold text-[#9aa398]">
                    يمكن إضافته من لوحة إدارة المتجر.
                  </p>

                </div>
              )}

            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          SOCIAL
      ===================================== */}

      <section className="border-y border-[#e2e7df] bg-[#eef2eb] py-16">

        <div className="mx-auto max-w-7xl px-6">

          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">


            <div>

              <p className="text-xs font-black text-[#687565]">
                تابعنا
              </p>


              <h2 className="mt-2 text-3xl font-black text-[#263024]">
                ابقَ قريبًا من {storeName}
              </h2>


              <p className="mt-3 text-sm leading-7 text-[#788374]">
                جميع روابط التواصل الاجتماعي يتم التحكم بها من لوحة الإدارة.
              </p>

            </div>


            <div className="flex flex-wrap gap-2">


              <SocialButton
                href={
                  whatsapp
                    ? `https://wa.me/${whatsapp}`
                    : undefined
                }
                label="واتساب"
                icon={
                  MessageCircle
                }
                external={
                  hasWhatsapp
                }
                disabled={
                  !hasWhatsapp
                }
              />


              <SocialButton
                href={
                  instagram
                    ? instagram
                    : undefined
                }
                label="Instagram"
                external={
                  Boolean(
                    instagram
                  )
                }
                disabled={
                  !instagram
                }
              />


              <SocialButton
                href={
                  facebook
                    ? facebook
                    : undefined
                }
                label="Facebook"
                external={
                  Boolean(
                    facebook
                  )
                }
                disabled={
                  !facebook
                }
              />


              <SocialButton
                href={
                  tiktok
                    ? tiktok
                    : undefined
                }
                label="TikTok"
                external={
                  Boolean(
                    tiktok
                  )
                }
                disabled={
                  !tiktok
                }
              />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          CTA
      ===================================== */}

      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="rounded-[2.5rem] bg-[#2f382c] p-8 text-white sm:p-12">

          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

            <div className="max-w-2xl">

              <p className="text-xs font-black text-[#B4C4AD]">
                {storeName}
              </p>


              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                هل لديك استفسار؟
              </h2>


              <p className="mt-3 text-sm leading-7 text-white/60">
                تواصل معنا أو تصفح منتجاتنا واكتشف المجموعة المتاحة.
              </p>

            </div>


            <div className="flex flex-wrap gap-3">

              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-[#B4C4AD] px-6 py-3.5 text-sm font-black text-[#263024] transition hover:bg-[#c3d0bd]"
              >
                تصفح المنتجات

                <ArrowLeft
                  size={
                    17
                  }
                />
              </Link>


              {hasWhatsapp ? (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10"
                >
                  <MessageCircle
                    size={
                      18
                    }
                  />

                  واتساب

                </a>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3.5 text-sm font-black text-white/40">
                  <MessageCircle
                    size={
                      18
                    }
                  />

                  واتساب غير مضاف
                </div>
              )}

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


/* =====================================
   CONTACT CARD
===================================== */

function ContactCard({
  icon: Icon,
  title,
  value,
  href,
  external = false,
  muted = false,
}) {
  const content = (
    <div className="flex h-full flex-col rounded-[1.75rem] border border-[#dfe6dc] bg-white p-5 shadow-sm transition sm:p-6">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef2eb] text-[#63715f]">
        <Icon
          size={
            20
          }
        />
      </div>


      <p className="mt-5 text-xs font-black text-[#8a9487]">
        {title}
      </p>


      <p
        className={`mt-2 break-words text-sm font-black leading-6 ${
          muted
            ? "text-[#a1aaa0]"
            : "text-[#30392e]"
        }`}
      >
        {value}
      </p>

    </div>
  );


  if (!href) {
    return content;
  }


  return (
    <a
      href={
        href
      }
      target={
        external
          ? "_blank"
          : undefined
      }
      rel={
        external
          ? "noreferrer"
          : undefined
      }
      className="group"
    >
      <div className="transition group-hover:-translate-y-1 group-hover:shadow-lg">
        {content}
      </div>
    </a>
  );
}


/* =====================================
   SOCIAL BUTTON
===================================== */

function SocialButton({
  href,
  label,
  icon: Icon,
  external = false,
  disabled = false,
}) {
  const content = (
    <>
      {Icon && (
        <Icon
          size={
            16
          }
        />
      )}

      {label}
    </>
  );


  if (disabled) {
    return (
      <div className="inline-flex cursor-default items-center gap-2 rounded-xl border border-[#d2ddd0] bg-white/70 px-4 py-3 text-xs font-black text-[#a0a99e]">
        {content}
      </div>
    );
  }


  return (
    <a
      href={
        href
      }
      target={
        external
          ? "_blank"
          : undefined
      }
      rel={
        external
          ? "noreferrer"
          : undefined
      }
      className="inline-flex items-center gap-2 rounded-xl border border-[#d2ddd0] bg-white px-4 py-3 text-xs font-black text-[#52604e] transition hover:-translate-y-0.5 hover:border-[#B4C4AD] hover:bg-[#f7f9f5]"
    >
      {content}
    </a>
  );
}


export default Contact;
