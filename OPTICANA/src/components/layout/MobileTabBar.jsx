import { Heart, Home, LayoutGrid, Search, ShoppingBag } from "lucide-react";
import { NavLink } from "react-router-dom";

import useCartStore from "../../store/cartStore";
import useFavoriteStore from "../../store/favoriteStore";
import useSearchStore from "../../store/searchStore";
import { useLanguage } from "../../context/LanguageContext";

/*
  App-style bottom navigation for phones and small tablets. The header keeps
  the brand and menu; the actions people use most stay one thumb-tap away.
  Hidden from lg upwards, where the desktop header shows the same actions.
*/
function MobileTabBar() {
  const { t } = useLanguage();
  const openSearch = useSearchStore((state) => state.openSearch);
  const cartCount = useCartStore((state) =>
    state.cart.reduce((total, item) => total + Number(item.quantity || 0), 0)
  );
  const favoriteCount = useFavoriteStore((state) => state.favorites.length);

  const tabs = [
    { to: "/", label: "الرئيسية", icon: Home, end: true },
    { to: "/products", label: "المنتجات", icon: LayoutGrid },
    { label: "بحث", icon: Search, onClick: openSearch },
    { to: "/favorites", label: "المفضلة", icon: Heart, count: favoriteCount },
    { to: "/cart", label: "السلة", icon: ShoppingBag, count: cartCount },
  ];

  return (
    <>
      {/* Keeps the end of every page clear of the fixed bar. */}
      <div aria-hidden="true" className="h-[calc(68px+env(safe-area-inset-bottom))] lg:hidden" />

      <nav
        aria-label={t("التنقل الرئيسي")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e2e7df] bg-[#fbfcfa]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(38,48,36,0.08)] backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto grid h-[68px] max-w-md grid-cols-5">
          {tabs.map((tab) => (
            <li key={tab.label} className="flex">
              {tab.to ? (
                <NavLink to={tab.to} end={tab.end} className="flex-1">
                  {({ isActive }) => <TabContent tab={tab} active={isActive} t={t} />}
                </NavLink>
              ) : (
                <button type="button" onClick={tab.onClick} className="flex-1">
                  <TabContent tab={tab} active={false} t={t} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

function TabContent({ tab, active, t }) {
  const Icon = tab.icon;
  return (
    <span className={`flex h-full flex-col items-center justify-center gap-1 transition ${active ? "text-[#3f4d3b]" : "text-[#8a9487]"}`}>
      <span className={`relative flex h-8 w-12 items-center justify-center rounded-full transition ${active ? "bg-[#B4C4AD]/35" : ""}`}>
        <Icon size={20} strokeWidth={active ? 2.4 : 2} />
        {tab.count > 0 && (
          <span className="absolute -top-1 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#657361] px-1 text-[10px] font-black leading-none text-white">
            {tab.count > 99 ? "99+" : tab.count}
          </span>
        )}
      </span>
      <span className={`text-[10.5px] ${active ? "font-black" : "font-bold"}`}>{t(tab.label)}</span>
    </span>
  );
}

export default MobileTabBar;
