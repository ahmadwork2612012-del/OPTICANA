import {
  Heart,
  Menu,
  MessageCircle,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  Link,
} from "react-router-dom";

import useCartStore from "../../store/cartStore";
import useFavoriteStore from "../../store/favoriteStore";
import SearchDrawer from "../ui/SearchDrawer";
import useSearchStore from "../../store/searchStore";

import {
  getStoreInfo,
} from "../../services/storeService";


/* =====================================
   COUNT BADGE
===================================== */

function CountBadge({
  count,
}) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2f382c] px-1 text-[10px] font-black text-white shadow-sm">
      {count > 99
        ? "99+"
        : count}
    </span>
  );
}


/* =====================================
   NAVBAR
===================================== */

function Navbar() {
  const {
    filters,
    setFilters,
    searchOpen,
    openSearch,
    closeSearch,
  } = useSearchStore();


  const cart =
    useCartStore(
      (state) =>
        state.cart
    );


  const favorites =
    useFavoriteStore(
      (state) =>
        state.favorites
    );


  const [
    store,
    setStore,
  ] = useState(null);


  const [
    isOpen,
    setIsOpen,
  ] = useState(false);


  /* =====================================
     LOAD STORE
  ===================================== */

  useEffect(() => {
    let mounted = true;


    async function loadStore() {
      try {
        const data =
          await getStoreInfo();


        if (mounted) {
          setStore(
            data || {}
          );
        }
      } catch (error) {
        console.error(
          "Navbar store data:",
          error
        );


        if (mounted) {
          setStore({});
        }
      }
    }


    loadStore();


    return () => {
      mounted = false;
    };
  }, []);


  /* =====================================
     COUNTS
  ===================================== */

  const favoriteCount =
    favorites.length;


  const totalItems =
    cart.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.quantity ||
            0
        ),
      0
    );


  /* =====================================
     STORE DATA
  ===================================== */

  const storeName =
    store?.name ||
    "OPTICANA";


  const slogan =
    store?.slogan ||
    "عيونك أحلى معانا";


  const logo =
    store?.logo ||
    null;


  const whatsapp =
    store?.whatsapp ||
    store?.whatsappLink ||
    "";


  /* =====================================
     NAV LINKS
  ===================================== */

  const navLinks = [
    {
      name:
        "الرئيسية",
      path:
        "/",
    },

    {
      name:
        "المنتجات",
      path:
        "/products",
    },

    {
      name:
        "العروض",
      path:
        "/offers",
    },

    {
      name:
        "من نحن",
      path:
        "/about",
    },

    {
      name:
        "تواصل معنا",
      path:
        "/contact",
    },
  ];


  /* =====================================
     MOBILE
  ===================================== */

  const closeMobile =
    () => {
      setIsOpen(
        false
      );
    };


  return (
    <>
      {/* =================================
          DESKTOP
      ================================= */}

      <header className="sticky top-0 z-40 border-b border-[#e2e7df] bg-[#fbfcfa]/95 shadow-sm backdrop-blur-xl">

        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#B4C4AD] to-transparent" />


        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between gap-6 px-6">


          {/* =================================
              BRAND
          ================================= */}

          <Link
            to="/"
            className="group flex min-w-fit items-center gap-3"
          >

            {logo ? (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-[#dfe6dc]">
                <img
                  src={
                    logo
                  }
                  alt={
                    storeName
                  }
                  className="h-full w-full object-contain p-1.5"
                />
              </div>
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#B4C4AD] text-lg font-black text-[#263024]">
                O
              </div>
            )}


            <div className="hidden flex-col items-start sm:flex">

              <span className="text-[24px] font-black tracking-[0.07em] text-[#20251f] transition duration-300 group-hover:text-[#52614e] sm:text-[27px]">
                {storeName}
              </span>


              <span className="text-[10px] font-bold tracking-[0.05em] text-[#697565] sm:text-[11px]">
                {slogan}
              </span>

            </div>

          </Link>


          {/* =================================
              DESKTOP NAV
          ================================= */}

          <nav className="hidden items-center gap-7 lg:flex">

            {navLinks.map(
              (
                link
              ) => (
                <NavLink
                  key={
                    link.path
                  }
                  to={
                    link.path
                  }
                  end={
                    link.path ===
                    "/"
                  }
                  className={({
                    isActive,
                  }) =>
                    `group relative py-2 text-sm font-black transition ${
                      isActive
                        ? "text-[#465442]"
                        : "text-[#626c60] hover:text-[#3f4d3b]"
                    }`
                  }
                >

                  {({
                    isActive,
                  }) => (
                    <>
                      {
                        link.name
                      }

                      <span
                        className={`absolute bottom-0 right-0 h-[2px] rounded-full bg-[#657361] transition-all duration-300 ${
                          isActive
                            ? "w-full"
                            : "w-0 group-hover:w-3/4"
                        }`}
                      />

                    </>
                  )}

                </NavLink>
              )
            )}

          </nav>


          {/* =================================
              ACTIONS
          ================================= */}

          <div className="flex items-center gap-2">


            {/* SEARCH */}

            <button
              type="button"
              onClick={
                openSearch
              }
              aria-label="البحث"
              title="البحث"
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#dfe5dc] bg-white text-[#626c60] transition hover:border-[#B4C4AD] hover:bg-[#f0f4ed] hover:text-[#3f4d3b] md:flex"
            >
              <Search
                size={18}
              />
            </button>


            {/* FAVORITES */}

            <Link
              to="/favorites"
              aria-label="المفضلة"
              title="المفضلة"
              className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-[#dfe5dc] bg-white text-[#626c60] transition hover:border-[#B4C4AD] hover:bg-[#f0f4ed] hover:text-[#3f4d3b] md:flex"
            >

              <Heart
                size={18}
              />

              <CountBadge
                count={
                  favoriteCount
                }
              />

            </Link>


            {/* CART */}

            <Link
              to="/cart"
              aria-label="السلة"
              title="السلة"
              className="relative hidden h-10 w-10 items-center justify-center rounded-xl bg-[#2f382c] text-white transition hover:bg-[#3c4838] md:flex"
            >

              <ShoppingCart
                size={18}
              />

              <CountBadge
                count={
                  totalItems
                }
              />

            </Link>


            {/* WHATSAPP */}

            {whatsapp ? (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                aria-label="واتساب"
                title="واتساب"
                className="hidden h-10 items-center gap-2 rounded-xl border border-[#d8e1d4] bg-[#f0f4ed] px-3.5 text-xs font-black text-[#52604e] transition hover:border-[#B4C4AD] hover:bg-[#e7eee4] sm:flex"
              >

                <MessageCircle
                  size={17}
                />

                <span className="hidden xl:inline">
                  واتساب
                </span>

              </a>
            ) : (
              <div
                title="واتساب غير مضاف"
                className="hidden h-10 items-center gap-2 rounded-xl border border-[#e2e7df] bg-[#f7f8f5] px-3.5 text-xs font-black text-[#a0a99e] sm:flex"
              >

                <MessageCircle
                  size={17}
                />

                <span className="hidden xl:inline">
                  واتساب غير مضاف
                </span>

              </div>
            )}


            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() =>
                setIsOpen(
                  true
                )
              }
              aria-label="فتح القائمة"
              title="القائمة"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe5dc] bg-white text-[#5f6b5c] transition hover:border-[#B4C4AD] hover:bg-[#f0f4ed] md:hidden"
            >

              <Menu
                size={20}
              />

            </button>

          </div>

        </div>

      </header>


      {/* =================================
          MOBILE DRAWER
      ================================= */}

      {isOpen && (
        <div
          className="fixed inset-0 z-50"
          onClick={
            closeMobile
          }
        >

          <div className="absolute inset-0 bg-[#20271f]/35 backdrop-blur-sm" />


          <aside
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            className="absolute right-0 top-0 flex h-full w-[min(88vw,380px)] flex-col border-l border-[#dfe5dc] bg-[#fbfcfa] shadow-2xl"
          >


            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-[#e1e6df] p-5">

              <Link
                to="/"
                onClick={
                  closeMobile
                }
                className="group flex items-center gap-3"
              >

                {logo ? (
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-[#dfe6dc]">
                    <img
                      src={
                        logo
                      }
                      alt={
                        storeName
                      }
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B4C4AD] font-black text-[#263024]">
                    O
                  </div>
                )}


                <div className="flex flex-col items-start">

                  <span className="text-[20px] font-black tracking-[0.06em] text-[#20251f]">
                    {
                      storeName
                    }
                  </span>

                  <span className="text-[10px] font-bold text-[#697565]">
                    {
                      slogan
                    }
                  </span>

                </div>

              </Link>


              <button
                type="button"
                onClick={
                  closeMobile
                }
                aria-label="إغلاق القائمة"
                className="rounded-xl p-2 text-[#697366] hover:bg-[#eef2eb]"
              >

                <X
                  size={20}
                />

              </button>

            </div>


            {/* LINKS */}

            <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-5">

              {navLinks.map(
                (
                  link
                ) => (
                  <NavLink
                    key={
                      link.path
                    }
                    to={
                      link.path
                    }
                    end={
                      link.path ===
                      "/"
                    }
                    onClick={
                      closeMobile
                    }
                    className={({
                      isActive,
                    }) =>
                      `rounded-xl px-4 py-3.5 text-base font-black transition ${
                        isActive
                          ? "bg-[#2f382c] text-white"
                          : "text-[#4e5a4b] hover:bg-[#eef2eb]"
                      }`
                    }
                  >
                    {
                      link.name
                    }
                  </NavLink>
                )
              )}

            </nav>


            {/* MOBILE ACTIONS */}

            <div className="border-t border-[#e1e6df] p-5">

              <div className="grid grid-cols-3 gap-2">


                {/* SEARCH */}

                <button
                  type="button"
                  onClick={() => {
                    openSearch();
                    closeMobile();
                  }}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#dfe5dc] bg-white py-3 text-[#5f6b5c]"
                >

                  <Search
                    size={19}
                  />

                  <span className="text-[10px] font-black">
                    البحث
                  </span>

                </button>


                {/* FAVORITES */}

                <Link
                  to="/favorites"
                  onClick={
                    closeMobile
                  }
                  className="relative flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#dfe5dc] bg-white py-3 text-[#5f6b5c]"
                >

                  <Heart
                    size={19}
                  />

                  <span className="text-[10px] font-black">
                    المفضلة
                  </span>

                  <CountBadge
                    count={
                      favoriteCount
                    }
                  />

                </Link>


                {/* CART */}

                <Link
                  to="/cart"
                  onClick={
                    closeMobile
                  }
                  className="relative flex flex-col items-center justify-center gap-1.5 rounded-xl bg-[#2f382c] py-3 text-white"
                >

                  <ShoppingCart
                    size={19}
                  />

                  <span className="text-[10px] font-black">
                    السلة
                  </span>

                  <CountBadge
                    count={
                      totalItems
                    }
                  />

                </Link>

              </div>


              {/* WHATSAPP */}

              {whatsapp ? (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#B4C4AD] py-3.5 text-sm font-black text-[#263024]"
                >
                  <MessageCircle
                    size={18}
                  />

                  تواصل عبر واتساب
                </a>
              ) : (
                <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-[#dfe5dc] bg-white py-3.5 text-sm font-black text-[#9ba399]">
                  <MessageCircle
                    size={18}
                  />

                  واتساب غير مضاف
                </div>
              )}

            </div>

          </aside>

        </div>
      )}


      {/* =================================
          SEARCH DRAWER
      ================================= */}

      <SearchDrawer
        isOpen={
          searchOpen
        }
        onClose={
          closeSearch
        }
        filters={
          filters
        }
        setFilters={
          setFilters
        }
      />

    </>
  );
}


export default Navbar;