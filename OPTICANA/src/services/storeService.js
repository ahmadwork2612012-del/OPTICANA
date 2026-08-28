const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });
  let data = null;
  try { data = await response.json(); } catch {}
  if (!response.ok || data?.success === false) {
    const error = new Error(data?.error?.message || "فشل تحميل بيانات المتجر");
    error.code = data?.error?.code || "API_ERROR";
    throw error;
  }
  return data?.data ?? {};
}

const DEFAULT_CONTENT = {
  home: {
    hero: { enabled:true, title:"عيونك أحلى معانا", subtitle:"اكتشف تشكيلتنا المميزة من النظارات والعدسات بتصاميم تجمع بين الأناقة والجودة.", primaryButton:{enabled:true,text:"تسوق الآن",link:"/products"}, secondaryButton:{enabled:true,text:"تعرف علينا",link:"/about"}, image:null },
    announcement:{enabled:false,text:"",link:"/products"},
    categories:{enabled:true,title:"تسوق حسب الفئة",description:"اختر الفئة التي تناسب احتياجك.",limit:6},
    featuredProducts:{enabled:true,title:"منتجاتنا المميزة",description:"اختيارات مميزة من أحدث منتجات OPTICANA.",limit:8},
    whyUs:{enabled:true,title:"لماذا OPTICANA؟",description:"نهتم بكل تفاصيل تجربة العميل.",items:[]},
    statistics:{enabled:true,title:"OPTICANA بالأرقام",items:[]},
    offers:{enabled:true,title:"عروض مميزة",description:"اكتشف أحدث العروض والخصومات."},
    reviews:{enabled:true,title:"آراء عملائنا",description:"تجارب حقيقية من عملاء OPTICANA."},
    faq:{enabled:true,title:"الأسئلة الشائعة",description:"إجابات سريعة عن أكثر الأسئلة شيوعًا.",items:[]},
    cta:{enabled:true,title:"جاهز تختار نظارتك الجديدة؟",description:"اكتشف تشكيلتنا وتسوق الآن.",buttonText:"تسوق الآن",buttonLink:"/products"},
  },
  about:{},contact:{},faq:{},footer:{enabled:true,description:"",quickLinks:[],socialLinks:{}},
  maintenance:{enabled:false,title:"المتجر تحت الصيانة",description:"نعمل حاليًا على تطوير المتجر. سنعود قريبًا.",image:null,showLogo:true,buttonEnabled:true,buttonText:"تواصل معنا",buttonLink:"/contact"},
  seo:{title:"OPTICANA | عيونك أحلى معانا",description:"",keywords:"",socialImage:null},banners:[],
};

function mergeDeep(base, source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return source;
  const result={...(base||{})};
  for (const key of Object.keys(source)) {
    const value=source[key];
    result[key] = value && typeof value === "object" && !Array.isArray(value)
      ? mergeDeep(result[key] || {}, value)
      : value;
  }
  return result;
}

export async function getStoreContent() {
  const content = await apiGet("/content");
  return mergeDeep(DEFAULT_CONTENT, content || {});
}

export async function getStoreSettings() {
  return (await apiGet("/settings")) || {};
}

export async function getStoreInfo() {
  const [content, settings] = await Promise.all([
    getStoreContent(),
    getStoreSettings(),
  ]);
  const business = settings.business || {};
  const general = settings.general || {};
  const appearance = settings.appearance || settings.branding || {};
  const contact = content.contact || {};
  const footer = content.footer || {};
  const seo = content.seo || settings.seo || {};
  return {
    name: general.storeName || business.storeName || "OPTICANA",
    slogan: general.slogan || business.slogan || "عيونك أحلى معانا",
    logo: appearance.logo || general.logo || business.logo || null,
    favicon: appearance.favicon || general.favicon || business.favicon || null,
    phone: contact.phone || general.phone || business.phone || "",
    whatsapp: contact.whatsapp || general.whatsapp || business.whatsapp || "",
    email: contact.email || general.email || business.email || "",
    address: contact.address || general.address || business.address || "",
    workingHours: contact.workingHours || business.workingHours || "",
    mapUrl: contact.mapUrl || business.googleMaps || business.mapUrl || "",
    instagram: contact.instagram || business.instagram || footer.socialLinks?.instagram || "",
    facebook: contact.facebook || business.facebook || footer.socialLinks?.facebook || "",
    tiktok: contact.tiktok || business.tiktok || footer.socialLinks?.tiktok || "",
    whatsappLink: footer.socialLinks?.whatsapp || contact.whatsapp || business.whatsapp || "",
    primaryColor: appearance.primaryColor || "#B4C4AD",
    currency: settings.general?.currency || business.currency || "ج.م",
    seoTitle: seo.title || "OPTICANA | عيونك أحلى معانا",
    seoDescription: seo.description || "",
    seoKeywords: seo.keywords || "",
    socialImage: seo.socialImage || null,
    footerDescription: footer.description || "",
    footerLinks: Array.isArray(footer.quickLinks) ? footer.quickLinks.filter(x=>x?.enabled!==false) : [],
    maintenance: content.maintenance || DEFAULT_CONTENT.maintenance,
  };
}



export async function createStoreOrder({ customer, items, notes = null }) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      customer,
      items: items.map((item) => ({
        productId: item.productId || item.id,
        quantity: Number(item.quantity),
      })),
      discount: 0,
      paymentMethod: "WHATSAPP",
      source: "store",
      notes,
    }),
  });

  let data = null;
  try { data = await response.json(); } catch {}
  if (!response.ok || data?.success === false) {
    const error = new Error(data?.error?.message || "تعذر إنشاء الطلب");
    error.code = data?.error?.code || "ORDER_CREATE_FAILED";
    throw error;
  }
  return data?.data;
}

export default { getStoreInfo, getStoreContent, getStoreSettings, createStoreOrder };
