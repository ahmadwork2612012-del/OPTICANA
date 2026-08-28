import {
  Bell,
  Search,
  ChevronDown,
  CheckCheck,
  Trash2,
  X,
  ExternalLink,
  Package,
  Receipt,
  ShoppingBag,
  ClipboardList,
  Wrench,
  Users,
  Truck,
  CircleDollarSign,
  Info,
  Settings,
  LogOut,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import apiClient from "../../lib/apiClient";

import useAuthStore from "../../store/authStore";

import useNotificationStore from "../../store/notificationStore";


/* =====================================
   NOTIFICATION CONFIG
===================================== */

const NOTIFICATION_CONFIG = {
  stock: {
    icon: Package,
    className:
      "bg-orange-50 text-orange-600",
  },

  sale: {
    icon: Receipt,
    className:
      "bg-blue-50 text-blue-700",
  },

  purchase: {
    icon: ShoppingBag,
    className:
      "bg-emerald-50 text-emerald-600",
  },

  order: {
    icon: ClipboardList,
    className:
      "bg-violet-50 text-violet-700",
  },

  repair: {
    icon: Wrench,
    className:
      "bg-orange-50 text-orange-600",
  },

  customer: {
    icon: Users,
    className:
      "bg-blue-50 text-blue-700",
  },

  supplier: {
    icon: Truck,
    className:
      "bg-emerald-50 text-emerald-600",
  },

  payment: {
    icon: CircleDollarSign,
    className:
      "bg-emerald-50 text-emerald-600",
  },

  info: {
    icon: Info,
    className:
      "bg-slate-100 text-slate-600",
  },
};


/* =====================================
   TOPBAR
===================================== */

function Topbar() {
  const navigate =
    useNavigate();


  /* =====================================
     AUTH
  ===================================== */

  const user =
    useAuthStore(
      (state) => state.user
    );

  const logout =
    useAuthStore(
      (state) => state.logout
    );


  /* =====================================
     NOTIFICATION STORE
  ===================================== */

  const notifications =
    useNotificationStore(
      (state) =>
        state.notifications
    );

  const fetchNotifications =
    useNotificationStore(
      (state) =>
        state.fetchNotifications
    );

  const markAsRead =
    useNotificationStore(
      (state) =>
        state.markAsRead
    );

  const markAllAsRead =
    useNotificationStore(
      (state) =>
        state.markAllAsRead
    );

  const deleteNotification =
    useNotificationStore(
      (state) =>
        state.deleteNotification
    );


  /* =====================================
     BACKEND NOTIFICATIONS
  ===================================== */

  useEffect(() => {
    fetchNotifications().catch(() => {});
    const timer = window.setInterval(() => {
      fetchNotifications().catch(() => {});
    }, 30000);
    return () => window.clearInterval(timer);
  }, [fetchNotifications]);


  /* =====================================
     UI
  ===================================== */

  const [search, setSearch] =
    useState("");

  const [showSearch, setShowSearch] =
    useState(false);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [showUserMenu, setShowUserMenu] =
    useState(false);


  const searchRef =
    useRef(null);

  const notificationsRef =
    useRef(null);

  const userRef =
    useRef(null);


  /* =====================================
     UNREAD NOTIFICATIONS
  ===================================== */

  const unreadNotifications =
    useMemo(() => {
      return [...notifications]
        .filter(
          (notification) =>
            !notification.read
        )
        .sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
        );
    }, [notifications]);


  /* =====================================
     RECENT NOTIFICATIONS
     LAST 24 HOURS
  ===================================== */

  const recentNotifications =
    useMemo(() => {
      const cutoff =
        Date.now() -
        24 *
          60 *
          60 *
          1000;

      return [...notifications]
        .filter(
          (notification) => {
            const timestamp =
              new Date(
                notification.createdAt ||
                  0
              ).getTime();

            return (
              timestamp >=
              cutoff
            );
          }
        )
        .sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
        );
    }, [notifications]);


  const visibleNotifications =
    recentNotifications.slice(
      0,
      6
    );


  const notificationCount =
    unreadNotifications.length;


  /* =====================================
     GLOBAL SEARCH
  ===================================== */

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const value = search.trim();
    if (!showSearch || !value) {
      setSearchResults([]);
      setSearchLoading(false);
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await apiClient.get(`/admin/search?q=${encodeURIComponent(value)}&limit=24`);
        if (!cancelled) setSearchResults(Array.isArray(response) ? response : []);
      } catch (error) {
        if (!cancelled) {
          setSearchResults([]);
          toast.error(error?.message || "تعذر تنفيذ البحث");
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, showSearch]);

  /* =====================================
     KEYBOARD SHORTCUT
  ===================================== */

  useEffect(() => {
    const handleKeyDown =
      (event) => {
        if (
          event.key === "/" &&
          document.activeElement
            ?.tagName !==
            "INPUT" &&
          document.activeElement
            ?.tagName !==
            "TEXTAREA"
        ) {
          event.preventDefault();

          setShowSearch(
            true
          );

          setTimeout(() => {
            searchRef.current?.focus();
          }, 0);
        }


        if (
          event.key ===
          "Escape"
        ) {
          setShowSearch(
            false
          );

          setShowNotifications(
            false
          );

          setShowUserMenu(
            false
          );
        }
      };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, []);


  /* =====================================
     OUTSIDE CLICK
  ===================================== */

  useEffect(() => {
    const handleClickOutside =
      (event) => {
        if (
          notificationsRef.current &&
          !notificationsRef.current.contains(
            event.target
          )
        ) {
          setShowNotifications(
            false
          );
        }


        if (
          userRef.current &&
          !userRef.current.contains(
            event.target
          )
        ) {
          setShowUserMenu(
            false
          );
        }
      };


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);


  /* =====================================
     NOTIFICATION ROUTING
  ===================================== */

  const getNotificationPath =
    (
      notification
    ) => {
      const routes = {
        product:
          "/products",

        sale:
          "/sales",

        purchase:
          "/purchases",

        order:
          "/orders",

        repair:
          "/repairs",

        customer:
          "/customers",

        supplier:
          "/suppliers",

        payment:
          "/sales",

        inventory:
          "/inventory",

        expense:
          "/expenses",
      };

      return (
        routes[
          notification.entityType
        ] || null
      );
    };


  /* =====================================
     OPEN SEARCH RESULT
  ===================================== */

  const openResult =
    (result) => {
      navigate(
        result.path
      );

      setSearch("");

      setShowSearch(
        false
      );
    };


  /* =====================================
     OPEN NOTIFICATION
  ===================================== */

  const openNotification =
    (
      notification
    ) => {
      markAsRead(
        notification.id
      );

      const path =
        getNotificationPath(
          notification
        );

      if (path) {
        navigate(path);
      }

      setShowNotifications(
        false
      );
    };


  /* =====================================
     MARK ALL READ
  ===================================== */

  const handleMarkAllRead =
    () => {
      if (
        notificationCount ===
        0
      ) {
        return;
      }

      markAllAsRead();

      toast.success(
        "تم تعليم كل الإشعارات كمقروءة"
      );
    };


  /* =====================================
     DELETE NOTIFICATION
  ===================================== */

  const handleDelete =
    async (
      event,
      id
    ) => {
      event.stopPropagation();

      try {
        await deleteNotification(id);
        toast.success("تم حذف الإشعار");
      } catch (error) {
        toast.error(error?.message || "تعذر حذف الإشعار");
      }
    };


  /* =====================================
     SETTINGS
  ===================================== */

  const openSettings = () => {
    navigate(
      "/settings"
    );

    setShowUserMenu(
      false
    );
  };


  /* =====================================
     PROFILE
  ===================================== */

  const openProfile = () => {
    navigate(
      "/profile"
    );

    setShowUserMenu(
      false
    );
  };


  /* =====================================
     LOGOUT
  ===================================== */

  const handleLogout = () => {
    logout();

    setShowUserMenu(
      false
    );

    toast.success(
      "تم تسجيل الخروج"
    );

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };


  /* =====================================
     USER DISPLAY
  ===================================== */

  const userName =
    user?.name ||
    "المستخدم";

  const userRole =
    user?.role === "admin"
      ? "مدير النظام"
      : user?.role ===
          "manager"
        ? "مدير"
        : user?.role ===
            "cashier"
          ? "كاشير"
          : user?.role ===
              "inventory"
            ? "مسؤول المخزون"
            : user?.role ===
                "repair"
              ? "مسؤول الصيانة"
              : "موظف";

  const userInitial =
    userName
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() ||
    "أ";


  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">

      {/* =================================
          SEARCH
      ================================= */}

      <div className="relative">

        <div
          className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition md:w-[420px] ${
            showSearch
              ? "border-blue-300 bg-white ring-4 ring-blue-50"
              : ""
          }`}
        >

          <Search
            size={18}
            className="shrink-0 text-slate-400"
          />

          <input
            ref={
              searchRef
            }
            type="text"
            value={
              search
            }
            onFocus={() =>
              setShowSearch(
                true
              )
            }
            onChange={(
              event
            ) => {
              setSearch(
                event.target
                  .value
              );

              setShowSearch(
                true
              );
            }}
            placeholder="ابحث في النظام..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />


          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch(
                  ""
                );

                searchRef.current?.focus();
              }}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={15} />
            </button>
          )}


          {!search && (
            <kbd className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-400">
              /
            </kbd>
          )}

        </div>


        {/* Search Results */}

        {showSearch &&
          search.trim() && (
            <div className="absolute right-0 top-full z-50 mt-2 w-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

              <div className="border-b border-slate-100 px-4 py-3">

                <p className="text-xs font-bold text-slate-400">
                  نتائج البحث
                </p>

              </div>


              {searchLoading ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm font-bold text-slate-600">جاري البحث...</p>
                </div>
              ) : searchResults.length >
              0 ? (
                <div className="max-h-96 overflow-y-auto p-2">

                  {searchResults.map(
                    (
                      result
                    ) => {
                      const Icon =
                        result.icon ||
                        ({ product: Package, customer: Users, order: ClipboardList, sale: Receipt, purchase: ShoppingBag, repair: Wrench, supplier: Truck }[result.type] || Search);

                      return (
                        <button
                          key={
                            result.id
                          }
                          type="button"
                          onClick={() =>
                            openResult(
                              result
                            )
                          }
                          className="flex w-full items-center gap-3 rounded-xl p-3 text-right transition hover:bg-slate-50"
                        >

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <Icon
                              size={
                                18
                              }
                            />
                          </div>


                          <div className="min-w-0">

                            <p className="truncate text-sm font-black text-slate-800">
                              {
                                result.title
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {
                                result.description
                              }
                            </p>

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>
              ) : (
                <div className="px-6 py-10 text-center">

                  <Search
                    size={30}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-bold text-slate-600">
                    لا توجد نتائج
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    جرّب اسمًا أو رقمًا مختلفًا.
                  </p>

                </div>
              )}

            </div>
          )}

      </div>


      {/* =================================
          RIGHT SIDE
      ================================= */}

      <div className="flex items-center gap-3">

        {/* =================================
            NOTIFICATIONS
        ================================= */}

        <div
          ref={
            notificationsRef
          }
          className="relative"
        >

          <button
            type="button"
            onClick={() => {
              setShowNotifications(
                (current) =>
                  !current
              );

              setShowUserMenu(
                false
              );
            }}
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl border text-slate-500 transition ${
              showNotifications
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
            title="الإشعارات"
          >

            <Bell
              size={19}
            />

            {notificationCount >
              0 && (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
                {notificationCount >
                99
                  ? "99+"
                  : notificationCount}
              </span>
            )}

          </button>


          {/* Notification Dropdown */}

          {showNotifications && (
            <div className="absolute left-0 top-full z-50 mt-2 w-[390px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

              {/* Header */}

              <div className="flex items-center justify-between border-b border-slate-100 p-4">

                <div>

                  <div className="flex items-center gap-2">

                    <h3 className="font-black text-slate-900">
                      الإشعارات
                    </h3>

                    {notificationCount >
                      0 && (
                      <span className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-black text-red-600">
                        {
                          notificationCount
                        }{" "}
                        غير مقروء
                      </span>
                    )}

                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    آخر 24 ساعة
                  </p>

                </div>


                {notificationCount >
                  0 && (
                  <button
                    type="button"
                    onClick={
                      handleMarkAllRead
                    }
                    className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700"
                    title="تعليم الكل كمقروء"
                  >
                    <CheckCheck
                      size={
                        17
                      }
                    />
                  </button>
                )}

              </div>


              {/* Body */}

              {visibleNotifications.length >
              0 ? (
                <div className="max-h-[390px] overflow-y-auto p-2">

                  {visibleNotifications.map(
                    (
                      notification
                    ) => {
                      const config =
                        NOTIFICATION_CONFIG[
                          notification.type
                        ] ||
                        NOTIFICATION_CONFIG.info;

                      const Icon =
                        config.icon;

                      const path =
                        getNotificationPath(
                          notification
                        );

                      return (
                        <div
                          key={
                            notification.id
                          }
                          className={`group flex items-start gap-3 rounded-xl p-3 transition hover:bg-slate-50 ${
                            !notification.read
                              ? "bg-blue-50/40"
                              : ""
                          }`}
                        >

                          <button
                            type="button"
                            onClick={() =>
                              openNotification(
                                notification
                              )
                            }
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.className}`}
                          >
                            <Icon
                              size={
                                18
                              }
                            />
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              openNotification(
                                notification
                              )
                            }
                            className="min-w-0 flex-1 text-right"
                          >

                            <div className="flex items-center gap-2">

                              <p className="truncate text-sm font-black text-slate-800">
                                {
                                  notification.title
                                }
                              </p>

                              {!notification.read && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                              )}

                            </div>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                              {
                                notification.message
                              }
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              {
                                formatRelativeTime(
                                  notification.createdAt
                                )
                              }
                            </p>

                            {path && (
                              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-blue-600">
                                فتح المرتبط
                                <ExternalLink
                                  size={
                                    10
                                  }
                                />
                              </span>
                            )}

                          </button>


                          <button
                            type="button"
                            onClick={(
                              event
                            ) =>
                              handleDelete(
                                event,
                                notification.id
                              )
                            }
                            className="shrink-0 rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                            title="حذف"
                          >
                            <Trash2
                              size={
                                15
                              }
                            />
                          </button>

                        </div>
                      );
                    }
                  )}

                </div>
              ) : (
                <div className="px-6 py-12 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Bell
                      size={21}
                    />
                  </div>

                  <p className="mt-3 font-bold text-slate-700">
                    كل شيء هادئ
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    لا توجد إشعارات خلال آخر 24 ساعة.
                  </p>

                </div>
              )}

            </div>
          )}

        </div>


        {/* =================================
            USER MENU
        ================================= */}

        <div
          ref={
            userRef
          }
          className="relative"
        >

          <button
            type="button"
            onClick={() => {
              setShowUserMenu(
                (current) =>
                  !current
              );

              setShowNotifications(
                false
              );
            }}
            className={`flex items-center gap-3 rounded-xl px-2 py-1.5 transition ${
              showUserMenu
                ? "bg-slate-100"
                : "hover:bg-slate-50"
            }`}
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
              {userInitial}
            </div>

            <div className="hidden text-right sm:block">

              <p className="text-sm font-bold text-slate-900">
                {userName}
              </p>

              <p className="text-[11px] text-slate-400">
                {userRole}
              </p>

            </div>

            <ChevronDown
              size={16}
              className={`hidden text-slate-400 transition sm:block ${
                showUserMenu
                  ? "rotate-180"
                  : ""
              }`}
            />

          </button>


          {/* User Dropdown */}

          {showUserMenu && (
            <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">

              {/* User Info */}

              <div className="rounded-xl bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-sm font-black text-white">
                    {userInitial}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate font-black text-slate-900">
                      {userName}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-400">
                      {user?.email ||
                        "—"}
                    </p>

                  </div>

                </div>

                <div className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-500">
                  {userRole}
                </div>

              </div>


              {/* Actions */}

              <div className="mt-2">

                <button
                  type="button"
                  onClick={
                    openProfile
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <Users
                    size={18}
                  />
                  الملف الشخصي
                </button>


                <button
                  type="button"
                  onClick={
                    openSettings
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <Settings
                    size={18}
                  />
                  إعدادات النظام
                </button>


                <div className="my-1 h-px bg-slate-100" />


                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-red-500 transition hover:bg-red-50"
                >
                  <LogOut
                    size={18}
                  />
                  تسجيل الخروج
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}


/* =====================================
   RELATIVE TIME
===================================== */

function formatRelativeTime(
  date
) {
  if (!date) {
    return "—";
  }

  const timestamp =
    new Date(
      date
    ).getTime();

  if (
    Number.isNaN(
      timestamp
    )
  ) {
    return "—";
  }

  const diff =
    Date.now() -
    timestamp;

  const minute =
    60 *
    1000;

  const hour =
    60 *
    minute;

  const day =
    24 *
    hour;


  if (
    diff <
    minute
  ) {
    return "الآن";
  }

  if (
    diff <
    hour
  ) {
    return `منذ ${Math.floor(
      diff / minute
    )} دقيقة`;
  }

  if (
    diff <
    day
  ) {
    return `منذ ${Math.floor(
      diff / hour
    )} ساعة`;
  }

  return new Date(
    date
  ).toLocaleDateString(
    "ar-EG"
  );
}


export default Topbar;