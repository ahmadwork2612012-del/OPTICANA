import { create } from "zustand";
/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {
  business: {
    name: "OPTICANA",
    legalName: "",
    phone: "",
    email: "",
    address: "",
    taxNumber: "",
    logo: "",
    currency: "EGP",
    currencyLabel: "ج.م",
    country: "مصر",
    timezone: "Africa/Cairo",
  },

  branch: {
    enabled: false,
    isMain: true,
    name: "الفرع الرئيسي",
    code: "MAIN",
  },

  general: {
    language: "ar",
    direction: "rtl",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12",
    weekStartsOn: "saturday",
  },

  appearance: {
    theme: "light",
    accentColor: "blue",
    compactMode: false,
    animations: true,
  },

  pos: {
    defaultPaymentMethod: "cash",
    allowAnonymousSales: true,
    requireCustomerForDebt: true,
    allowPartialPayment: true,
    allowZeroPayment: false,
    defaultDiscountType: "fixed",
    printReceiptAfterSale: false,
    autoClearCartAfterSale: true,
    showPurchasePrice: false,
    confirmSale: false,
  },

  sales: {
    invoicePrefix: "INV",
    invoiceStartNumber: 1,
    allowDiscount: true,
    maxDiscountPercent: 100,
    allowPriceOverride: false,
    trackProfit: true,
    trackCOGS: true,
    preserveCustomerHistory: true,
  },

  invoices: {
    showLogo: true,
    showBusinessInfo: true,
    showPhone: true,
    showAddress: true,
    showDiscount: true,
    showTax: true,
    showPaymentSummary: true,
    receiptSize: "80mm",
    footerText: "شكرًا لزيارتكم",
  },

  taxes: {
    enabled: false,
    rate: 0,
    mode: "exclusive",
    showOnInvoice: true,
  },

  inventory: {
    enableLowStockAlerts: true,
    defaultReorderLevel: 5,
    allowNegativeStock: false,
    trackMovements: true,
    showStockValue: true,
    autoDeductOnSale: true,
    autoAddOnPurchase: true,
    autoDeductOnRepair: true,
    recentMovementHours: 24,
    lowStockThresholdType: "reorderLevel",
  },

  purchases: {
    invoicePrefix: "PUR",
    defaultPaymentMethod: "cash",
    allowPartialPayment: true,
    requireSupplier: false,
    autoUpdateInventory: true,
    trackSupplierBalance: true,
  },

  repairs: {
    defaultStatus: "pending",
    requireCustomerName: true,
    allowPartialPayment: true,
    autoDeductParts: true,
    showDueDateAlerts: true,
    dueDateAlertHours: 24,
  },

  notifications: {
    enabled: true,

    showLowStock: true,
    showOutOfStock: true,

    showNewSales: true,
    showNewPurchases: true,
    showNewOrders: true,

    showRepairAlerts: true,
    showCustomerAlerts: true,
    showSupplierAlerts: true,

    showPaymentAlerts: true,
    showExpenseAlerts: true,

    retentionDays: 30,
  },

  search: {
    enabled: true,
    products: true,
    orders: true,
    customers: true,
    repairs: true,
    keyboardShortcut: true,
    maxResults: 12,
  },

  store: {
    enabled: true,
    maintenanceMode: false,

    showPrices: true,

    allowGuestCheckout: true,
    requirePhone: true,

    allowReviews: true,
    allowFavorites: true,
    allowCoupons: true,

    defaultSort: "featured",
  },

  security: {
    sessionTimeoutMinutes: 120,

    requireConfirmDelete: true,
    requireConfirmStockAdjustment: true,
    requireConfirmPayment: true,
  },

  data: {
    autoBackup: false,
    backupFrequency: "daily",
    keepLocalData: true,
  },

  backend: {
    mode: "local",
    apiBaseUrl: "",
    apiVersion: "v1",

    syncEnabled: false,
    syncIntervalSeconds: 30,
  },
};


/* =========================================================
   SAFE CLONE
========================================================= */

const clone = (value) =>
  JSON.parse(
    JSON.stringify(value)
  );


/* =========================================================
   DEEP MERGE
   يحافظ على أي إعداد جديد حتى لو
   كان ملف الاستيراد قديمًا.
========================================================= */

function deepMerge(
  defaults,
  current
) {
  if (
    !defaults ||
    typeof defaults !==
      "object"
  ) {
    return current;
  }

  if (
    !current ||
    typeof current !==
      "object"
  ) {
    return clone(defaults);
  }

  const result = {
    ...defaults,
    ...current,
  };

  Object.keys(defaults).forEach(
    (key) => {
      const defaultValue =
        defaults[key];

      const currentValue =
        current[key];

      if (
        defaultValue &&
        typeof defaultValue ===
          "object" &&
        !Array.isArray(
          defaultValue
        )
      ) {
        result[key] =
          deepMerge(
            defaultValue,
            currentValue
          );
      }
    }
  );

  return result;
}


/* =========================================================
   VALID SECTION
========================================================= */

const hasSection = (
  section
) =>
  Object.prototype.hasOwnProperty.call(
    DEFAULT_SETTINGS,
    section
  );


/* =========================================================
   STORE
========================================================= */

