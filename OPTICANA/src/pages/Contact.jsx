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
import { useLanguage } from "../context/LanguageContext";


/* =====================================
   CONTACT
===================================== */

function normalizeMapEmbedUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (!/(^|\.)google\.[a-z.]+$/i.test(url.hostname) || url.pathname.includes("/maps/embed")) return raw;
    // Place links shared from the Maps app carry the place id either as
    // ?cid=<decimal> or as "!1s0x<hex>:0x<hex>" (the second hex is the cid).
    const hexCid = raw.match(/!1s0x[0-9a-f]+:0x([0-9a-f]+)/i)?.[1];
    const cid = url.searchParams.get("cid") || (hexCid ? BigInt(`0x${hexCid}`).toString() : "");
    if (/^\d+$/.test(cid)) return `https://www.google.com/maps/embed?origin=mfe&pb=!1m3!3m2!1m1!4s${cid}`;
    const query = url.searchParams.get("q") || url.searchParams.get("query");
    const place = url.pathname.match(/\/maps\/place\/([^/?]+)/i)?.[1];
    const coordinates = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)?.slice(1).join(",");
    const location = query || (place ? decodeURIComponent(place).replace(/\+/g, " ") : coordinates);
    return location
      ? `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`
      : raw;
  } catch {
    return raw;
  }
}

function Contact() {
  const { isEnglish } = useLanguage();

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


  // Stored per language; falls back to the other one when left empty.
  const address =
    (isEnglish
      ? store?.addressEn || store?.address
      : store?.address || store?.addressEn) ||
    "";


  const workingHours =
    store?.workingHours ||
    "";


  const mapUrl =
    store?.mapUrl ||
    "";

  const mapEmbedUrl = normalizeMapEmbedUrl(mapUrl);


  const instagram =
    store?.instagram ||
    "";


  const facebook =
    store?.facebook ||
    "";


  const tiktok =
    store?.tiktok ||
    "";


  const branches =
    store?.branches ||
    [];


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



            <h1 className="text-5xl font-black tracking-tight text-[#20251f] sm:text-6xl">
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
                CONTACT DETAILS (one card beside the map)
            ================================= */}

            <div className="flex flex-col rounded-[2rem] border border-[#dfe6dc] bg-white p-6 shadow-sm sm:p-8">

              <h2 className="text-xl font-black text-[#263024]">
                معلومات التواصل
              </h2>

              <div className="mt-5 divide-y divide-[#EFE8E2]">

                <ContactRow
                  icon={Phone}
                  label="الهاتف"
                  value={phone ? <bdi dir="ltr">{phone}</bdi> : ""}
                  href={phone ? `tel:${phone.replace(/[^d+]/g, "")}` : undefined}
                />

                <ContactRow
                  icon={MessageCircle}
                  label="واتساب"
                  value={hasWhatsapp ? "تواصل معنا مباشرة" : ""}
                  href={hasWhatsapp ? `https://wa.me/${whatsapp}` : undefined}
                  external
                />

                <ContactRow
                  icon={Mail}
                  label="البريد الإلكتروني"
                  value={email}
                  href={email ? `mailto:${email}` : undefined}
                />

                <ContactRow
                  icon={Clock}
                  label="ساعات العمل"
                  value={workingHours}
                />

              </div>


              {/* Branches: each one opens its own place on Google Maps. */}

              {branches.length > 0 ? (
                <>
                  <h3 className="mt-7 text-sm font-black text-[#687565]">
                    فروعنا
                  </h3>

                  <div className="mt-3 space-y-3">
                    {branches.map((branch, index) => (
                      <a
                        key={index}
                        href={branch.mapUrl || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-4 rounded-2xl border border-[#e3e9e0] bg-[#fbfcfa] p-4 transition hover:border-[#B4C4AD] hover:bg-[#f3f6f1]"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFE8E2] text-[#63715f]">
                          <MapPin size={20} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-black text-[#30392e]">
                            {(isEnglish ? branch.nameEn || branch.name : branch.name || branch.nameEn)}
                          </span>
                          {branch.mapUrl && (
                            <span className="mt-1 block text-xs font-bold text-[#8a9487]">
                              افتح على الخريطة
                            </span>
                          )}
                        </span>

                        {branch.mapUrl && (
                          <ArrowLeft size={17} className="shrink-0 text-[#8a9487] transition group-hover:text-[#4c5949]" />
                        )}
                      </a>
                    ))}
                  </div>
                </>
              ) : address ? (
                <div className="mt-5 border-t border-[#EFE8E2] pt-5">
                  <ContactRow icon={MapPin} label="عنوان المحل" value={address} />
                </div>
              ) : null}

            </div>



            {/* =================================
                MAP
            ================================= */}

            <div className="overflow-hidden rounded-[2rem] border border-[#dfe6dc] bg-white shadow-sm">

              {hasMap ? (
                <iframe
                  src={
                    mapEmbedUrl
                  }
                  title="موقع OPTICANA"
                  className="h-[380px] w-full border-0 sm:h-[500px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="flex min-h-[380px] h-full flex-col items-center justify-center bg-[#EFE8E2] p-8 text-center sm:min-h-[500px]">

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
                    تواصلوا معنا عبر واتساب لمعرفة أقرب فرع.
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

      <section className="border-y border-[#e2e7df] bg-[#EFE8E2] py-16">

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
                تابعونا لتعرفوا أحدث التشكيلات والعروض أول بأول.
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

        <div className="rounded-[2.5rem] bg-[#B4C4AD] p-8 text-white sm:p-12">

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
   CONTACT ROW
===================================== */

// One line of the contact card; hidden when the store left it empty.
function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  external = false,
}) {
  if (!value) {
    return null;
  }

  const content = (
    <div className="flex items-center gap-4 py-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFE8E2] text-[#63715f]">
        <Icon size={20} />
      </span>

      <span className="min-w-0">
        <span className="block text-xs font-black text-[#8a9487]">
          {label}
        </span>
        <span className="mt-1 block break-words text-sm font-black text-[#30392e]">
          {value}
        </span>
      </span>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="block transition hover:opacity-80"
    >
      {content}
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
      className="inline-flex items-center gap-2 rounded-xl border border-[#d2ddd0] bg-white px-4 py-3 text-xs font-black text-[#52604e] transition hover:-translate-y-0.5 hover:border-[#B4C4AD] hover:bg-[#EFE8E2]"
    >
      {content}
    </a>
  );
}


export default Contact;
