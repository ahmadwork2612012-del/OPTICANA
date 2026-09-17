import {
  PanelsTopLeft,
  Info,
  Phone,
  HelpCircle,
  LayoutTemplate,
  Settings2,
  Search,
  Save,
  RotateCcw,
  Eye,
  ImagePlus,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import useStoreContentStore from "../store/storeContentStore";

const TABS = [
  {
    id: "home",
    label: "الرئيسية",
    icon: PanelsTopLeft,
  },

  {
    id: "about",
    label: "من نحن",
    icon: Info,
  },

  {
    id: "contact",
    label: "التواصل",
    icon: Phone,
  },

  {
    id: "faq",
    label: "الأسئلة الشائعة",
    icon: HelpCircle,
  },

  {
    id: "footer",
    label: "الفوتر",
    icon: LayoutTemplate,
  },

  {
    id: "maintenance",
    label: "الصيانة",
    icon: Settings2,
  },

  {
    id: "seo",
    label: "SEO",
    icon: Search,
  },
];

function StoreContent() {
  const content =
    useStoreContentStore(
      (state) => state.content
    );

  const updateSection =
    useStoreContentStore(
      (state) =>
        state.updateSection
    );

  const updateNestedSection =
    useStoreContentStore(
      (state) =>
        state.updateNestedSection
    );

  const resetContent =
    useStoreContentStore(
      (state) =>
        state.resetContent
    );

  const loadContent =
    useStoreContentStore(
      (state) => state.loadContent
    );

  const saveContent =
    useStoreContentStore(
      (state) => state.saveContent
    );

  useEffect(() => {
    loadContent().catch((error) => {
      toast.error(error?.message || "تعذر تحميل محتوى المتجر");
    });
  }, [loadContent]);

  const [activeTab, setActiveTab] =
    useState("home");

  const [saved, setSaved] =
    useState(false);

  const activeTabInfo =
    useMemo(
      () =>
        TABS.find(
          (tab) =>
            tab.id ===
            activeTab
        ),
      [activeTab]
    );

  const handleUpdate =
    (
      section,
      updates
    ) => {
      updateSection(
        section,
        updates
      );

      setSaved(false);
    };

  const handleNested =
    (
      section,
      nested,
      updates
    ) => {
      updateNestedSection(
        section,
        nested,
        updates
      );

      setSaved(false);
    };

  const handleSave = async () => {
    try {
      await saveContent();
      setSaved(true);
      toast.success("تم حفظ تغييرات المحتوى");
    } catch (error) {
      setSaved(false);
      toast.error(error?.message || "تعذر حفظ محتوى المتجر");
    }
  };

  const handleReset =
    async () => {
      const confirmed =
        window.confirm(
          "هل تريد إعادة محتوى المتجر للإعدادات الافتراضية؟"
        );

      if (!confirmed) {
        return;
      }

      resetContent();

      try {
        await saveContent();
        setSaved(true);
        toast.success("تمت إعادة المحتوى الافتراضي");
      } catch (error) {
        toast.error(error?.message || "تعذر حفظ المحتوى");
      }
    };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
            <PanelsTopLeft
              size={15}
            />
            إدارة محتوى المتجر
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            CMS
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            تحكم كامل بمحتوى متجر OPTICANA
            بدون تعديل الكود.
          </p>

        </div>


        <div className="flex gap-2">

          <button
            type="button"
            onClick={
              handleReset
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <RotateCcw
              size={17}
            />
            استعادة الافتراضي
          </button>


          <button
            type="button"
            onClick={
              handleSave
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-800"
          >
            <Save size={17} />
            {saved
              ? "تم الحفظ"
              : "حفظ التغييرات"}
          </button>

        </div>

      </div>


      {/* NAVIGATION */}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

        <div className="flex min-w-max gap-1">

          {TABS.map(
            (tab) => {
              const Icon =
                tab.icon;

              const active =
                activeTab ===
                tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
                  }
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition ${
                    active
                      ? "bg-blue-700 text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    size={17}
                  />

                  {tab.label}
                </button>
              );
            }
          )}

        </div>

      </div>


      {/* ACTIVE SECTION */}

      <div>

        <div className="mb-5 flex items-center gap-3">

          {activeTabInfo && (
            <>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                <activeTabInfo.icon
                  size={19}
                />
              </div>

              <div>
                <h2 className="font-black text-slate-900">
                  {
                    activeTabInfo.label
                  }
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  تعديل محتوى هذا الجزء من المتجر.
                </p>
              </div>
            </>
          )}

        </div>


        {activeTab ===
          "home" && (
          <HomeEditor
            content={
              content.home
            }
            onUpdate={(
              updates
            ) =>
              handleUpdate(
                "home",
                updates
              )
            }
            onNested={
              handleNested
            }
          />
        )}


        {activeTab ===
          "about" && (
          <AboutEditor
            content={
              content.about
            }
            onUpdate={(
              updates
            ) =>
              handleUpdate(
                "about",
                updates
              )
            }
          />
        )}


        {activeTab ===
          "contact" && (
          <ContactEditor
            content={
              content.contact
            }
            onUpdate={(
              updates
            ) =>
              handleUpdate(
                "contact",
                updates
              )
            }
          />
        )}


        {activeTab ===
          "faq" && (
          <FaqEditor
            content={
              content.faq
            }
            onUpdate={(
              updates
            ) =>
              handleUpdate(
                "faq",
                updates
              )
            }
          />
        )}


        {activeTab ===
          "footer" && (
          <FooterEditor
            content={
              content.footer
            }
            onUpdate={(
              updates
            ) =>
              handleUpdate(
                "footer",
                updates
              )
            }
          />
        )}


        {activeTab ===
          "maintenance" && (
          <MaintenanceEditor
            content={
              content.maintenance
            }
            onUpdate={(
              updates
            ) =>
              handleUpdate(
                "maintenance",
                updates
              )
            }
          />
        )}


        {activeTab ===
          "seo" && (
          <SeoEditor
            content={
              content.seo
            }
            onUpdate={(
              updates
            ) =>
              handleUpdate(
                "seo",
                updates
              )
            }
          />
        )}

      </div>

    </div>
  );
}


/* =====================================
   HOME EDITOR
===================================== */

function HomeEditor({
  content,
  onUpdate,
  onNested,
}) {
  return (
    <div className="space-y-6">

      <EditorCard
        title="Hero"
        description="المحتوى الرئيسي أعلى الصفحة."
      >
        <ToggleField
          label="تفعيل الـHero"
          checked={
            content.hero.enabled
          }
          onChange={(value) =>
            onNested(
              "home",
              "hero",
              {
                enabled: value,
              }
            )
          }
        />

        <div className="grid gap-4 md:grid-cols-2">

          <TextField
            label="العنوان"
            value={
              content.hero.title
            }
            onChange={(value) =>
              onNested(
                "home",
                "hero",
                {
                  title: value,
                }
              )
            }
          />

          <TextField
            label="النص الفرعي"
            value={
              content.hero.subtitle
            }
            onChange={(value) =>
              onNested(
                "home",
                "hero",
                {
                  subtitle:
                    value,
                }
              )
            }
          />

        </div>

        <ImageField
          label="صورة الـHero"
          value={
            content.hero.image
          }
          onChange={(value) =>
            onNested(
              "home",
              "hero",
              {
                image: value,
              }
            )
          }
        />

        <div className="grid gap-4 md:grid-cols-2">

          <ButtonEditor
            title="الزر الأساسي"
            data={
              content.hero
                .primaryButton
            }
            onChange={(
              value
            ) =>
              onNested(
                "home",
                "hero",
                {
                  primaryButton:
                    value,
                }
              )
            }
          />

          <ButtonEditor
            title="الزر الثانوي"
            data={
              content.hero
                .secondaryButton
            }
            onChange={(
              value
            ) =>
              onNested(
                "home",
                "hero",
                {
                  secondaryButton:
                    value,
                }
              )
            }
          />

        </div>

      </EditorCard>


      <EditorCard
        title="شريط الإعلان"
        description="رسالة صغيرة أعلى المتجر."
      >
        <ToggleField
          label="تفعيل الشريط"
          checked={
            content.announcement
              .enabled
          }
          onChange={(value) =>
            onNested(
              "home",
              "announcement",
              {
                enabled: value,
              }
            )
          }
        />

        <TextField
          label="النص"
          value={
            content.announcement
              .text
          }
          onChange={(value) =>
            onNested(
              "home",
              "announcement",
              {
                text: value,
              }
            )
          }
        />

        <TextField
          label="الرابط"
          value={
            content.announcement
              .link
          }
          onChange={(value) =>
            onNested(
              "home",
              "announcement",
              {
                link: value,
              }
            )
          }
        />
      </EditorCard>


      <EditorCard
        title="المنتجات المميزة"
      >
        <ToggleField
          label="إظهار القسم"
          checked={
            content.featuredProducts
              .enabled
          }
          onChange={(value) =>
            onNested(
              "home",
              "featuredProducts",
              {
                enabled:
                  value,
              }
            )
          }
        />

        <div className="grid gap-4 md:grid-cols-3">

          <TextField
            label="العنوان"
            value={
              content
                .featuredProducts
                .title
            }
            onChange={(value) =>
              onNested(
                "home",
                "featuredProducts",
                {
                  title: value,
                }
              )
            }
          />

          <TextField
            label="الوصف"
            value={
              content
                .featuredProducts
                .description
            }
            onChange={(value) =>
              onNested(
                "home",
                "featuredProducts",
                {
                  description:
                    value,
                }
              )
            }
          />

          <NumberField
            label="عدد المنتجات"
            value={
              content
                .featuredProducts
                .limit
            }
            onChange={(value) =>
              onNested(
                "home",
                "featuredProducts",
                {
                  limit:
                    Number(
                      value || 0
                    ),
                }
              )
            }
          />

        </div>
      </EditorCard>


      <EditorCard
        title="التصنيفات"
      >
        <ToggleField
          label="إظهار القسم"
          checked={
            content.categories
              .enabled
          }
          onChange={(value) =>
            onNested(
              "home",
              "categories",
              {
                enabled: value,
              }
            )
          }
        />

        <div className="grid gap-4 md:grid-cols-3">

          <TextField
            label="العنوان"
            value={
              content.categories
                .title
            }
            onChange={(value) =>
              onNested(
                "home",
                "categories",
                {
                  title: value,
                }
              )
            }
          />

          <TextField
            label="الوصف"
            value={
              content.categories
                .description
            }
            onChange={(value) =>
              onNested(
                "home",
                "categories",
                {
                  description:
                    value,
                }
              )
            }
          />

          <NumberField
            label="عدد التصنيفات"
            value={
              content.categories
                .limit
            }
            onChange={(value) =>
              onNested(
                "home",
                "categories",
                {
                  limit:
                    Number(
                      value || 0
                    ),
                }
              )
            }
          />

        </div>
      </EditorCard>


      <EditorCard
        title="لماذا OPTICANA؟"
      >
        <ToggleField
          label="إظهار القسم"
          checked={
            content.whyUs
              .enabled
          }
          onChange={(value) =>
            onNested(
              "home",
              "whyUs",
              {
                enabled: value,
              }
            )
          }
        />

        <TextField
          label="العنوان"
          value={
            content.whyUs.title
          }
          onChange={(value) =>
            onNested(
              "home",
              "whyUs",
              {
                title: value,
              }
            )
          }
        />

        <TextArea
          label="الوصف"
          value={
            content.whyUs
              .description
          }
          onChange={(value) =>
            onNested(
              "home",
              "whyUs",
              {
                description:
                  value,
              }
            )
          }
        />

        <ArrayEditor
          items={
            content.whyUs.items
          }
          title="المميزات"
          itemLabel="ميزة"
          emptyText="لا توجد مميزات."
          createItem={() => ({
            id: `why-${Date.now()}`,
            title: "",
            description: "",
          })}
          fields={[
            {
              key: "title",
              label: "العنوان",
            },
            {
              key: "description",
              label: "الوصف",
            },
          ]}
          onChange={(items) =>
            onNested(
              "home",
              "whyUs",
              {
                items,
              }
            )
          }
        />
      </EditorCard>


      <EditorCard
        title="الإحصائيات"
      >
        <ToggleField
          label="إظهار الإحصائيات"
          checked={
            content.statistics
              .enabled
          }
          onChange={(value) =>
            onNested(
              "home",
              "statistics",
              {
                enabled:
                  value,
              }
            )
          }
        />

        <div className="grid gap-4 md:grid-cols-2">

          <TextField
            label="العنوان"
            value={
              content.statistics
                .title
            }
            onChange={(value) =>
              onNested(
                "home",
                "statistics",
                {
                  title: value,
                }
              )
            }
          />

        </div>

        <ArrayEditor
          items={
            content.statistics
              .items
          }
          title="الإحصائيات"
          itemLabel="إحصائية"
          emptyText="لا توجد إحصائيات."
          createItem={() => ({
            id: `stat-${Date.now()}`,
            label: "",
            value: "",
          })}
          fields={[
            {
              key: "label",
              label: "الاسم",
            },
            {
              key: "value",
              label: "القيمة",
            },
          ]}
          onChange={(items) =>
            onNested(
              "home",
              "statistics",
              {
                items,
              }
            )
          }
        />
      </EditorCard>


      <EditorCard
        title="العروض"
      >
        <ToggleField
          label="إظهار قسم العروض"
          checked={
            content.offers
              .enabled
          }
          onChange={(value) =>
            onNested(
              "home",
              "offers",
              {
                enabled:
                  value,
              }
            )
          }
        />

        <TextField
          label="العنوان"
          value={
            content.offers
              .title
          }
          onChange={(value) =>
            onNested(
              "home",
              "offers",
              {
                title: value,
              }
            )
          }
        />

        <TextArea
          label="الوصف"
          value={
            content.offers
              .description
          }
          onChange={(value) =>
            onNested(
              "home",
              "offers",
              {
                description:
                  value,
              }
            )
          }
        />
      </EditorCard>


      <EditorCard
        title="المراجعات"
      >
        <ToggleField
          label="إظهار المراجعات"
          checked={
            content.reviews
              .enabled
          }
          onChange={(value) =>
            onNested(
              "home",
              "reviews",
              {
                enabled:
                  value,
              }
            )
          }
        />

        <div className="grid gap-4 md:grid-cols-2">

          <TextField
            label="العنوان"
            value={
              content.reviews
                .title
            }
            onChange={(value) =>
              onNested(
                "home",
                "reviews",
                {
                  title: value,
                }
              )
            }
          />

          <TextField
            label="الوصف"
            value={
              content.reviews
                .description
            }
            onChange={(value) =>
              onNested(
                "home",
                "reviews",
                {
                  description:
                    value,
                }
              )
            }
          />

        </div>
      </EditorCard>


      <EditorCard
        title="FAQ"
      >
        <ToggleField
          label="إظهار FAQ"
          checked={
            content.faq
              .enabled
          }
          onChange={(value) =>
            onNested(
              "home",
              "faq",
              {
                enabled:
                  value,
              }
            )
          }
        />

        <TextField
          label="العنوان"
          value={
            content.faq.title
          }
          onChange={(value) =>
            onNested(
              "home",
              "faq",
              {
                title: value,
              }
            )
          }
        />

        <TextArea
          label="الوصف"
          value={
            content.faq.description
          }
          onChange={(value) =>
            onNested(
              "home",
              "faq",
              {
                description:
                  value,
              }
            )
          }
        />
      </EditorCard>


      <EditorCard
        title="CTA"
      >
        <ToggleField
          label="إظهار CTA"
          checked={
            content.cta
              .enabled
          }
          onChange={(value) =>
            onNested(
              "home",
              "cta",
              {
                enabled:
                  value,
              }
            )
          }
        />

        <div className="grid gap-4 md:grid-cols-2">

          <TextField
            label="العنوان"
            value={
              content.cta
                .title
            }
            onChange={(value) =>
              onNested(
                "home",
                "cta",
                {
                  title: value,
                }
              )
            }
          />

          <TextField
            label="نص الزر"
            value={
              content.cta
                .buttonText
            }
            onChange={(value) =>
              onNested(
                "home",
                "cta",
                {
                  buttonText:
                    value,
                }
              )
            }
          />

        </div>

        <TextArea
          label="الوصف"
          value={
            content.cta
              .description
          }
          onChange={(value) =>
            onNested(
              "home",
              "cta",
              {
                description:
                  value,
              }
            )
          }
        />

        <TextField
          label="رابط الزر"
          value={
            content.cta
              .buttonLink
          }
          onChange={(value) =>
            onNested(
              "home",
              "cta",
              {
                buttonLink:
                  value,
              }
            )
          }
        />
      </EditorCard>

    </div>
  );
}


/* =====================================
   ABOUT
===================================== */

function AboutEditor({
  content,
  onUpdate,
}) {
  return (
    <EditorCard
      title="من نحن"
      description="كل محتوى صفحة About."
    >
      <ToggleField
        label="تفعيل الصفحة"
        checked={
          content.enabled
        }
        onChange={(value) =>
          onUpdate({
            enabled:
              value,
          })
        }
      />

      <TextField
        label="العنوان"
        value={
          content.title
        }
        onChange={(value) =>
          onUpdate({
            title: value,
          })
        }
      />

      <TextArea
        label="الوصف"
        value={
          content.description
        }
        onChange={(value) =>
          onUpdate({
            description:
              value,
          })
        }
      />

      <ImageField
        label="الصورة"
        value={
          content.image
        }
        onChange={(value) =>
          onUpdate({
            image: value,
          })
        }
      />

      <div className="grid gap-4 md:grid-cols-2">

        <TextArea
          label="الرؤية"
          value={
            content.vision
          }
          onChange={(value) =>
            onUpdate({
              vision: value,
            })
          }
        />

        <TextArea
          label="المهمة"
          value={
            content.mission
          }
          onChange={(value) =>
            onUpdate({
              mission:
                value,
            })
          }
        />

      </div>

      <ArrayEditor
        items={
          content.features
        }
        title="المميزات"
        itemLabel="ميزة"
        emptyText="لا توجد مميزات."
        createItem={() => ({
          id: `feature-${Date.now()}`,
          title: "",
          description: "",
        })}
        fields={[
          {
            key: "title",
            label: "العنوان",
          },
          {
            key: "description",
            label: "الوصف",
          },
        ]}
        onChange={(items) =>
          onUpdate({
            features:
              items,
          })
        }
      />

      <ArrayEditor
        items={
          content.statistics
        }
        title="الإحصائيات"
        itemLabel="إحصائية"
        emptyText="لا توجد إحصائيات."
        createItem={() => ({
          id: `about-stat-${Date.now()}`,
          label: "",
          value: "",
        })}
        fields={[
          {
            key: "label",
            label: "الاسم",
          },
          {
            key: "value",
            label: "القيمة",
          },
        ]}
        onChange={(items) =>
          onUpdate({
            statistics:
              items,
          })
        }
      />
    </EditorCard>
  );
}


/* =====================================
   CONTACT
===================================== */

function ContactEditor({
  content,
  onUpdate,
}) {
  return (
    <EditorCard
      title="التواصل"
      description="بيانات الاتصال والسوشيال ميديا."
    >
      <ToggleField
        label="تفعيل صفحة التواصل"
        checked={
          content.enabled
        }
        onChange={(value) =>
          onUpdate({
            enabled:
              value,
          })
        }
      />

      <div className="grid gap-4 md:grid-cols-2">

        <TextField
          label="العنوان"
          value={
            content.title
          }
          onChange={(value) =>
            onUpdate({
              title: value,
            })
          }
        />

        <TextField
          label="الهاتف"
          value={
            content.phone
          }
          onChange={(value) =>
            onUpdate({
              phone: value,
            })
          }
        />

        <TextField
          label="واتساب"
          value={
            content.whatsapp
          }
          onChange={(value) =>
            onUpdate({
              whatsapp:
                value,
            })
          }
        />

        <TextField
          label="البريد"
          value={
            content.email
          }
          onChange={(value) =>
            onUpdate({
              email:
                value,
            })
          }
        />

        <TextField
          label="العنوان"
          value={
            content.address
          }
          onChange={(value) =>
            onUpdate({
              address:
                value,
            })
          }
        />

        <TextField
          label="ساعات العمل"
          value={
            content.workingHours
          }
          onChange={(value) =>
            onUpdate({
              workingHours:
                value,
            })
          }
        />

        <TextField
          label="Instagram"
          value={
            content.instagram
          }
          onChange={(value) =>
            onUpdate({
              instagram:
                value,
            })
          }
        />

        <TextField
          label="Facebook"
          value={
            content.facebook
          }
          onChange={(value) =>
            onUpdate({
              facebook:
                value,
            })
          }
        />

        <TextField
          label="TikTok"
          value={
            content.tiktok
          }
          onChange={(value) =>
            onUpdate({
              tiktok:
                value,
            })
          }
        />

        <TextField
          label="رابط الخريطة"
          value={
            content.mapUrl
          }
          onChange={(value) =>
            onUpdate({
              mapUrl:
                value,
            })
          }
        />

      </div>

      <TextArea
        label="الوصف"
        value={
          content.description
        }
        onChange={(value) =>
          onUpdate({
            description:
              value,
          })
        }
      />
    </EditorCard>
  );
}


/* =====================================
   FAQ
===================================== */

function FaqEditor({
  content,
  onUpdate,
}) {
  return (
    <EditorCard
      title="الأسئلة الشائعة"
      description="أضف وعدّل واحذف الأسئلة."
    >
      <ToggleField
        label="تفعيل FAQ"
        checked={
          content.enabled
        }
        onChange={(value) =>
          onUpdate({
            enabled:
              value,
          })
        }
      />

      <div className="grid gap-4 md:grid-cols-2">

        <TextField
          label="العنوان"
          value={
            content.title
          }
          onChange={(value) =>
            onUpdate({
              title: value,
            })
          }
        />

        <TextField
          label="الوصف"
          value={
            content.description
          }
          onChange={(value) =>
            onUpdate({
              description:
                value,
            })
          }
        />

      </div>

      <ArrayEditor
        items={
          content.items
        }
        title="الأسئلة"
        itemLabel="سؤال"
        emptyText="لا توجد أسئلة."
        createItem={() => ({
          id: `faq-${Date.now()}`,
          question: "",
          answer: "",
          order: 0,
          active: true,
        })}
        fields={[
          {
            key: "question",
            label: "السؤال",
          },
          {
            key: "answer",
            label: "الإجابة",
            textarea: true,
          },
        ]}
        onChange={(items) =>
          onUpdate({
            items,
          })
        }
      />
    </EditorCard>
  );
}


/* =====================================
   FOOTER
===================================== */

function FooterEditor({
  content,
  onUpdate,
}) {
  return (
    <EditorCard
      title="Footer"
      description="الروابط والمعلومات أسفل المتجر."
    >
      <ToggleField
        label="تفعيل الـFooter"
        checked={
          content.enabled
        }
        onChange={(value) =>
          onUpdate({
            enabled:
              value,
          })
        }
      />

      <TextArea
        label="الوصف"
        value={
          content.description
        }
        onChange={(value) =>
          onUpdate({
            description:
              value,
          })
        }
      />

      <ArrayEditor
        items={
          content.quickLinks
        }
        title="الروابط"
        itemLabel="رابط"
        emptyText="لا توجد روابط."
        createItem={() => ({
          id: `footer-link-${Date.now()}`,
          label: "",
          path: "/",
          enabled: true,
        })}
        fields={[
          {
            key: "label",
            label: "النص",
          },
          {
            key: "path",
            label: "الرابط",
          },
        ]}
        onChange={(items) =>
          onUpdate({
            quickLinks:
              items,
          })
        }
      />

      <div className="grid gap-4 md:grid-cols-2">

        <TextField
          label="Instagram"
          value={
            content.socialLinks
              .instagram
          }
          onChange={(value) =>
            onUpdate({
              socialLinks: {
                ...content.socialLinks,
                instagram:
                  value,
              },
            })
          }
        />

        <TextField
          label="Facebook"
          value={
            content.socialLinks
              .facebook
          }
          onChange={(value) =>
            onUpdate({
              socialLinks: {
                ...content.socialLinks,
                facebook:
                  value,
              },
            })
          }
        />

        <TextField
          label="TikTok"
          value={
            content.socialLinks
              .tiktok
          }
          onChange={(value) =>
            onUpdate({
              socialLinks: {
                ...content.socialLinks,
                tiktok: value,
              },
            })
          }
        />

        <TextField
          label="WhatsApp"
          value={
            content.socialLinks
              .whatsapp
          }
          onChange={(value) =>
            onUpdate({
              socialLinks: {
                ...content.socialLinks,
                whatsapp:
                  value,
              },
            })
          }
        />

      </div>
    </EditorCard>
  );
}


/* =====================================
   MAINTENANCE
===================================== */

function MaintenanceEditor({
  content,
  onUpdate,
}) {
  return (
    <EditorCard
      title="صفحة الصيانة"
      description="الواجهة التي تظهر للزوار عند إغلاق المتجر."
    >
      <ToggleField
        label="وضع الصيانة"
        checked={
          content.enabled
        }
        onChange={(value) =>
          onUpdate({
            enabled:
              value,
          })
        }
      />

      <TextField
        label="العنوان"
        value={
          content.title
        }
        onChange={(value) =>
          onUpdate({
            title: value,
          })
        }
      />

      <TextArea
        label="الوصف"
        value={
          content.description
        }
        onChange={(value) =>
          onUpdate({
            description:
              value,
          })
        }
      />

      <ImageField
        label="الصورة"
        value={
          content.image
        }
        onChange={(value) =>
          onUpdate({
            image: value,
          })
        }
      />

      <ToggleField
        label="إظهار الشعار"
        checked={
          content.showLogo
        }
        onChange={(value) =>
          onUpdate({
            showLogo:
              value,
          })
        }
      />

      <ToggleField
        label="إظهار زر التواصل"
        checked={
          content.buttonEnabled
        }
        onChange={(value) =>
          onUpdate({
            buttonEnabled:
              value,
          })
        }
      />

      <div className="grid gap-4 md:grid-cols-2">

        <TextField
          label="نص الزر"
          value={
            content.buttonText
          }
          onChange={(value) =>
            onUpdate({
              buttonText:
                value,
            })
          }
        />

        <TextField
          label="رابط الزر"
          value={
            content.buttonLink
          }
          onChange={(value) =>
            onUpdate({
              buttonLink:
                value,
            })
          }
        />

      </div>
    </EditorCard>
  );
}


/* =====================================
   SEO
===================================== */

function SeoEditor({
  content,
  onUpdate,
}) {
  return (
    <EditorCard
      title="SEO"
      description="إعدادات محركات البحث والمشاركة."
    >
      <TextField
        label="عنوان الصفحة"
        value={
          content.title
        }
        onChange={(value) =>
          onUpdate({
            title: value,
          })
        }
      />

      <TextArea
        label="الوصف"
        value={
          content.description
        }
        onChange={(value) =>
          onUpdate({
            description:
              value,
          })
        }
      />

      <TextArea
        label="الكلمات المفتاحية"
        value={
          content.keywords
        }
        onChange={(value) =>
          onUpdate({
            keywords:
              value,
          })
        }
      />

      <ImageField
        label="صورة المشاركة"
        value={
          content.socialImage
        }
        onChange={(value) =>
          onUpdate({
            socialImage:
              value,
          })
        }
      />
    </EditorCard>
  );
}


/* =====================================
   BUTTON EDITOR
===================================== */

function ButtonEditor({
  title,
  data,
  onChange,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <p className="mb-4 font-black text-slate-800">
        {title}
      </p>

      <ToggleField
        label="تفعيل الزر"
        checked={
          data.enabled
        }
        onChange={(value) =>
          onChange({
            ...data,
            enabled:
              value,
          })
        }
      />

      <div className="mt-4 space-y-4">

        <TextField
          label="النص"
          value={
            data.text
          }
          onChange={(value) =>
            onChange({
              ...data,
              text: value,
            })
          }
        />

        <TextField
          label="الرابط"
          value={
            data.link
          }
          onChange={(value) =>
            onChange({
              ...data,
              link: value,
            })
          }
        />

      </div>

    </div>
  );
}


/* =====================================
   ARRAY EDITOR
===================================== */

function ArrayEditor({
  items,
  title,
  itemLabel,
  emptyText,
  createItem,
  fields,
  onChange,
}) {
  const safeItems =
    Array.isArray(items)
      ? items
      : [];

  const addItem = () => {
    onChange([
      ...safeItems,
      createItem(),
    ]);
  };

  const updateItem = (
    index,
    key,
    value
  ) => {
    onChange(
      safeItems.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [key]:
                  value,
              }
            : item
      )
    );
  };

  const removeItem = (
    index
  ) => {
    onChange(
      safeItems.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <div className="mb-4 flex items-center justify-between">

        <div>
          <p className="font-black text-slate-800">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {safeItems.length}{" "}
            {itemLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-blue-700 shadow-sm hover:bg-blue-50"
        >
          <Plus size={14} />
          إضافة
        </button>

      </div>


      {safeItems.length ===
      0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">

          {safeItems.map(
            (
              item,
              index
            ) => (
              <div
                key={
                  item.id ||
                  index
                }
                className="rounded-xl border border-slate-200 bg-white p-4"
              >

                <div className="mb-3 flex items-center justify-between">

                  <p className="text-xs font-black text-slate-400">
                    {itemLabel}{" "}
                    {index + 1}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(
                        index
                      )
                    }
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2
                      size={15}
                    />
                  </button>

                </div>

                <div className="grid gap-3 md:grid-cols-2">

                  {fields.map(
                    (field) =>
                      field.textarea ? (
                        <div
                          key={
                            field.key
                          }
                          className="md:col-span-2"
                        >
                          <TextArea
                            label={
                              field.label
                            }
                            value={
                              item[
                                field
                                  .key
                              ] ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateItem(
                                index,
                                field.key,
                                value
                              )
                            }
                          />
                        </div>
                      ) : (
                        <TextField
                          key={
                            field.key
                          }
                          label={
                            field.label
                          }
                          value={
                            item[
                              field
                                .key
                            ] ||
                            ""
                          }
                          onChange={(
                            value
                          ) =>
                            updateItem(
                              index,
                              field.key,
                              value
                            )
                          }
                        />
                      )
                  )}

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}


/* =====================================
   EDITOR CARD
===================================== */

function EditorCard({
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="mb-5">

        <h3 className="font-black text-slate-900">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>
        )}

      </div>

      <div className="space-y-5">
        {children}
      </div>

    </section>
  );
}


/* =====================================
   TOGGLE
===================================== */

function ToggleField({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">

      <div>
        <p className="font-black text-slate-800">
          {label}
        </p>

        {description && (
          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(
            !checked
          )
        }
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked
            ? "bg-blue-700"
            : "bg-slate-300"
        }`}
        aria-pressed={
          checked
        }
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked
              ? "right-1"
              : "right-6"
          }`}
        />
      </button>

    </div>
  );
}


/* =====================================
   IMAGE FIELD
===================================== */

function ImageField({
  label,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="grid gap-4 md:grid-cols-[180px_1fr]">

        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">

          {value ? (
            <img
              src={value}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus
              size={28}
              className="text-slate-300"
            />
          )}

        </div>

        <div className="flex flex-col justify-center gap-3">

          <TextField
            label="رابط الصورة"
            value={value || ""}
            onChange={onChange}
            placeholder="/uploads/... أو رابط صورة خارجي"
          />

          <p className="text-xs leading-5 text-slate-400">
            يمكن حفظ رابط ملف من Media Storage أو رابط صورة خارجي موثوق.
          </p>

        </div>

      </div>

    </div>
  );
}


/* =====================================
   TEXT FIELD
===================================== */

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
            event.target
              .value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />

    </div>
  );
}


/* =====================================
   NUMBER
===================================== */

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
            event.target
              .value
          )
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />

    </div>
  );
}


/* =====================================
   TEXTAREA
===================================== */

function TextArea({
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

      <textarea
        rows={4}
        value={
          value ?? ""
        }
        onChange={(event) =>
          onChange(
            event.target
              .value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />

    </div>
  );
}


export default StoreContent;