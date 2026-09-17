import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  ShoppingBag,
  Users,
  Wrench,
  Truck,
  WalletCards,
  BarChart3,
  Settings,
  Tags,
  Star,
  ChevronRight,
  ChevronLeft,
  PanelsTopLeft,
} from "lucide-react";

import { NavLink } from "react-router-dom";


const menuGroups = [
  /* =====================================
     HOME
  ===================================== */

  {
    title: "الرئيسية",

    items: [
      {
        name: "لوحة التحكم",
        path: "/",
        icon: LayoutDashboard,
      },
    ],
  },


  /* =====================================
     STORE
  ===================================== */

  {
    title: "المتجر",

    items: [
      {
        name: "المنتجات",
        path: "/products",
        icon: Package,
      },

      {
        name: "التصنيفات",
        path: "/categories",
        icon: Tags,
      },

      {
        name: "المخزون",
        path: "/inventory",
        icon: Warehouse,
      },

      {
        name: "المبيعات",
        path: "/sales",
        icon: BarChart3,
      },

      {
        name: "الطلبات",
        path: "/orders",
        icon: ShoppingCart,
      },

      {
        name: "العملاء",
        path: "/customers",
        icon: Users,
      },

      {
        name: "المراجعات",
        path: "/reviews",
        icon: Star,
      },
    ],
  },


  /* =====================================
     SHOP
  ===================================== */

  {
    title: "المحل",

    items: [
      {
        name: "نقطة البيع",
        path: "/pos",
        icon: ShoppingCart,
      },

      {
        name: "الصيانة",
        path: "/repairs",
        icon: Wrench,
      },

      {
        name: "أرصدة العملاء",
        path: "/customer-balances",
        icon: WalletCards,
      },

      {
        name: "الموردون",
        path: "/suppliers",
        icon: Truck,
      },

      {
        name: "المشتريات",
        path: "/purchases",
        icon: ShoppingBag,
      },

      {
        name: "المصاريف",
        path: "/expenses",
        icon: WalletCards,
      },
    ],
  },


  /* =====================================
     STORE CONTENT
  ===================================== */

  {
    title: "محتوى المتجر",

    items: [
      {
        name: "محتوى المتجر",
        path: "/store-content",
        icon: PanelsTopLeft,
      },
    ],
  },


  /* =====================================
     ADMIN
  ===================================== */

  {
    title: "الإدارة",

    items: [
      {
        name: "التقارير",
        path: "/reports",
        icon: BarChart3,
      },

      {
        name: "الإعدادات",
        path: "/settings",
        icon: Settings,
      },

      {
        name: "المستخدمون",
        path: "/users",
        icon: Users,
      },
    ],
  },
];


function Sidebar({
  collapsed,
  onToggle,
}) {
  return (
    <aside
      className={`fixed right-0 top-0 z-40 flex h-screen flex-col border-l border-slate-200 bg-white transition-all duration-300 ${
        collapsed
          ? "w-20"
          : "w-72"
      }`}
    >

      {/* =================================
          LOGO
      ================================= */}

      <div className="flex h-20 items-center border-b border-slate-200 px-5">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-lg font-black text-white shadow-sm">
            O
          </div>

          {!collapsed && (
            <div className="min-w-0">

              <h1 className="truncate text-lg font-black text-slate-900">
                OPTICANA
              </h1>

              <p className="text-xs text-slate-400">
                نظام الإدارة
              </p>

            </div>
          )}

        </div>

      </div>


      {/* =================================
          NAVIGATION
      ================================= */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">

        <div className="space-y-6">

          {menuGroups.map(
            (group) => (
              <div
                key={
                  group.title
                }
              >

                {!collapsed && (
                  <p className="mb-2 px-3 text-[11px] font-bold tracking-wide text-slate-400">
                    {group.title}
                  </p>
                )}


                <div className="space-y-1">

                  {group.items.map(
                    (item) => {
                      const Icon =
                        item.icon;

                      return (
                        <NavLink
                          key={
                            item.path
                          }
                          to={
                            item.path
                          }
                          end={
                            item.path ===
                            "/"
                          }
                          title={
                            collapsed
                              ? item.name
                              : undefined
                          }
                          className={({
                            isActive,
                          }) =>
                            `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                              isActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`
                          }
                        >

                          <Icon
                            size={
                              19
                            }
                            className="shrink-0"
                          />

                          {!collapsed && (
                            <span>
                              {
                                item.name
                              }
                            </span>
                          )}

                        </NavLink>
                      );
                    }
                  )}

                </div>

              </div>
            )
          )}

        </div>

      </nav>


      {/* =================================
          COLLAPSE
      ================================= */}

      <div className="border-t border-slate-200 p-3">

        <button
          type="button"
          onClick={
            onToggle
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >

          {collapsed ? (
            <ChevronLeft
              size={18}
            />
          ) : (
            <>
              <ChevronRight
                size={18}
              />

              <span>
                تصغير القائمة
              </span>
            </>
          )}

        </button>

      </div>

    </aside>
  );
}


export default Sidebar;