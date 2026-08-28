import { create } from "zustand";

const defaultStoreContent = {
  /* =====================================
     GENERAL
  ===================================== */

  general: {
    storeName: "OPTICANA",

    slogan: "عيونك أحلى معانا",

    logo: null,

    favicon: null,

    phone: "",

    whatsapp: "",

    email: "",

    address: "",

    currency: "ج.م",

    copyright:
      "© 2026 OPTICANA. جميع الحقوق محفوظة.",
  },


  /* =====================================
     HOMEPAGE
  ===================================== */

  home: {
    hero: {
      enabled: true,

      title:
        "عيونك أحلى معانا",

      subtitle:
        "اكتشف تشكيلتنا المميزة من النظارات والعدسات بتصاميم تجمع بين الأناقة والجودة.",

      image: null,

      primaryButton: {
        enabled: true,

        text: "تسوق الآن",

        link: "/products",
      },

      secondaryButton: {
        enabled: true,

        text: "تعرف علينا",

        link: "/about",
      },
    },

    announcement: {
      enabled: true,

      text:
        "خصومات مميزة على مجموعة مختارة من المنتجات",

      link: "/products",
    },

    categories: {
      enabled: true,

      title:
        "تسوق حسب الفئة",

      description:
        "اختر الفئة التي تناسب احتياجك.",

      limit: 6,
    },

    featuredProducts: {
      enabled: true,

      title:
        "منتجاتنا المميزة",

      description:
        "اختيارات مميزة من أحدث منتجات OPTICANA.",

      limit: 8,
    },

    whyUs: {
      enabled: true,

      title:
        "لماذا OPTICANA؟",

      description:
        "نهتم بكل تفاصيل تجربة العميل من اختيار المنتج حتى استلامه.",

      items: [
        {
          id: "quality",

          title: "جودة موثوقة",

          description:
            "منتجات مختارة بعناية.",
        },

        {
          id: "service",

          title: "خدمة مميزة",

          description:
            "نساعدك في اختيار الأنسب لك.",
        },

        {
          id: "delivery",

          title: "توصيل سريع",

          description:
            "استلم طلبك بسهولة وفي أسرع وقت.",
        },

        {
          id: "support",

          title: "دعم مستمر",

          description:
            "نحن هنا لمساعدتك.",
        },
      ],
    },

    statistics: {
      enabled: true,

      title:
        "OPTICANA بالأرقام",

      items: [
        {
          id: "customers",
          label: "عميل سعيد",
          value: "",
        },

        {
          id: "products",
          label: "منتج",
          value: "",
        },

        {
          id: "experience",
          label: "سنوات خبرة",
          value: "",
        },

        {
          id: "support",
          label: "دعم متواصل",
          value: "",
        },
      ],
    },

    offers: {
      enabled: true,

      title:
        "عروض مميزة",

      description:
        "اكتشف أحدث العروض والخصومات.",
    },

    reviews: {
      enabled: true,

      title:
        "آراء عملائنا",

      description:
        "تجارب حقيقية من عملاء OPTICANA.",
    },

    faq: {
      enabled: true,

      title:
        "الأسئلة الشائعة",

      description:
        "إجابات سريعة عن أكثر الأسئلة شيوعًا.",

      items: [],
    },

    cta: {
      enabled: true,

      title:
        "جاهز تختار نظارتك الجديدة؟",

      description:
        "اكتشف تشكيلتنا وتسوق الآن.",

      buttonText:
        "تسوق الآن",

      buttonLink:
        "/products",
    },
  },


  /* =====================================
     ABOUT
  ===================================== */

  about: {
    enabled: true,

    title:
      "من نحن",

    description:
      "OPTICANA متجر متخصص في النظارات والعدسات، نهدف إلى تقديم تجربة تجمع بين الجودة والأناقة والخدمة المميزة.",

    image: null,

    vision:
      "أن نصبح وجهتك المفضلة لكل ما يتعلق بالنظارات والعدسات.",

    mission:
      "تقديم منتجات موثوقة وتجربة شراء سهلة وخدمة تهتم بالعميل.",

    features: [
      {
        id: "quality",

        title:
          "منتجات مختارة",

        description:
          "نهتم بجودة المنتجات التي نقدمها.",
      },

      {
        id: "experience",

        title:
          "خبرة",

        description:
          "نسعى لتقديم تجربة احترافية للعميل.",
      },

      {
        id: "service",

        title:
          "خدمة",

        description:
          "العميل هو محور اهتمامنا.",
      },
    ],

    statistics: [
      {
        id: "customers",
        label: "عملاء",
        value: "",
      },

      {
        id: "products",
        label: "منتجات",
        value: "",
      },

      {
        id: "experience",
        label: "سنوات خبرة",
        value: "",
      },
    ],
  },


  /* =====================================
     CONTACT
  ===================================== */

  contact: {
    enabled: true,

    title:
      "تواصل معنا",

    description:
      "نحن هنا لمساعدتك والإجابة عن أي استفسار.",

    phone: "",

    whatsapp: "",

    email: "",

    address: "",

    workingHours:
      "يوميًا من 10 صباحًا حتى 10 مساءً",

    instagram: "",

    facebook: "",

    tiktok: "",

    mapUrl: "",
  },


  /* =====================================
     FAQ
  ===================================== */

  faq: {
    enabled: true,

    title:
      "الأسئلة الشائعة",

    description:
      "إجابات على الأسئلة الأكثر شيوعًا.",

    items: [],
  },


  /* =====================================
     FOOTER
  ===================================== */

  footer: {
    enabled: true,

    description:
      "OPTICANA — عيونك أحلى معانا.",

    quickLinks: [
      {
        id: "home",
        label: "الرئيسية",
        path: "/",
        enabled: true,
      },

      {
        id: "products",
        label: "المنتجات",
        path: "/products",
        enabled: true,
      },

      {
        id: "about",
        label: "من نحن",
        path: "/about",
        enabled: true,
      },

      {
        id: "contact",
        label: "تواصل معنا",
        path: "/contact",
        enabled: true,
      },
    ],

    socialLinks: {
      instagram: "",
      facebook: "",
      tiktok: "",
      whatsapp: "",
    },
  },


  /* =====================================
     MAINTENANCE
  ===================================== */

  maintenance: {
    enabled: false,

    title:
      "المتجر تحت الصيانة",

    description:
      "نعمل حاليًا على تطوير المتجر. سنعود قريبًا.",

    image: null,

    showLogo: true,

    buttonEnabled: true,

    buttonText:
      "تواصل معنا",

    buttonLink:
      "/contact",
  },


  /* =====================================
     SEO
  ===================================== */

  seo: {
    title:
      "OPTICANA | عيونك أحلى معانا",

    description:
      "اكتشف أحدث النظارات والعدسات من OPTICANA.",

    keywords:
      "نظارات، عدسات، نظارات شمسية، نظارات طبية، OPTICANA",

    socialImage: null,
  },


  /* =====================================
     BANNERS
  ===================================== */

  banners: [],
};


