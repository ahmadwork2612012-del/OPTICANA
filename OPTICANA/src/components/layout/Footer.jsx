import {
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

import { QRCodeSVG } from "qrcode.react";

import {
  getStoreInfo,
} from "../../services/storeService";

import Loading from "../ui/Loading";
import { useLanguage } from "../../context/LanguageContext";


function Footer() {
  const { t, isEnglish } = useLanguage();
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


  // Address and bio are stored per language; fall back to the other
  // language when one of them was left empty.
  const address =
    (isEnglish
      ? store?.addressEn || store?.address
      : store?.address || store?.addressEn) ||
    "";

  const bio =
    (isEnglish
      ? store?.footerDescriptionEn || store?.footerDescription
      : store?.footerDescription || store?.footerDescriptionEn) ||
    "";


  const workingHours =
    store?.workingHours ||
    "";


  const whatsapp =
    store?.whatsapp ||
    store?.whatsappLink ||
    "";




  // Empty details are hidden instead of printing a "not added yet" note.
  const display =
    (value) =>
      value?.trim()
        ? value
        : "";


  return (
    <footer className="mt-12 overflow-hidden bg-[#20251f] text-white lg:mt-24">

      {/* TOP LINE */}

      <div className="h-px bg-gradient-to-r from-transparent via-[#B4C4AD] to-transparent" />


      {/* Phones get the bottom tab bar and the contact page instead of the
          full footer; only the copyright line below stays visible. */}
      <div className="mx-auto hidden max-w-7xl px-6 py-16 lg:block">

        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">


          {/* =================================
              BRAND
          ================================= */}

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">

                <img
                  src={
                    store?.mark ||
                    "/opticana-mark.png"
                  }
                  alt={
                    storeName
                  }
                  className="h-full w-full object-contain p-1.5"
                />

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


            {/* One element per line: the bio's line breaks survive the
                translation layer, and plaintext bidi keeps mixed-script
                lines in order. */}
            {bio && (
              <div className="mt-6 max-w-sm space-y-1 text-sm leading-7 text-[#b2b9af]">
                {bio.split("\n").filter((line) => line.trim()).map((line, index) => (
                  <p key={index} className="[unicode-bidi:plaintext]">
                    {line}
                  </p>
                ))}
              </div>
            )}


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
                  display(phone) ? (
                    <bdi dir="ltr">
                      {phone}
                    </bdi>
                  ) : ""
                }
                href={
                  phone
                    ? `tel:${phone.replace(/[^\d+]/g, "")}`
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
                // Skipped when the footer bio above already lists the address.
                value={
                  address && bio.includes(address.split(/[•،,]/)[0].trim())
                    ? ""
                    : display(address)
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


            {/* Quick WhatsApp sits with the other contact details. */}

            {whatsapp && (
              <div className="mt-7">
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

                <p className="mt-3 max-w-xs text-sm leading-7 text-[#969f93]">
                  للاستفسارات أو طلب المنتجات مباشرة، يمكنك التواصل معنا عبر واتساب.
                </p>
              </div>
            )}

          </div>


          {/* =================================
              LINKS PAGE (QR in its own column)
          ================================= */}

          {store?.linktree ? (
            <div>

              <h3 className="mb-5 text-sm font-black tracking-wide text-[#B4C4AD]">
                {t("كل روابطنا")}
              </h3>

              <a
                href={store.linktree}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-[#B4C4AD]/50"
              >
                <span className="rounded-xl bg-white p-2.5">
                  <QRCodeSVG
                    value={store.linktree}
                    size={120}
                    fgColor="#263024"
                    bgColor="#ffffff"
                    level="M"
                    title={t("كل روابطنا")}
                  />
                </span>

                <span className="text-xs leading-6 text-[#969f93]">
                  {t("امسح الكود بكاميرا الموبايل")}
                </span>
              </a>

            </div>
          ) : null}

        </div>

      </div>


      {/* =================================
          BOTTOM
      ================================= */}

      <div className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-center text-xs font-bold text-[#7f887d] sm:flex-row sm:items-center sm:justify-between sm:text-start">

          <p>
            ©{" "}
            {currentYear}{" "}
            {storeName}.
            {" "}
            جميع الحقوق محفوظة.
          </p>


          <div className="flex items-center justify-center gap-4 sm:justify-end">
            <Link
              to="/manage"
              className="text-[10px] font-black text-[#5f695c] transition hover:text-[#B4C4AD]"
            >
              {t("إدارة المتجر")}
            </Link>
            <p className="text-[#6f786d]">
              {slogan}
            </p>
          </div>

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
  if (!value) {
    return null;
  }

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
