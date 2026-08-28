import {
  Save,
  RotateCcw,
  Store,
  Globe2,
  Palette,
  ShoppingCart,
  Receipt,
  Warehouse,
  ShoppingBag,
  Wrench,
  Bell,
  ShieldCheck,
  Database,
  Server,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Search,
  Keyboard,
  Building2,
  FileText,
  Percent,
  RefreshCcw,
  Undo2,
  ShieldAlert,
  LockKeyhole,
  SlidersHorizontal,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import toast from "react-hot-toast";

import useSettingsStore from "../store/settingsStore";


/* =========================================================
   SETTINGS SECTIONS
========================================================= */

const SECTIONS = [
  {
    id: "business",
    label: "بيانات المتجر",
    icon: Store,
  },

  {
    id: "branch",
    label: "الفروع",
    icon: Building2,
  },

  {
    id: "general",
    label: "عام",
    icon: Globe2,
  },

  {
    id: "appearance",
    label: "المظهر",
    icon: Palette,
  },

  {
    id: "pos",
    label: "نقطة البيع",
    icon: ShoppingCart,
  },

  {
    id: "sales",
    label: "المبيعات",
    icon: Receipt,
  },

  {
    id: "invoices",
    label: "الفواتير",
    icon: FileText,
  },

  {
    id: "taxes",
    label: "الضرائب",
    icon: Percent,
  },

  {
    id: "inventory",
    label: "المخزون",
    icon: Warehouse,
  },

  {
    id: "purchases",
    label: "المشتريات",
    icon: ShoppingBag,
  },

  {
    id: "repairs",
    label: "الصيانة",
    icon: Wrench,
  },

  {
    id: "notifications",
    label: "الإشعارات",
    icon: Bell,
  },

  {
    id: "search",
    label: "البحث والاختصارات",
    icon: Search,
  },

  {
    id: "store",
    label: "المتجر الإلكتروني",
    icon: Globe2,
  },

  {
    id: "security",
    label: "الأمان",
    icon: ShieldCheck,
  },

  {
    id: "data",
    label: "البيانات والنسخ الاحتياطي",
    icon: Database,
  },

  {
    id: "backend",
    label: "Backend",
    icon: Server,
  },
];


/* =========================================================
   PAGE-SAFE DEFAULTS
   يحافظ الملف على توافقه حتى لو كان settingsStore
   أقدم من نسخة Settings الحالية.
========================================================= */

const SECTION_DEFAULTS = {
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
    confirmDeleteLine: true,
    allowHoldOrders: true,
    allowQuickCustomer: true,
    barcodeSearch: true,
    soundFeedback: false,
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
    keepCancelledSales: true,
    allowReturns: false,
  },
  invoices: {
    showLogo: true,
    showBusinessInfo: true,
    showPhone: true,
    showAddress: true,
    showDiscount: true,
    showTax: true,
    showPaymentSummary: true,
    showCustomer: true,
    showSKU: false,
    showCashier: true,
    receiptSize: "80mm",
    footerText: "شكرًا لزيارتكم",
  },
  taxes: {
    enabled: false,
    rate: 0,
    mode: "exclusive",
    showOnInvoice: true,
    taxNumberRequired: false,
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
    confirmManualAdjustment: true,
    preventOverselling: true,
  },
  purchases: {
    invoicePrefix: "PUR",
    defaultPaymentMethod: "cash",
    allowPartialPayment: true,
    requireSupplier: false,
    autoUpdateInventory: true,
    trackSupplierBalance: true,
    allowPurchaseReturns: false,
    confirmReceiving: true,
  },
  repairs: {
    defaultStatus: "pending",
    requireCustomerName: true,
    allowPartialPayment: true,
    autoDeductParts: true,
    showDueDateAlerts: true,
    dueDateAlertHours: 24,
    allowRepairImages: true,
    requireProblemDescription: true,
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
    sound: false,
  },
  search: {
    enabled: true,
    products: true,
    orders: true,
    customers: true,
    repairs: true,
    suppliers: true,
    sales: true,
    purchases: true,
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
    allowProductQuestions: true,
    showStockStatus: true,
    defaultSort: "featured",
    productsPerPage: 24,
  },
  security: {
    sessionTimeoutMinutes: 120,
    requireConfirmDelete: true,
    requireConfirmStockAdjustment: true,
    requireConfirmPayment: true,
    protectSettingsReset: true,
    protectDataImport: true,
  },
  data: {
    autoBackup: false,
    backupFrequency: "daily",
    keepLocalData: true,
    exportIncludesOperationalData: false,
    confirmDataClear: true,
  },
  backend: {
    mode: "local",
    apiBaseUrl: "",
    apiVersion: "v1",
    syncEnabled: false,
    syncIntervalSeconds: 30,
    connectionTimeoutSeconds: 15,
    retryAttempts: 3,
  },
};

function mergeSectionDefaults(section, data = {}) {
  return {
    ...(SECTION_DEFAULTS[section] || {}),
    ...(data || {}),
  };
}


