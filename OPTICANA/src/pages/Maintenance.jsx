import {
  Clock,
  MessageCircle,
  RefreshCw,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getStoreInfo,
  getStoreContent,
} from "../services/storeService";


function Maintenance() {
  const [
    store,
    setStore,
  ] = useState(null);

  const [
    content,
    setContent,
  ] = useState(null);


  useEffect(() => {
    let mounted = true;

    async function loadMaintenance() {
      try {
        const [
          nextStore,
          nextContent,
        ] = await Promise.all([
          getStoreInfo(),
          getStoreContent(),
        ]);

        if (!mounted) {
          return;
        }

        setStore(
          nextStore || {}
        );

        setContent(
          nextContent || {}
        );
      } catch (error) {
        console.error(
          "Maintenance:",
          error
        );

        if (mounted) {
          setStore({});
          setContent({});
        }
      }
    }

    loadMaintenance();

    return () => {
      mounted = false;
    };
  }, []);


  const maintenance =
    content?.maintenance ||
    store?.maintenance ||
    {};


  const title =
    maintenance.title ||
    "المتجر تحت الصيانة";

  const description =
    maintenance.description ||
    "نعمل حاليًا على تحسين تجربة OPTICANA. سنعود إليك قريبًا.";

  const image =
    maintenance.image ||
    null;

  const logo =
    maintenance.logo ||
    store?.logo ||
    null;

  const contactButtonText =
    maintenance.contactButtonText ||
    "تواصل معنا";

  const contactButtonLink =
    maintenance.contactButtonLink ||
    "";


  const whatsapp =
    store?.whatsapp ||
    store?.whatsappLink ||
    "";


  const handleRefresh =
    () => {
      window.location.reload();
    };


  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbfcfa] px-6 py-12 text-[#20251f]">

      {/* BACKGROUND */}

      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#dce6d8] opacity-70 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#eef1df] opacity-80 blur-3xl" />


      <div className="relative w-full max-w-5xl">

        <div className="overflow-hidden rounded-[2.5rem] border border-[#dfe6dc] bg-white shadow-2xl">

          <div className="grid min-h-[600px] lg:grid-cols-2">


            {/* =================================
                VISUAL
            ================================= */}

            <div className="relative min-h-[300px] overflow-hidden bg-[#eef2eb] lg:min-h-full">

              {image ? (
                <img
                  src={image}
                  alt={
                    title
                  }
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[300px] items-center justify-center bg-gradient-to-br from-[#eef2eb] via-white to-[#dfe8db] p-10 lg:min-h-[600px]">

                  {logo ? (
                    <img
                      src={logo}
                      alt={
                        store?.name ||
                        "OPTICANA"
                      }
                      className="max-h-40 max-w-[70%] object-contain"
                    />
                  ) : (
                    <div className="text-center">

                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[#B4C4AD] text-4xl font-black text-[#263024]">
                        O
                      </div>

                      <p className="mt-6 text-3xl font-black text-[#364132]">
                        {store?.name ||
                          "OPTICANA"}
                      </p>

                    </div>
                  )}

                </div>
              )}

              <div className="absolute inset-0 bg-[#20271f]/10" />

            </div>


            {/* =================================
                CONTENT
            ================================= */}

            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">

              {/* LOGO */}

              {logo && (
                <div className="mb-8">

                  <img
                    src={logo}
                    alt={
                      store?.name ||
                      "OPTICANA"
                    }
                    className="h-14 max-w-48 object-contain object-right"
                  />

                </div>
              )}


              {!logo && (
                <p className="text-sm font-black tracking-[0.08em] text-[#596655]">
                  {store?.name ||
                    "OPTICANA"}
                </p>
              )}


              {/* ICON */}

              <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef2eb] text-[#657361]">

                <Clock
                  size={27}
                />

              </div>


              {/* TITLE */}

              <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight text-[#20251f] sm:text-5xl">
                {title}
              </h1>


              {/* DESCRIPTION */}

              <p className="mt-5 max-w-xl text-sm leading-8 text-[#788374] sm:text-base">
                {description}
              </p>


              {/* ACTIONS */}

              <div className="mt-9 flex flex-wrap gap-3">

                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2f382c] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#3c4838]"
                  >
                    <MessageCircle
                      size={18}
                    />

                    {contactButtonText}

                  </a>
                )}


                {!whatsapp &&
                  contactButtonLink && (
                  <a
                    href={
                      contactButtonLink
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2f382c] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#3c4838]"
                  >
                    {contactButtonText}
                  </a>
                )}


                <button
                  type="button"
                  onClick={
                    handleRefresh
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-[#d4ded1] bg-white px-5 py-3.5 text-sm font-black text-[#4c5949] transition hover:border-[#B4C4AD] hover:bg-[#f1f4ee]"
                >
                  <RefreshCw
                    size={17}
                  />

                  تحديث الصفحة
                </button>

              </div>


              {/* SLOGAN */}

              <div className="mt-10 border-t border-[#e7ebe4] pt-6">

                <p className="text-xs font-bold text-[#9aa398]">
                  {store?.slogan ||
                    "عيونك أحلى معانا"}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}


export default Maintenance;