const useSettingsStore = create(
    (set, get) => ({
      settings:
        clone(
          DEFAULT_SETTINGS
        ),

      /*
      -------------------------------------------------------
      Update Section
      -------------------------------------------------------
      */
      updateSection: (
        section,
        updates
      ) => {
        if (
          !hasSection(section)
        ) {
          return;
        }

        set((state) => ({
          settings: {
            ...state.settings,

            [section]: {
              ...state.settings[
                section
              ],

              ...updates,
            },
          },
        }));
      },


      /*
      -------------------------------------------------------
      Update Single Setting
      -------------------------------------------------------
      */
      updateSetting: (
        section,
        key,
        value
      ) => {
        if (
          !hasSection(section)
        ) {
          return;
        }

        set((state) => ({
          settings: {
            ...state.settings,

            [section]: {
              ...state.settings[
                section
              ],

              [key]: value,
            },
          },
        }));
      },


      /*
      -------------------------------------------------------
      Replace Entire Settings
      -------------------------------------------------------
      */
      replaceSettings: (
        incoming
      ) => {
        const merged =
          deepMerge(
            DEFAULT_SETTINGS,
            incoming
          );

        set({
          settings: merged,
        });
      },


      /*
      -------------------------------------------------------
      Reset One Section
      -------------------------------------------------------
      */
      resetSection: (
        section
      ) => {
        if (
          !hasSection(section)
        ) {
          return null;
        }

        const current =
          get().settings;

        const previous =
          clone(
            current[section]
          );

        set({
          settings: {
            ...current,

            [section]:
              clone(
                DEFAULT_SETTINGS[
                  section
                ]
              ),
          },

          lastBackup: {
            scope: "section",
            section,
            settings: previous,
            createdAt:
              new Date().toISOString(),
          },
        });

        return previous;
      },


      /*
      -------------------------------------------------------
      Reset ALL
      -------------------------------------------------------
      */
      resetSettings: () => {
        const previous =
          clone(
            get().settings
          );

        set({
          settings:
            clone(
              DEFAULT_SETTINGS
            ),

          lastBackup: {
            scope: "all",
            section: null,
            settings:
              previous,
            createdAt:
              new Date().toISOString(),
          },
        });

        return previous;
      },


      /*
      -------------------------------------------------------
      Undo Last Reset
      -------------------------------------------------------
      */
      undoLastReset: () => {
        const state =
          get();

        if (
          !state.lastBackup?.settings
        ) {
          return false;
        }

        if (
          state.lastBackup.scope ===
          "all"
        ) {
          set({
            settings:
              deepMerge(
                DEFAULT_SETTINGS,
                state.lastBackup
                  .settings
              ),

            lastBackup: null,
          });

          return true;
        }

        if (
          state.lastBackup.scope ===
            "section" &&
          state.lastBackup.section
        ) {
          const section =
            state.lastBackup
              .section;

          set({
            settings: {
              ...state.settings,

              [section]:
                deepMerge(
                  DEFAULT_SETTINGS[
                    section
                  ],
                  state.lastBackup
                    .settings
                ),
            },

            lastBackup: null,
          });

          return true;
        }

        return false;
      },


      /*
      -------------------------------------------------------
      Backup Current Settings
      -------------------------------------------------------
      */
      createSnapshot: () => {
        const snapshot =
          clone(
            get().settings
          );

        set({
          lastBackup: {
            scope: "snapshot",
            section: null,
            settings:
              snapshot,
            createdAt:
              new Date().toISOString(),
          },
        });

        return snapshot;
      },


      /*
      -------------------------------------------------------
      Export
      -------------------------------------------------------
      */
      exportSettings: () => {
        return JSON.stringify(
          {
            app: "OPTICANA",
            schemaVersion: 3,
            exportedAt:
              new Date().toISOString(),
            settings:
              get().settings,
          },
          null,
          2
        );
      },


      /*
      -------------------------------------------------------
      Import
      -------------------------------------------------------
      */
      importSettings: (
        input
      ) => {
        try {
          const parsed =
            typeof input ===
            "string"
              ? JSON.parse(input)
              : input;

          const incoming =
            parsed?.settings ??
            parsed;

          if (
            !incoming ||
            typeof incoming !==
              "object"
          ) {
            return false;
          }

          const previous =
            clone(
              get().settings
            );

          const merged =
            deepMerge(
              DEFAULT_SETTINGS,
              incoming
            );

          set({
            settings: merged,

            lastBackup: {
              scope: "import",
              section: null,
              settings:
                previous,
              createdAt:
                new Date().toISOString(),
            },
          });

          return true;
        } catch {
          return false;
        }
      },


      /*
      -------------------------------------------------------
      Get One Section
      -------------------------------------------------------
      */
      getSection: (
        section
      ) => {
        if (
          !hasSection(section)
        ) {
          return null;
        }

        return get().settings[
          section
        ];
      },


      /*
      -------------------------------------------------------
      Get One Value
      -------------------------------------------------------
      */
      getSetting: (
        section,
        key,
        fallback = null
      ) => {
        const value =
          get().settings[
            section
          ]?.[key];

        return value ??
          fallback;
      },


      /*
      -------------------------------------------------------
      BACKEND
      -------------------------------------------------------
      */
      loadSettings: async () => {
        const { default: apiClient } = await import("../lib/apiClient");
        const data = await apiClient.get("/settings");
        const merged = deepMerge(DEFAULT_SETTINGS, data || {});
        set({ settings: merged });
        return merged;
      },

      saveSettings: async () => {
        const { default: apiClient } = await import("../lib/apiClient");
        const current = get().settings || {};
        for (const [key, value] of Object.entries(current)) {
          await apiClient.put(`/admin/settings/${encodeURIComponent(key)}`, { value });
        }
        return current;
      },

      /*
      -------------------------------------------------------
      Last Backup
      -------------------------------------------------------
      */
      lastBackup: null,
    })
);


export {
  DEFAULT_SETTINGS,
  deepMerge,
};


export default useSettingsStore;