function Settings() {
  const settings =
    useSettingsStore(
      (state) => state.settings
    );

  const updateSection =
    useSettingsStore(
      (state) => state.updateSection
    );

  const resetSection =
    useSettingsStore(
      (state) => state.resetSection
    );

  const resetSettings =
    useSettingsStore(
      (state) => state.resetSettings
    );

  const exportSettings =
    useSettingsStore(
      (state) => state.exportSettings
    );

  const importSettings =
    useSettingsStore(
      (state) => state.importSettings
    );

  const loadSettings =
    useSettingsStore(
      (state) => state.loadSettings
    );

  const saveSettings =
    useSettingsStore(
      (state) => state.saveSettings
    );


  const [activeSection, setActiveSection] =
    useState("business");

  const [saved, setSaved] =
    useState(true);

  const importRef =
    useRef(null);

  const resetBackupRef =
    useRef(null);

  const [hasUndo, setHasUndo] =
    useState(false);


  const activeConfig =
    useMemo(
      () =>
        SECTIONS.find(
          (section) =>
            section.id ===
            activeSection
        ),
      [activeSection]
    );

  useEffect(() => {
    loadSettings().catch(() => {
      toast.error("تعذر تحميل الإعدادات من الخادم");
    });
  }, [loadSettings]);

  useEffect(() => {
    Object.entries(SECTION_DEFAULTS).forEach(
      ([section, defaults]) => {
        const current = settings?.[section];
        const patch = Object.keys(defaults).reduce(
          (result, key) => {
            if (current?.[key] === undefined) {
              result[key] = defaults[key];
            }
            return result;
          },
          {}
        );
        if (Object.keys(patch).length > 0) {
          updateSection(section, patch);
        }
      }
    );
  }, [settings, updateSection]);


  const update = (
    section,
    key,
    value
  ) => {
    updateSection(section, {
      [key]: value,
    });

    setSaved(false);
  };


  const save = async () => {
    try {
      await saveSettings();
      setSaved(true);
      toast.success("تم اعتماد إعدادات النظام");
    } catch (error) {
      setSaved(false);
      toast.error(error?.message || "تعذر حفظ الإعدادات");
    }
  };


  const backupCurrentSettings = () => {
    resetBackupRef.current = JSON.parse(
      JSON.stringify(settings)
    );

    setHasUndo(true);
  };


  const handleResetSection = async () => {
    const protectedReset =
      settings?.security?.protectSettingsReset !== false;

    if (protectedReset) {
      const confirmed = window.confirm(
        `هل أنت متأكد من إعادة قسم «${
          activeConfig?.label || activeSection
        }» للوضع الافتراضي؟`
      );

      if (!confirmed) {
        return;
      }
    }

    backupCurrentSettings();

    resetSection(activeSection);

    updateSection(
      activeSection,
      SECTION_DEFAULTS[activeSection] || {}
    );

    try {
      await saveSettings();
      setSaved(true);
      toast.success("تمت إعادة القسم للوضع الافتراضي — يمكنك التراجع");
    } catch (error) {
      toast.error(error?.message || "تعذر حفظ الإعدادات");
    }
  };


  const handleResetAll = async () => {
    const confirmed = window.confirm(
      "سيتم إعادة جميع إعدادات OPTICANA فقط. لن يتم حذف المنتجات أو المبيعات أو العملاء أو المخزون. هل تريد المتابعة؟"
    );

    if (!confirmed) {
      return;
    }

    backupCurrentSettings();
    resetSettings();

    Object.entries(SECTION_DEFAULTS).forEach(
      ([section, defaults]) => {
        updateSection(section, defaults);
      }
    );

    try {
      await saveSettings();
      setSaved(true);
      toast.success("تمت إعادة جميع الإعدادات — يمكنك التراجع");
    } catch (error) {
      toast.error(error?.message || "تعذر حفظ الإعدادات");
    }
  };


  const handleUndoReset = async () => {
    const backup = resetBackupRef.current;

    if (!backup) {
      return;
    }

    Object.entries(backup).forEach(
      ([section, values]) => {
        updateSection(section, values || {});
      }
    );

    setHasUndo(false);
    resetBackupRef.current = null;
    setSaved(true);

    toast.success(
      "تم التراجع عن آخر إعادة للإعدادات"
    );
  };


  const downloadSettings = () => {
    const blob =
      new Blob(
        [exportSettings()],
        {
          type:
            "application/json",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "opticana-settings.json";

    link.click();

    URL.revokeObjectURL(
      url
    );

    toast.success(
      "تم تصدير إعدادات النظام"
    );
  };


  const handleImport = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      settings?.security?.protectDataImport !== false &&
      !window.confirm(
        "سيتم استبدال/دمج إعدادات النظام فقط. لن يتم حذف بيانات المبيعات أو المخزون. هل تريد استيراد الملف؟"
      )
    ) {
      event.target.value = "";
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const success =
        importSettings(
          reader.result
        );

      if (success) {
        saveSettings()
          .then(() => setSaved(true))
          .catch((error) => toast.error(error?.message || "تعذر حفظ الإعدادات"));
        toast.success("تم استيراد الإعدادات محليًا، جارٍ مزامنتها مع الخادم");
      } else {
        toast.error(
          "ملف الإعدادات غير صالح"
        );
      }
    };

    reader.readAsText(file);

    event.target.value = "";
  };


  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
            <Palette size={15} />
            تهيئة النظام
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            الإعدادات
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            مركز التحكم الكامل في طريقة عمل OPTICANA،
            من بيانات المتجر ونقطة البيع إلى المخزون
            والفواتير والإشعارات والمتجر الإلكتروني
            والربط المستقبلي مع الـBackend.
          </p>
        </div>


        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={
              downloadSettings
            }
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <Download size={17} />
            تصدير
          </button>


          <button
            type="button"
            onClick={() =>
              importRef.current?.click()
            }
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <Upload size={17} />
            استيراد
          </button>


          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={
              handleImport
            }
          />


          <button
            type="button"
            onClick={save}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-800"
          >
            <Save size={17} />
            حفظ الإعدادات
          </button>

        </div>
      </div>


      {/* =================================================
          SAVE STATUS
      ================================================= */}

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              saved
                ? "bg-emerald-50 text-emerald-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            {saved ? (
              <CheckCircle2 size={19} />
            ) : (
              <AlertTriangle size={19} />
            )}
          </div>


          <div>
            <p className="text-sm font-black text-slate-800">
              {saved
                ? "الإعدادات محفوظة"
                : "توجد تغييرات حديثة"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {saved
                ? "البيانات محفوظة محليًا وجاهزة للمزامنة مستقبلًا."
                : "التغييرات تُحفظ محليًا تلقائيًا، ويمكن مراجعتها ثم اعتمادها من زر الحفظ."}
            </p>
          </div>

        </div>


        <button
          type="button"
          onClick={
            handleResetAll
          }
          className="flex items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-2.5 text-xs font-black text-red-500 transition hover:bg-red-50"
        >
          <ShieldAlert size={15} />
          إعادة كل الإعدادات
        </button>

        {hasUndo && (
          <button
            type="button"
            onClick={handleUndoReset}
            className="flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs font-black text-blue-700 transition hover:bg-blue-100"
          >
            <Undo2 size={15} />
            تراجع
          </button>
        )}

      </div>


      {/* =================================================
          MAIN LAYOUT
      ================================================= */}

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">

        {/* Sidebar */}

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

          {SECTIONS.map(
            (section) => {
              const Icon =
                section.icon;

              const active =
                activeSection ===
                section.id;

              return (
                <button
                  key={
                    section.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      section.id
                    )
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-bold transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >

                  <Icon size={17} />

                  <span className="flex-1">
                    {
                      section.label
                    }
                  </span>

                </button>
              );
            }
          )}

        </aside>


        {/* Content */}

        <main className="min-w-0">

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                  {activeConfig &&
                    (() => {
                      const Icon =
                        activeConfig.icon;

                      return (
                        <Icon size={19} />
                      );
                    })()}
                </div>


                <div>

                  <h2 className="font-black text-slate-900">
                    {
                      activeConfig?.label
                    }
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    إعدادات هذا القسم من OPTICANA.
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={
                  handleResetSection
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-500 transition hover:bg-slate-50"
              >
                <ShieldAlert size={14} />
                إعادة افتراضي
              </button>

            </div>


            <div className="p-6">

              {activeSection ===
                "business" && (
                <BusinessSettings
                  data={
                    mergeSectionDefaults(
                      "business",
                      settings.business
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "branch" && (
                <BranchSettings
                  data={
                    mergeSectionDefaults(
                      "branch",
                      settings.branch
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "general" && (
                <GeneralSettings
                  data={
                    mergeSectionDefaults(
                      "general",
                      settings.general
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "appearance" && (
                <AppearanceSettings
                  data={
                    mergeSectionDefaults(
                      "appearance",
                      settings.appearance
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "pos" && (
                <PosSettings
                  data={
                    mergeSectionDefaults(
                      "pos",
                      settings.pos
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "sales" && (
                <SalesSettings
                  data={
                    mergeSectionDefaults(
                      "sales",
                      settings.sales
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "invoices" && (
                <InvoiceSettings
                  data={
                    mergeSectionDefaults(
                      "invoices",
                      settings.invoices
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "taxes" && (
                <TaxSettings
                  data={
                    mergeSectionDefaults(
                      "taxes",
                      settings.taxes
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "inventory" && (
                <InventorySettings
                  data={
                    mergeSectionDefaults(
                      "inventory",
                      settings.inventory
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "purchases" && (
                <PurchaseSettings
                  data={
                    mergeSectionDefaults(
                      "purchases",
                      settings.purchases
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "repairs" && (
                <RepairSettings
                  data={
                    mergeSectionDefaults(
                      "repairs",
                      settings.repairs
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "notifications" && (
                <NotificationSettings
                  data={
                    mergeSectionDefaults(
                      "notifications",
                      settings.notifications
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "search" && (
                <SearchSettings
                  data={
                    mergeSectionDefaults(
                      "search",
                      settings.search
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "store" && (
                <StoreSettings
                  data={
                    mergeSectionDefaults(
                      "store",
                      settings.store
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "security" && (
                <SecuritySettings
                  data={
                    mergeSectionDefaults(
                      "security",
                      settings.security
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "data" && (
                <DataSettings
                  data={
                    mergeSectionDefaults(
                      "data",
                      settings.data
                    )
                  }
                  update={
                    update
                  }
                />
              )}


              {activeSection ===
                "backend" && (
                <BackendSettings
                  data={
                    mergeSectionDefaults(
                      "backend",
                      settings.backend
                    )
                  }
                  update={
                    update
                  }
                />
              )}

            </div>
          </div>

        </main>

      </div>

    </div>
  );
}


/* =========================================================
   BUSINESS
========================================================= */

function BusinessSettings({
  data = {},
  update,
}) {
  return (
    <div className="space-y-6">

      <SectionIntro
        title="بيانات المتجر"
        text="المعلومات الأساسية التي ستظهر لاحقًا في الفواتير والإيصالات والمتجر والـBackend."
      />


      <div className="grid gap-4 md:grid-cols-2">

        <TextField
          label="اسم المتجر"
          value={
            data.name
          }
          onChange={(value) =>
            update(
              "business",
              "name",
              value
            )
          }
          placeholder="OPTICANA"
        />


        <TextField
          label="الاسم القانوني"
          value={
            data.legalName
          }
          onChange={(value) =>
            update(
              "business",
              "legalName",
              value
            )
          }
        />


        <TextField
          label="رقم الهاتف"
          value={
            data.phone
          }
          onChange={(value) =>
            update(
              "business",
              "phone",
              value
            )
          }
        />


        <TextField
          label="البريد الإلكتروني"
          value={
            data.email
          }
          onChange={(value) =>
            update(
              "business",
              "email",
              value
            )
          }
        />


        <TextField
          label="العنوان"
          value={
            data.address
          }
          onChange={(value) =>
            update(
              "business",
              "address",
              value
            )
          }
        />


        <TextField
          label="الرقم الضريبي"
          value={
            data.taxNumber
          }
          onChange={(value) =>
            update(
              "business",
              "taxNumber",
              value
            )
          }
        />


        <SelectField
          label="العملة"
          value={
            data.currency
          }
          onChange={(value) => {
            update(
              "business",
              "currency",
              value
            );

            update(
              "business",
              "currencyLabel",
              value ===
                "EGP"
                ? "ج.م"
                : value
            );
          }}
          options={[
            {
              value: "EGP",
              label: "الجنيه المصري",
            },
            {
              value: "SAR",
              label: "الريال السعودي",
            },
            {
              value: "USD",
              label: "الدولار الأمريكي",
            },
            {
              value: "AED",
              label: "الدرهم الإماراتي",
            },
          ]}
        />


        <TextField
          label="رمز العملة الظاهر"
          value={
            data.currencyLabel
          }
          onChange={(value) =>
            update(
              "business",
              "currencyLabel",
              value
            )
          }
        />

        <TextField
          label="الدولة"
          value={data.country}
          onChange={(value) =>
            update(
              "business",
              "country",
              value
            )
          }
          placeholder="مصر"
        />

        <TextField
          label="المنطقة الزمنية"
          value={data.timezone}
          onChange={(value) =>
            update(
              "business",
              "timezone",
              value
            )
          }
          placeholder="Africa/Cairo"
        />

        <TextField
          label="رابط الشعار"
          value={data.logo}
          onChange={(value) =>
            update(
              "business",
              "logo",
              value
            )
          }
          placeholder="https://..."
        />

      </div>

    </div>
  );
}


/* =========================================================
   BRANCH
========================================================= */

function BranchSettings({
  data = {},
  update,
}) {
  return (
    <div className="space-y-6">

      <SectionIntro
        title="الفروع"
        text="بنية مجهزة من الآن لدعم أكثر من فرع عند ربط النظام بقاعدة البيانات."
      />


      <div className="grid gap-4 md:grid-cols-2">

        <TextField
          label="اسم الفرع الحالي"
          value={
            data.name
          }
          onChange={(value) =>
            update(
              "branch",
              "name",
              value
            )
          }
          placeholder="الفرع الرئيسي"
        />


        <TextField
          label="معرف الفرع"
          value={
            data.code
          }
          onChange={(value) =>
            update(
              "branch",
              "code",
              value
            )
          }
          placeholder="MAIN"
        />


        <ToggleField
          label="تفعيل الفروع"
          description="يصبح متعدد الفروع فعليًا بعد إضافة Backend."
          checked={
            data.enabled
          }
          onChange={(value) =>
            update(
              "branch",
              "enabled",
              value
            )
          }
        />


        <ToggleField
          label="اعتبار هذا الفرع الرئيسي"
          checked={
            data.isMain
          }
          onChange={(value) =>
            update(
              "branch",
              "isMain",
              value
            )
          }
        />

      </div>

    </div>
  );
}


/* =========================================================
   GENERAL
========================================================= */

function GeneralSettings({
  data = {},
  update,
}) {
  return (
    <SettingGrid>

      <SelectField
        label="لغة النظام"
        value={
          data.language
        }
        onChange={(value) =>
          update(
            "general",
            "language",
            value
          )
        }
        options={[
          {
            value: "ar",
            label: "العربية",
          },
          {
            value: "en",
            label: "English",
          },
        ]}
      />


      <SelectField
        label="اتجاه الواجهة"
        value={
          data.direction
        }
        onChange={(value) =>
          update(
            "general",
            "direction",
            value
          )
        }
        options={[
          {
            value: "rtl",
            label: "RTL — عربي",
          },
          {
            value: "ltr",
            label: "LTR — English",
          },
        ]}
      />


      <SelectField
        label="صيغة التاريخ"
        value={
          data.dateFormat
        }
        onChange={(value) =>
          update(
            "general",
            "dateFormat",
            value
          )
        }
        options={[
          {
            value: "DD/MM/YYYY",
            label: "DD/MM/YYYY",
          },
          {
            value: "MM/DD/YYYY",
            label: "MM/DD/YYYY",
          },
          {
            value: "YYYY-MM-DD",
            label: "YYYY-MM-DD",
          },
        ]}
      />


      <SelectField
        label="صيغة الوقت"
        value={
          data.timeFormat
        }
        onChange={(value) =>
          update(
            "general",
            "timeFormat",
            value
          )
        }
        options={[
          {
            value: "12",
            label: "12 ساعة",
          },
          {
            value: "24",
            label: "24 ساعة",
          },
        ]}
      />

      <SelectField
        label="بداية الأسبوع"
        value={data.weekStartsOn}
        onChange={(value) =>
          update(
            "general",
            "weekStartsOn",
            value
          )
        }
        options={[
          {
            value: "saturday",
            label: "السبت",
          },
          {
            value: "sunday",
            label: "الأحد",
          },
          {
            value: "monday",
            label: "الاثنين",
          },
        ]}
      />

    </SettingGrid>
  );
}


/* =========================================================
   APPEARANCE
========================================================= */

function AppearanceSettings({
  data = {},
  update,
}) {
  return (
    <div className="space-y-6">

      <SectionIntro
        title="المظهر"
        text="التحكم المركزي في Theme الواجهة، مع إبقاء البنية جاهزة لتطبيقه على كامل الـAdmin والمتجر."
      />


      <div className="grid gap-4 sm:grid-cols-3">

        {[
          {
            value: "light",
            label: "فاتح",
          },

          {
            value: "dark",
            label: "داكن",
          },

          {
            value: "system",
            label: "حسب النظام",
          },
        ].map(
          (theme) => (
            <ChoiceCard
              key={
                theme.value
              }
              active={
                data.theme ===
                theme.value
              }
              title={
                theme.label
              }
              onClick={() =>
                update(
                  "appearance",
                  "theme",
                  theme.value
                )
              }
            />
          )
        )}

      </div>


      <SettingGrid>

        <SelectField
          label="اللون الأساسي"
          value={
            data.accentColor
          }
          onChange={(value) =>
            update(
              "appearance",
              "accentColor",
              value
            )
          }
          options={[
            {
              value: "blue",
              label: "Blue",
            },

            {
              value: "indigo",
              label: "Indigo",
            },

            {
              value: "emerald",
              label: "Emerald",
            },

            {
              value: "violet",
              label: "Violet",
            },
          ]}
        />


        <ToggleField
          label="الوضع المضغوط"
          description="تقليل المسافات في الجداول والبطاقات."
          checked={
            data.compactMode
          }
          onChange={(value) =>
            update(
              "appearance",
              "compactMode",
              value
            )
          }
        />


        <ToggleField
          label="الحركات"
          description="تفعيل الانتقالات البصرية."
          checked={
            data.animations
          }
          onChange={(value) =>
            update(
              "appearance",
              "animations",
              value
            )
          }
        />

      </SettingGrid>

    </div>
  );
}


/* =========================================================
   POS
========================================================= */

function PosSettings({
  data = {},
  update,
}) {
  return (
    <SettingGrid>

      <ToggleField
        label="السماح بالبيع بدون عميل"
        description="بيع سريع لعميل نقدي."
        checked={
          data.allowAnonymousSales
        }
        onChange={(value) =>
          update(
            "pos",
            "allowAnonymousSales",
            value
          )
        }
      />


      <ToggleField
        label="إجبار العميل عند وجود دين"
        description="الفاتورة غير المسددة تحتاج عميل."
        checked={
          data.requireCustomerForDebt
        }
        onChange={(value) =>
          update(
            "pos",
            "requireCustomerForDebt",
            value
          )
        }
      />


      <ToggleField
        label="السداد الجزئي"
        checked={
          data.allowPartialPayment
        }
        onChange={(value) =>
          update(
            "pos",
            "allowPartialPayment",
            value
          )
        }
      />


      <ToggleField
        label="السداد بصفر"
        description="إبقاء الفاتورة غير محصلة."
        checked={
          data.allowZeroPayment
        }
        onChange={(value) =>
          update(
            "pos",
            "allowZeroPayment",
            value
          )
        }
      />


      <ToggleField
        label="إظهار سعر الشراء"
        checked={
          data.showPurchasePrice
        }
        onChange={(value) =>
          update(
            "pos",
            "showPurchasePrice",
            value
          )
        }
      />


      <ToggleField
        label="تأكيد قبل البيع"
        checked={
          data.confirmSale
        }
        onChange={(value) =>
          update(
            "pos",
            "confirmSale",
            value
          )
        }
      />


      <ToggleField
        label="طباعة الإيصال تلقائيًا"
        description="جاهز للطابعة لاحقًا."
        checked={
          data.printReceiptAfterSale
        }
        onChange={(value) =>
          update(
            "pos",
            "printReceiptAfterSale",
            value
          )
        }
      />


      <ToggleField
        label="تفريغ السلة بعد البيع"
        checked={
          data.autoClearCartAfterSale
        }
        onChange={(value) =>
          update(
            "pos",
            "autoClearCartAfterSale",
            value
          )
        }
      />


      <SelectField
        label="طريقة الدفع الافتراضية"
        value={
          data.defaultPaymentMethod
        }
        onChange={(value) =>
          update(
            "pos",
            "defaultPaymentMethod",
            value
          )
        }
        options={[
          {
            value: "cash",
            label: "كاش",
          },
          {
            value: "card",
            label: "بطاقة",
          },
        ]}
      />


      <SelectField
        label="نوع الخصم الافتراضي"
        value={data.defaultDiscountType}
        onChange={(value) =>
          update("pos", "defaultDiscountType", value)
        }
        options={[
          { value: "fixed", label: "مبلغ ثابت" },
          { value: "percent", label: "نسبة مئوية" },
        ]}
      />

      <ToggleField
        label="السماح بتعليق الفواتير"
        checked={data.allowHoldOrders}
        onChange={(value) => update("pos", "allowHoldOrders", value)}
      />

      <ToggleField
        label="إضافة عميل سريع"
        checked={data.allowQuickCustomer}
        onChange={(value) => update("pos", "allowQuickCustomer", value)}
      />

      <ToggleField
        label="البحث بالباركود"
        checked={data.barcodeSearch}
        onChange={(value) => update("pos", "barcodeSearch", value)}
      />

      <ToggleField
        label="تأكيد حذف صنف من السلة"
        checked={data.confirmDeleteLine}
        onChange={(value) => update("pos", "confirmDeleteLine", value)}
      />

      <ToggleField
        label="الصوت أثناء العمليات"
        checked={data.soundFeedback}
        onChange={(value) => update("pos", "soundFeedback", value)}
      />

    </SettingGrid>
  );
}


/* =========================================================
   SALES
========================================================= */

function SalesSettings({
  data = {},
  update,
}) {
  return (
    <SettingGrid>

      <TextField
        label="بادئة البيع"
        value={
          data.invoicePrefix
        }
        onChange={(value) =>
          update(
            "sales",
            "invoicePrefix",
            value
          )
        }
      />


      <NumberField
        label="بداية الترقيم"
        value={
          data.invoiceStartNumber
        }
        onChange={(value) =>
          update(
            "sales",
            "invoiceStartNumber",
            value
          )
        }
      />


      <NumberField
        label="أقصى خصم %"
        value={
          data.maxDiscountPercent
        }
        onChange={(value) =>
          update(
            "sales",
            "maxDiscountPercent",
            value
          )
        }
      />


      <ToggleField
        label="السماح بالخصم"
        checked={
          data.allowDiscount
        }
        onChange={(value) =>
          update(
            "sales",
            "allowDiscount",
            value
          )
        }
      />


      <ToggleField
        label="تتبع الربح"
        checked={
          data.trackProfit
        }
        onChange={(value) =>
          update(
            "sales",
            "trackProfit",
            value
          )
        }
      />


      <ToggleField
        label="تتبع تكلفة البضاعة"
        checked={
          data.trackCOGS
        }
        onChange={(value) =>
          update(
            "sales",
            "trackCOGS",
            value
          )
        }
      />


      <ToggleField
        label="حفظ سجل العميل مع البيع"
        checked={data.preserveCustomerHistory}
        onChange={(value) => update("sales", "preserveCustomerHistory", value)}
      />

      <ToggleField
        label="الاحتفاظ بالفواتير الملغاة"
        checked={data.keepCancelledSales}
        onChange={(value) => update("sales", "keepCancelledSales", value)}
      />

      <ToggleField
        label="السماح بالمرتجعات"
        checked={data.allowReturns}
        onChange={(value) => update("sales", "allowReturns", value)}
      />

    </SettingGrid>
  );
}


/* =========================================================
   INVOICES
========================================================= */

function InvoiceSettings({
  data = {},
  update,
}) {
  return (
    <SettingGrid>

      <ToggleField
        label="إظهار شعار المتجر"
        checked={
          data.showLogo
        }
        onChange={(value) =>
          update(
            "invoices",
            "showLogo",
            value
          )
        }
      />


      <ToggleField
        label="إظهار بيانات المتجر"
        checked={
          data.showBusinessInfo
        }
        onChange={(value) =>
          update(
            "invoices",
            "showBusinessInfo",
            value
          )
        }
      />


      <ToggleField
        label="إظهار رقم الهاتف"
        checked={
          data.showPhone
        }
        onChange={(value) =>
          update(
            "invoices",
            "showPhone",
            value
          )
        }
      />


      <ToggleField
        label="إظهار العنوان"
        checked={
          data.showAddress
        }
        onChange={(value) =>
          update(
            "invoices",
            "showAddress",
            value
          )
        }
      />


      <ToggleField
        label="إظهار الخصم"
        checked={
          data.showDiscount
        }
        onChange={(value) =>
          update(
            "invoices",
            "showDiscount",
            value
          )
        }
      />


      <ToggleField
        label="إظهار الضرائب"
        checked={
          data.showTax
        }
        onChange={(value) =>
          update(
            "invoices",
            "showTax",
            value
          )
        }
      />


      <ToggleField
        label="إظهار المبلغ المدفوع والمتبقي"
        checked={
          data.showPaymentSummary
        }
        onChange={(value) =>
          update(
            "invoices",
            "showPaymentSummary",
            value
          )
        }
      />


      <SelectField
        label="حجم الإيصال"
        value={
          data.receiptSize
        }
        onChange={(value) =>
          update(
            "invoices",
            "receiptSize",
            value
          )
        }
        options={[
          {
            value: "80mm",
            label: "80mm",
          },

          {
            value: "58mm",
            label: "58mm",
          },

          {
            value: "a4",
            label: "A4",
          },
        ]}
      />


      <TextField
        label="نص أسفل الفاتورة"
        value={
          data.footerText
        }
        onChange={(value) =>
          update(
            "invoices",
            "footerText",
            value
          )
        }
        placeholder="شكرًا لزيارتكم"
      />


      <ToggleField
        label="إظهار العميل"
        checked={data.showCustomer}
        onChange={(value) => update("invoices", "showCustomer", value)}
      />

      <ToggleField
        label="إظهار SKU"
        checked={data.showSKU}
        onChange={(value) => update("invoices", "showSKU", value)}
      />

      <ToggleField
        label="إظهار اسم الموظف"
        checked={data.showCashier}
        onChange={(value) => update("invoices", "showCashier", value)}
      />

    </SettingGrid>
  );
}


/* =========================================================
   TAXES
========================================================= */

function TaxSettings({
  data = {},
  update,
}) {
  return (
    <div className="space-y-5">

      <ToggleField
        label="تفعيل الضرائب"
        checked={
          data.enabled
        }
        onChange={(value) =>
          update(
            "taxes",
            "enabled",
            value
          )
        }
      />


      <div className="grid gap-4 md:grid-cols-2">

        <NumberField
          label="نسبة الضريبة %"
          value={
            data.rate
          }
          onChange={(value) =>
            update(
              "taxes",
              "rate",
              value
            )
          }
        />


        <SelectField
          label="طريقة تطبيق الضريبة"
          value={
            data.mode
          }
          onChange={(value) =>
            update(
              "taxes",
              "mode",
              value
            )
          }
          options={[
            {
              value: "exclusive",
              label: "تضاف على السعر",
            },

            {
              value: "inclusive",
              label: "مضمنة في السعر",
            },
          ]}
        />

      </div>


      <ToggleField
        label="إظهار الضريبة في الفاتورة"
        checked={
          data.showOnInvoice
        }
        onChange={(value) =>
          update(
            "taxes",
            "showOnInvoice",
            value
          )
        }
      />

      <ToggleField
        label="إلزام الرقم الضريبي عند التفعيل"
        checked={data.taxNumberRequired}
        disabled={!data.enabled}
        onChange={(value) => update("taxes", "taxNumberRequired", value)}
      />

    </div>
  );
}


/* =========================================================
   INVENTORY
========================================================= */

function InventorySettings({
  data = {},
  update,
}) {
  return (
    <SettingGrid>

      <ToggleField
        label="تنبيهات المخزون المنخفض"
        checked={
          data.enableLowStockAlerts
        }
        onChange={(value) =>
          update(
            "inventory",
            "enableLowStockAlerts",
            value
          )
        }
      />


      <NumberField
        label="حد إعادة الطلب الافتراضي"
        value={
          data.defaultReorderLevel
        }
        onChange={(value) =>
          update(
            "inventory",
            "defaultReorderLevel",
            value
          )
        }
      />


      <ToggleField
        label="السماح بالمخزون السالب"
        description="يفضل إغلاقه."
        checked={
          data.allowNegativeStock
        }
        onChange={(value) =>
          update(
            "inventory",
            "allowNegativeStock",
            value
          )
        }
      />


      <ToggleField
        label="تتبع الحركات"
        checked={
          data.trackMovements
        }
        onChange={(value) =>
          update(
            "inventory",
            "trackMovements",
            value
          )
        }
      />


      <ToggleField
        label="خصم المخزون بعد البيع"
        checked={
          data.autoDeductOnSale
        }
        onChange={(value) =>
          update(
            "inventory",
            "autoDeductOnSale",
            value
          )
        }
      />


      <ToggleField
        label="إضافة المخزون بعد الشراء"
        checked={
          data.autoAddOnPurchase
        }
        onChange={(value) =>
          update(
            "inventory",
            "autoAddOnPurchase",
            value
          )
        }
      />


      <ToggleField
        label="خصم قطع الصيانة"
        checked={
          data.autoDeductOnRepair
        }
        onChange={(value) =>
          update(
            "inventory",
            "autoDeductOnRepair",
            value
          )
        }
      />


      <NumberField
        label="نافذة الحركات بالساعات"
        value={
          data.recentMovementHours
        }
        onChange={(value) =>
          update(
            "inventory",
            "recentMovementHours",
            value
          )
        }
      />


      <ToggleField
        label="تأكيد التعديل اليدوي"
        checked={data.confirmManualAdjustment}
        onChange={(value) => update("inventory", "confirmManualAdjustment", value)}
      />

      <ToggleField
        label="منع البيع فوق المخزون"
        description="يحمي النظام من بيع كمية أكبر من المتوفر."
        checked={data.preventOverselling}
        onChange={(value) => update("inventory", "preventOverselling", value)}
      />

      <ToggleField
        label="إظهار قيمة المخزون"
        checked={data.showStockValue}
        onChange={(value) => update("inventory", "showStockValue", value)}
      />

      <SelectField
        label="مصدر حد المخزون المنخفض"
        value={data.lowStockThresholdType}
        onChange={(value) => update("inventory", "lowStockThresholdType", value)}
        options={[
          { value: "reorderLevel", label: "حد إعادة الطلب" },
          { value: "fixed", label: "حد ثابت" },
        ]}
      />

    </SettingGrid>
  );
}


/* =========================================================
   PURCHASES
========================================================= */

function PurchaseSettings({
  data = {},
  update,
}) {
  return (
    <SettingGrid>

      <TextField
        label="بادئة الشراء"
        value={
          data.invoicePrefix
        }
        onChange={(value) =>
          update(
            "purchases",
            "invoicePrefix",
            value
          )
        }
      />


      <SelectField
        label="طريقة الدفع الافتراضية"
        value={
          data.defaultPaymentMethod
        }
        onChange={(value) =>
          update(
            "purchases",
            "defaultPaymentMethod",
            value
          )
        }
        options={[
          {
            value: "cash",
            label: "كاش",
          },
          {
            value: "card",
            label: "بطاقة",
          },
        ]}
      />


      <ToggleField
        label="السداد الجزئي"
        checked={
          data.allowPartialPayment
        }
        onChange={(value) =>
          update(
            "purchases",
            "allowPartialPayment",
            value
          )
        }
      />


      <ToggleField
        label="إجبار المورد"
        checked={
          data.requireSupplier
        }
        onChange={(value) =>
          update(
            "purchases",
            "requireSupplier",
            value
          )
        }
      />


      <ToggleField
        label="تحديث المخزون تلقائيًا"
        checked={
          data.autoUpdateInventory
        }
        onChange={(value) =>
          update(
            "purchases",
            "autoUpdateInventory",
            value
          )
        }
      />


      <ToggleField
        label="تتبع رصيد المورد"
        checked={
          data.trackSupplierBalance
        }
        onChange={(value) =>
          update(
            "purchases",
            "trackSupplierBalance",
            value
          )
        }
      />


      <ToggleField
        label="تأكيد استلام المشتريات"
        checked={data.confirmReceiving}
        onChange={(value) => update("purchases", "confirmReceiving", value)}
      />

      <ToggleField
        label="السماح بمرتجعات المشتريات"
        checked={data.allowPurchaseReturns}
        onChange={(value) => update("purchases", "allowPurchaseReturns", value)}
      />

    </SettingGrid>
  );
}


/* =========================================================
   REPAIRS
========================================================= */

function RepairSettings({
  data = {},
  update,
}) {
  return (
    <SettingGrid>

      <SelectField
        label="الحالة الافتراضية"
        value={
          data.defaultStatus
        }
        onChange={(value) =>
          update(
            "repairs",
            "defaultStatus",
            value
          )
        }
        options={[
          {
            value: "pending",
            label: "قيد الانتظار",
          },

          {
            value: "diagnosing",
            label: "جاري الفحص",
          },

          {
            value: "repairing",
            label: "قيد الصيانة",
          },
        ]}
      />


      <NumberField
        label="تنبيه التسليم قبل الموعد بالساعات"
        value={
          data.dueDateAlertHours
        }
        onChange={(value) =>
          update(
            "repairs",
            "dueDateAlertHours",
            value
          )
        }
      />


      <ToggleField
        label="إجبار اسم العميل"
        checked={
          data.requireCustomerName
        }
        onChange={(value) =>
          update(
            "repairs",
            "requireCustomerName",
            value
          )
        }
      />


      <ToggleField
        label="السداد الجزئي"
        checked={
          data.allowPartialPayment
        }
        onChange={(value) =>
          update(
            "repairs",
            "allowPartialPayment",
            value
          )
        }
      />


      <ToggleField
        label="خصم قطع الصيانة"
        checked={
          data.autoDeductParts
        }
        onChange={(value) =>
          update(
            "repairs",
            "autoDeductParts",
            value
          )
        }
      />


      <ToggleField
        label="تنبيهات مواعيد التسليم"
        checked={
          data.showDueDateAlerts
        }
        onChange={(value) =>
          update(
            "repairs",
            "showDueDateAlerts",
            value
          )
        }
      />


      <ToggleField
        label="إرفاق صور للصيانة"
        checked={data.allowRepairImages}
        onChange={(value) => update("repairs", "allowRepairImages", value)}
      />

      <ToggleField
        label="وصف المشكلة إجباري"
        checked={data.requireProblemDescription}
        onChange={(value) => update("repairs", "requireProblemDescription", value)}
      />

    </SettingGrid>
  );
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function NotificationSettings({
  data = {},
  update,
}) {
  const options = [
    [
      "showLowStock",
      "المخزون المنخفض",
    ],

    [
      "showOutOfStock",
      "نفاد المخزون",
    ],

    [
      "showNewSales",
      "المبيعات الجديدة",
    ],

    [
      "showNewPurchases",
      "المشتريات الجديدة",
    ],

    [
      "showNewOrders",
      "الطلبات الجديدة",
    ],

    [
      "showRepairAlerts",
      "تنبيهات الصيانة",
    ],

    [
      "showCustomerAlerts",
      "العملاء",
    ],

    [
      "showSupplierAlerts",
      "الموردون",
    ],

    [
      "showPaymentAlerts",
      "الدفعات والأرصدة",
    ],

    [
      "showExpenseAlerts",
      "المصاريف",
    ],
  ];


  return (
    <div className="space-y-5">

      <ToggleField
        label="تفعيل الإشعارات"
        description="المفتاح العام لنظام الإشعارات."
        checked={
          data.enabled
        }
        onChange={(value) =>
          update(
            "notifications",
            "enabled",
            value
          )
        }
      />


      <div className="grid gap-3 md:grid-cols-2">

        {options.map(
          ([key, label]) => (
            <ToggleField
              key={key}
              label={label}
              checked={
                data[key]
              }
              disabled={
                !data.enabled
              }
              onChange={(value) =>
                update(
                  "notifications",
                  key,
                  value
                )
              }
            />
          )
        )}

        <ToggleField
        label="صوت الإشعارات"
        checked={data.sound}
        disabled={!data.enabled}
        onChange={(value) => update("notifications", "sound", value)}
      />

    </div>


      <NumberField
        label="مدة الاحتفاظ بالإشعارات بالأيام"
        value={
          data.retentionDays
        }
        onChange={(value) =>
          update(
            "notifications",
            "retentionDays",
            value
          )
        }
      />

    </div>
  );
}


/* =========================================================
   SEARCH
========================================================= */

function SearchSettings({
  data = {},
  update,
}) {
  return (
    <SettingGrid>

      <ToggleField
        label="تفعيل البحث العام"
        description="البحث من Topbar داخل النظام."
        checked={
          data.enabled
        }
        onChange={(value) =>
          update(
            "search",
            "enabled",
            value
          )
        }
      />


      <ToggleField
        label="البحث عن المنتجات"
        checked={
          data.products
        }
        onChange={(value) =>
          update(
            "search",
            "products",
            value
          )
        }
      />


      <ToggleField
        label="البحث عن الطلبات"
        checked={
          data.orders
        }
        onChange={(value) =>
          update(
            "search",
            "orders",
            value
          )
        }
      />


      <ToggleField
        label="البحث عن العملاء"
        checked={
          data.customers
        }
        onChange={(value) =>
          update(
            "search",
            "customers",
            value
          )
        }
      />


      <ToggleField
        label="البحث عن الصيانة"
        checked={
          data.repairs
        }
        onChange={(value) =>
          update(
            "search",
            "repairs",
            value
          )
        }
      />


      <ToggleField
        label="اختصار /"
        description="فتح البحث العام بسرعة."
        checked={
          data.keyboardShortcut
        }
        onChange={(value) =>
          update(
            "search",
            "keyboardShortcut",
            value
          )
        }
      />


      <NumberField
        label="أقصى عدد للنتائج"
        value={
          data.maxResults
        }
        onChange={(value) =>
          update(
            "search",
            "maxResults",
            value
          )
        }
      />


      <ToggleField
        label="البحث عن الموردين"
        checked={data.suppliers}
        disabled={!data.enabled}
        onChange={(value) => update("search", "suppliers", value)}
      />

      <ToggleField
        label="البحث عن المبيعات"
        checked={data.sales}
        disabled={!data.enabled}
        onChange={(value) => update("search", "sales", value)}
      />

      <ToggleField
        label="البحث عن المشتريات"
        checked={data.purchases}
        disabled={!data.enabled}
        onChange={(value) => update("search", "purchases", value)}
      />

    </SettingGrid>
  );
}


/* =========================================================
   ONLINE STORE
========================================================= */

function StoreSettings({
  data = {},
  update,
}) {
  return (
    <SettingGrid>

      <ToggleField
        label="تفعيل المتجر الإلكتروني"
        checked={
          data.enabled
        }
        onChange={(value) =>
          update(
            "store",
            "enabled",
            value
          )
        }
      />


      <ToggleField
        label="وضع الصيانة"
        checked={
          data.maintenanceMode
        }
        onChange={(value) =>
          update(
            "store",
            "maintenanceMode",
            value
          )
        }
      />


      <ToggleField
        label="إظهار الأسعار"
        checked={
          data.showPrices
        }
        onChange={(value) =>
          update(
            "store",
            "showPrices",
            value
          )
        }
      />


      <ToggleField
        label="السماح بالشراء كضيف"
        checked={
          data.allowGuestCheckout
        }
        onChange={(value) =>
          update(
            "store",
            "allowGuestCheckout",
            value
          )
        }
      />


      <ToggleField
        label="الهاتف إجباري"
        checked={
          data.requirePhone
        }
        onChange={(value) =>
          update(
            "store",
            "requirePhone",
            value
          )
        }
      />


      <ToggleField
        label="المراجعات"
        checked={
          data.allowReviews
        }
        onChange={(value) =>
          update(
            "store",
            "allowReviews",
            value
          )
        }
      />


      <ToggleField
        label="المفضلة"
        checked={
          data.allowFavorites
        }
        onChange={(value) =>
          update(
            "store",
            "allowFavorites",
            value
          )
        }
      />


      <ToggleField
        label="الكوبونات"
        checked={
          data.allowCoupons
        }
        onChange={(value) =>
          update(
            "store",
            "allowCoupons",
            value
          )
        }
      />


      <SelectField
        label="ترتيب المنتجات"
        value={
          data.defaultSort
        }
        onChange={(value) =>
          update(
            "store",
            "defaultSort",
            value
          )
        }
        options={[
          {
            value: "featured",
            label: "مميزة",
          },

          {
            value: "newest",
            label: "الأحدث",
          },

          {
            value: "price_low",
            label: "السعر: الأقل",
          },

          {
            value: "price_high",
            label: "السعر: الأعلى",
          },
        ]}
      />


      <ToggleField
        label="عرض حالة المخزون"
        checked={data.showStockStatus}
        onChange={(value) => update("store", "showStockStatus", value)}
      />

      <ToggleField
        label="أسئلة المنتجات"
        checked={data.allowProductQuestions}
        onChange={(value) => update("store", "allowProductQuestions", value)}
      />

      <NumberField
        label="عدد المنتجات في الصفحة"
        value={data.productsPerPage}
        onChange={(value) => update("store", "productsPerPage", value)}
      />

    </SettingGrid>
  );
}


/* =========================================================
   SECURITY
========================================================= */

function SecuritySettings({
  data = {},
  update,
}) {
  return (
    <SettingGrid>

      <NumberField
        label="انتهاء الجلسة بالدقائق"
        value={
          data.sessionTimeoutMinutes
        }
        onChange={(value) =>
          update(
            "security",
            "sessionTimeoutMinutes",
            value
          )
        }
      />


      <ToggleField
        label="تأكيد الحذف"
        checked={
          data.requireConfirmDelete
        }
        onChange={(value) =>
          update(
            "security",
            "requireConfirmDelete",
            value
          )
        }
      />


      <ToggleField
        label="تأكيد تعديل المخزون"
        checked={
          data.requireConfirmStockAdjustment
        }
        onChange={(value) =>
          update(
            "security",
            "requireConfirmStockAdjustment",
            value
          )
        }
      />


      <ToggleField
        label="تأكيد الدفعات"
        checked={
          data.requireConfirmPayment
        }
        onChange={(value) =>
          update(
            "security",
            "requireConfirmPayment",
            value
          )
        }
      />


      <ToggleField
        label="حماية Reset الإعدادات"
        description="لا يسمح بإعادة الإعدادات دون تأكيد صريح."
        checked={data.protectSettingsReset}
        onChange={(value) => update("security", "protectSettingsReset", value)}
      />

      <ToggleField
        label="حماية استيراد الإعدادات"
        checked={data.protectDataImport}
        onChange={(value) => update("security", "protectDataImport", value)}
      />

    </SettingGrid>
  );
}


/* =========================================================
   DATA
========================================================= */

function DataSettings({
  data = {},
  update,
}) {
  return (
    <div className="space-y-5">

      <ToggleField
        label="النسخ الاحتياطي التلقائي"
        description="جاهز للربط الفعلي مع الـBackend."
        checked={
          data.autoBackup
        }
        onChange={(value) =>
          update(
            "data",
            "autoBackup",
            value
          )
        }
      />


      <SelectField
        label="تكرار النسخ"
        value={
          data.backupFrequency
        }
        onChange={(value) =>
          update(
            "data",
            "backupFrequency",
            value
          )
        }
        options={[
          {
            value: "hourly",
            label: "كل ساعة",
          },

          {
            value: "daily",
            label: "يومي",
          },

          {
            value: "weekly",
            label: "أسبوعي",
          },
        ]}
      />


      <ToggleField
        label="الاحتفاظ بالبيانات المحلية"
        checked={
          data.keepLocalData
        }
        onChange={(value) =>
          update(
            "data",
            "keepLocalData",
            value
          )
        }
      />


      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

        <div className="flex items-start gap-3">

          <Database
            size={21}
            className="mt-0.5 text-blue-700"
          />

          <div>

            <p className="font-black text-slate-900">
              بيانات النظام
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              تصدير واستيراد الإعدادات منفصل عن
              بيانات المبيعات والمخزون. عند بناء
              الـBackend سيتم إضافة Backup كامل للبيانات.
            </p>

            <ToggleField
        label="تصدير البيانات التشغيلية مع الإعدادات"
        description="مغلق افتراضيًا حتى لا تختلط إعدادات النظام ببيانات المبيعات والمخزون."
        checked={data.exportIncludesOperationalData}
        onChange={(value) => update("data", "exportIncludesOperationalData", value)}
      />

      <ToggleField
        label="تأكيد حذف البيانات"
        checked={data.confirmDataClear}
        onChange={(value) => update("data", "confirmDataClear", value)}
      />

    </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   BACKEND
========================================================= */

function BackendSettings({
  data = {},
  update,
}) {
  return (
    <div className="space-y-6">

      <SectionIntro
        title="إعدادات الـBackend"
        text="الـcontract موجود الآن، والتنفيذ الفعلي للاتصال وقاعدة البيانات سيكون في مرحلة الـBackend."
      />


      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">

        <div className="flex items-start gap-3">

          <Server
            size={21}
            className="mt-0.5 text-orange-600"
          />

          <div>

            <p className="font-black text-slate-900">
              الوضع الحالي: Local
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              تغيير هذه القيم لا ينشئ Backend بحد ذاته.
            </p>

          </div>

        </div>

      </div>


      <div className="grid gap-4 md:grid-cols-2">

        <SelectField
          label="مصدر البيانات"
          value={
            data.mode
          }
          onChange={(value) =>
            update(
              "backend",
              "mode",
              value
            )
          }
          options={[
            {
              value: "local",
              label: "Local / Zustand",
            },

            {
              value: "api",
              label: "API",
            },
          ]}
        />


        <TextField
          label="API Base URL"
          value={
            data.apiBaseUrl
          }
          onChange={(value) =>
            update(
              "backend",
              "apiBaseUrl",
              value
            )
          }
          placeholder="https://api.example.com"
        />


        <TextField
          label="API Version"
          value={
            data.apiVersion
          }
          onChange={(value) =>
            update(
              "backend",
              "apiVersion",
              value
            )
          }
          placeholder="v1"
        />


        <NumberField
          label="فاصل المزامنة بالثواني"
          value={
            data.syncIntervalSeconds
          }
          onChange={(value) =>
            update(
              "backend",
              "syncIntervalSeconds",
              value
            )
          }
        />


        <NumberField
          label="مهلة الاتصال بالثواني"
          value={data.connectionTimeoutSeconds}
          onChange={(value) =>
            update(
              "backend",
              "connectionTimeoutSeconds",
              value
            )
          }
        />

        <NumberField
          label="عدد محاولات إعادة الاتصال"
          value={data.retryAttempts}
          onChange={(value) =>
            update(
              "backend",
              "retryAttempts",
              value
            )
          }
        />
      </div>


      <ToggleField
        label="تفعيل المزامنة"
        description="سيتم تشغيلها فعليًا بعد بناء طبقة الـAPI."
        checked={
          data.syncEnabled
        }
        onChange={(value) =>
          update(
            "backend",
            "syncEnabled",
            value
          )
        }
      />

    </div>
  );
}


/* =========================================================
   UI HELPERS
========================================================= */

function SectionIntro({
  title,
  text,
}) {
  return (
    <div>

      <h3 className="text-lg font-black text-slate-900">
        {title}
      </h3>

      <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}


function SettingGrid({
  children,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {children}
    </div>
  );
}


function TextField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        value={
          value ?? ""
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />

    </div>
  );
}


function NumberField({
  label,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        type="number"
        min="0"
        value={
          value ?? ""
        }
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />

    </div>
  );
}


function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <select
        value={
          value ?? ""
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      >

        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          )
        )}

      </select>

    </div>
  );
}


function ToggleField({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <button
      type="button"
      disabled={
        disabled
      }
      onClick={() =>
        onChange(
          !checked
        )
      }
      className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-right transition ${
        disabled
          ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
          : checked
            ? "border-blue-100 bg-blue-50/40"
            : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >

      <div>

        <p className="text-sm font-black text-slate-800">
          {label}
        </p>

        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>
        )}

      </div>


      <div
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-blue-700"
            : "bg-slate-200"
        }`}
      >

        <div
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "right-1"
              : "left-1"
          }`}
        />

      </div>

    </button>
  );
}


function ChoiceCard({
  active,
  title,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-2xl border p-5 text-right transition ${
        active
          ? "border-blue-300 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >

      <div
        className={`mb-4 h-8 w-8 rounded-lg ${
          active
            ? "bg-blue-700"
            : "bg-slate-200"
        }`}
      />

      <p className="font-black">
        {title}
      </p>

    </button>
  );
}


export default Settings;