const useStoreContentStore =
  create(
      (set, get) => ({
        content:
          defaultStoreContent,


        /* =========================
           UPDATE SECTION
        ========================= */

        updateSection: (
          section,
          updates
        ) =>
          set((state) => ({
            content: {
              ...state.content,

              [section]: {
                ...state.content[
                  section
                ],

                ...updates,
              },
            },
          })),


        /* =========================
           UPDATE NESTED SECTION
        ========================= */

        updateNestedSection: (
          section,
          nestedSection,
          updates
        ) =>
          set((state) => ({
            content: {
              ...state.content,

              [section]: {
                ...state.content[
                  section
                ],

                [nestedSection]: {
                  ...state.content[
                    section
                  ][nestedSection],

                  ...updates,
                },
              },
            },
          })),


        /* =========================
           REPLACE SECTION
        ========================= */

        replaceSection: (
          section,
          value
        ) =>
          set((state) => ({
            content: {
              ...state.content,

              [section]:
                value,
            },
          })),


        /* =========================
         RESET
      ========================= */

      resetContent: () =>
        set({
          content: defaultStoreContent,
        }),

      loadContent: async () => {
        const { default: apiClient } = await import("../lib/apiClient");
        const data = await apiClient.get("/content");
        set((state) => ({
          content: {
            ...defaultStoreContent,
            ...(data || {}),
            home: { ...defaultStoreContent.home, ...(data?.home || {}) },
          },
        }));
        return get().content;
      },

      saveContent: async () => {
        const { default: apiClient } = await import("../lib/apiClient");
        const current = get().content || {};
        for (const [key, value] of Object.entries(current)) {
          await apiClient.put(`/admin/content/${encodeURIComponent(key)}`, { value });
        }
        return current;
      },
      })
  );


export default useStoreContentStore;