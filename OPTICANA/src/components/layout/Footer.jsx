import {
  ArrowUpLeft,
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
  getStoreInfo,
} from "../../services/storeService";

import Loading from "../ui/Loading";


function Footer() {
  const [
    store,
    setStore,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {
    let mounted = true;

    async function loadStore() {
      try {
        const data =
          await getStoreInfo();

        if (!mounted) {
          return;
        }

        setStore(
          data || {}
        );
      } catch (error) {
        console.error(
          "Footer store data:",
          error
        );

        if (mounted) {
          setStore({});
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadStore();

    return () => {
      mounted = false;
    };
  }, []);


  if (loading) {
    return (
      <footer className="mt-24 bg-[#20251f]">
        <div className="flex min-h-28 items-center justify-center">
          <Loading
            fullScreen={false}
            label="جاري تحميل معلومات المتجر..."
          />
        </div>
      </footer>
    );
  }


  const currentYear =
    new Date().getFullYear();


  const storeName =
    store?.name ||
    "OPTICANA";


  const slogan =
    store?.slogan ||
    "عيونك أحلى معانا";


  const phone =
    store?.phone ||
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


  const whatsapp =
    store?.whatsapp ||
    store?.whatsappLink ||
    "";


  const quickLinks =
    Array.isArray(
      store?.footerLinks
    ) &&
    store.footerLinks.length > 0
      ? store.footerLinks
      : [
          {
            label:
              "الرئيسية",
            path: "/",
          },
          {
            label:
              "المنتجات",
            path: "/products",
          },
          {
            label:
              "العروض",
            path: "/offers",
          },
          {
            label:
              "من نحن",
            path: "/about",
          },
          {
            label:
              "تواصل معنا",
            path: "/contact",
          },
        ];


  const display =
    (value) =>
      value?.trim()
        ? value
        : "لم تتم الإضافة بعد";


  return (
    <footer className="mt-24 overflow-hidden bg-[#20251f] text-white">

      {/* TOP LINE */}

      <div className="h-px bg-gradient-to-r from-transparent via-[#B4C4AD] to-transparent" />


      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.8fr_1fr_1fr]">


          {/* =================================
              BRAND
          ================================= */}

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#B4C4AD] font-black text-[#263024]">

                {store?.logo ? (
                  <img
                    src={
                      store.logo
                    }
                    alt={
                      storeName
                    }
                    className="h-full w-full object-contain p-1.5"
                  />
                ) : (
                  "O"
                )}

              </div>


              <div>

                <h2 className="text-2xl font-black">
                  {
                    storeName
                  }
                </h2>


                <p className="mt-0.5 text-xs font-bold text-[#B4C4AD]">
                  {
                    slogan
                  }
                </p>

              </div>

            </div>


            <p className="mt-6 max-w-sm text-sm leading-8 text-[#b2b9af]">
              {
                display(
                  store?.footerDescription
                )
              }
            </p>


            {/* SOCIAL */}

            <div className="mt-6 flex flex-wrap gap-2">

              <FooterLink
                href={
                  store?.instagram
                }
                label="Instagram"
              />

              <FooterLink
                href={
                  store?.facebook
                }
                label="Facebook"
              />

              <FooterLink
                href={
                  store?.tiktok
                }
                label="TikTok"
              />

            </div>

          </div>


          {/* =================================
              QUICK LINKS
          ================================= */}

          <div>

            <h3 className="mb-5 text-sm font-black tracking-wide text-[#B4C4AD]">
              روابط سريعة
            </h3>


            <ul className="space-y-3">

              {quickLinks.map(
                (
                  link,
                  index
                ) => (
                  <li
                    key={
                      link.id ||
                      link.path ||
                      link.label ||
                      index
                    }
                  >

                    <Link
                      to={
                        link.path ||
                        "/"
                      }
                      className="group inline-flex items-center gap-1.5 text-sm font-bold text-[#c2c8bf] transition hover:text-white"
                    >

                      {
                        link.label ||
                        "رابط"
                      }

                      <ArrowUpLeft
                        size={13}
                        className="opacity-0 transition group-hover:translate-x-[-2px] group-hover:opacity-100"
                      />

                    </Link>

                  </li>
                )
              )}

            </ul>

          </div>


          {/* =================================
              CONTACT
          ================================= */}

          <div>

            <h3 className="mb-5 text-sm font-black tracking-wide text-[#B4C4AD]">
              تواصل معنا
            </h3>


            <div className="space-y-4">


              <FooterContactItem
                icon={
                  Phone
                }
                label="الهاتف"
                value={
                  display(
                    phone
                  )
                }
                href={
                  phone
                    ? `tel:${phone}`
                    : undefined
                }
              />


              <FooterContactItem
                icon={
                  Mail
                }
                label="البريد الإلكتروني"
                value={
                  display(
                    email
                  )
                }
                href={
                  email
                    ? `mailto:${email}`
                    : undefined
                }
              />


              <FooterContactItem
                icon={
                  MapPin
                }
                label="العنوان"
                value={
                  display(
                    address
                  )
                }
              />


              <FooterContactItem
                icon={
                  MessageCircle
                }
                label="ساعات العمل"
                value={
                  display(
                    workingHours
                  )
                }
              />

            </div>

          </div>


          {/* =================================
              WHATSAPP
          ================================= */}

          <div>

            <h3 className="mb-5 text-sm font-black tracking-wide text-[#B4C4AD]">
              تواصل سريع
            </h3>


            {whatsapp ? (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#B4C4AD] px-5 py-3.5 text-sm font-black text-[#263024] transition hover:bg-[#c3d0bd]"
              >
                <MessageCircle
                  size={18}
                />

                واتساب
              </a>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-black text-[#7f887d]">
                <MessageCircle
                  size={18}
                />

                واتساب غير مضاف
              </div>
            )}


            <p className="mt-4 max-w-xs text-sm leading-7 text-[#969f93]">
              للاستفسارات أو طلب المنتجات مباشرة، يمكنك التواصل معنا عبر واتساب.
            </p>

          </div>

        </div>

      </div>


      {/* =================================
          BOTTOM
      ================================= */}

      <div className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-center text-xs font-bold text-[#7f887d] sm:flex-row sm:items-center sm:justify-between sm:text-right">

          <p>
            ©{" "}
            {currentYear}{" "}
            {storeName}.
            {" "}
            جميع الحقوق محفوظة.
          </p>


          <p className="text-[#6f786d]">
            {slogan}
          </p>

        </div>

      </div>

    </footer>
  );
}


/* =====================================
   CONTACT ITEM
===================================== */

function FooterContactItem({
  icon: Icon,
  label,
  value,
  href,
}) {
  const content = (
    <div className="flex items-start gap-3">

      <span className="mt-0.5 rounded-lg bg-white/5 p-2 text-[#B4C4AD]">
        <Icon
          size={15}
        />
      </span>


      <div className="min-w-0">

        <p className="text-[10px] font-black text-[#727b70]">
          {label}
        </p>


        <p className="mt-1 break-words text-sm font-bold text-[#c2c8bf]">
          {value}
        </p>

      </div>

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
      className="block transition hover:opacity-80"
    >
      {content}
    </a>
  );
}


/* =====================================
   SOCIAL LINK
===================================== */

function FooterLink({
  href,
  label,
}) {
  if (!href) {
    return (
      <span className="flex h-10 cursor-default items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-black text-[#7f887d]">
        {label}
      </span>
    );
  }


  return (
    <a
      href={
        href
      }
      target="_blank"
      rel="noreferrer"
      className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-black text-[#bfc7bb] transition hover:border-[#B4C4AD]/50 hover:bg-[#B4C4AD]/10 hover:text-[#B4C4AD]"
    >
      {label}
    </a>
  );
}


export default Footer;
