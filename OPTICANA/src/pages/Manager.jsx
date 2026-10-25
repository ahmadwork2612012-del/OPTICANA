import { BUSINESS_DEFAULTS, FOOTER_DEFAULTS, withDefaults } from "../config/storeDefaults";
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  ImagePlus,
  LogIn,
  LogOut,
  PackagePlus,
  Pencil,
  Plus,
  MessageSquare,
  Search,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  Tags,
  X,
} from "lucide-react";
import { cloneElement, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  archiveManagerProduct,
  createManagerCategory,
  createManagerProduct,
  deleteManagerCategory,
  deleteManagerCategoryWithProducts,
  deleteManagerReview,
  getManagerRecentOrders,
  getManagerCategories,
  getManagerProducts,
  getManagerReviews,
  getManagerSession,
  getManagerStoreData,
  managerLogin,
  managerLogout,
  setManagerProductVisibility,
  updateManagerStoreContent,
  updateManagerStoreSetting,
  updateManagerProduct,
  updateManagerOrderStatus,
  updateManagerReviewStatus,
  uploadManagerImage,
} from "../services/managerApi";

const ORDER_STATUS_LABELS = {
  PENDING: { ar: "بانتظار التأكيد", en: "Pending" },
  CONFIRMED: { ar: "مؤكد", en: "Confirmed" },
  PREPARING: { ar: "قيد التجهيز", en: "Preparing" },
  READY: { ar: "جاهز", en: "Ready" },
  COMPLETED: { ar: "مكتمل", en: "Completed" },
  CANCELLED: { ar: "ملغي", en: "Cancelled" },
};

// Mirrors the allowed transitions in the API's order service.
const NEXT_ORDER_STATUS = {
  PENDING: { status: "CONFIRMED", ar: "تأكيد الطلب", en: "Confirm order" },
  CONFIRMED: { status: "PREPARING", ar: "بدء التجهيز", en: "Start preparing" },
  PREPARING: { status: "READY", ar: "جاهز للتسليم", en: "Mark ready" },
  READY: { status: "COMPLETED", ar: "تم التسليم", en: "Mark delivered" },
};

// Images are compressed in the browser and uploaded directly to storage, so
// this only guards against unreasonably large source files.
const MAX_PRODUCT_IMAGES = 4;
const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;

const EMPTY_FORM = {
  sku: "",
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  price: "",
  oldPrice: "",
  purchasePrice: "",
  initialStock: "0",
  reorderLevel: "0",
  categoryId: "",
  color: "",
  material: "",
  size: "",
  customFields: [],
  images: [],
  publish: true,
  featured: false,
  isNew: false,
  isSale: false,
};

function makeSku() {
  return `OPT-${Date.now().toString().slice(-7)}`;
}

function makeCategorySlug(value = "") {
  const slug = String(value).trim().toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `category-${Date.now()}`;
}

function makeStoreForm(data = {}) {
  const settings = data.settings || {};
  const content = data.content || {};
  const business = withDefaults(settings.business, BUSINESS_DEFAULTS);
  const general = settings.general || {};
  const contact = content.contact || {};
  const about = content.about || {};
  const footer = withDefaults(content.footer, FOOTER_DEFAULTS);
  const home = content.home || {};
  const hero = home.hero || {};
  return {
    business: {
      storeName: business.storeName || "", phone: business.phone || "", whatsapp: business.whatsapp || "", email: business.email || "",
      address: business.address || "", addressEn: business.addressEn || "",
      // Two branch slots; empty ones are skipped on the storefront.
      branches: [0, 1].map((index) => ({
        name: business.branches?.[index]?.name || "",
        nameEn: business.branches?.[index]?.nameEn || "",
        mapUrl: business.branches?.[index]?.mapUrl || "",
      })),
      workingHours: business.workingHours || "", googleMaps: business.googleMaps || business.mapUrl || "",
      instagram: business.instagram || "", facebook: business.facebook || "", tiktok: business.tiktok || "", website: business.website || "", linktree: business.linktree || "",
    },
    general: { slogan: general.slogan || "", currency: general.currency || "ج.م" },
    contact: { title: contact.title || "", description: contact.description || "" },
    about: { title: about.title || "", description: about.description || "", vision: about.vision || "", mission: about.mission || "" },
    footer: { description: footer.description || "", descriptionEn: footer.descriptionEn || "" },
    home: { hero: { ...hero, image: hero.image || "" } },
  };
}

function Manager() {
  const { t, isEnglish } = useLanguage();
  const [session, setSession] = useState(() => getManagerSession());
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(0);
  const [uploadingCustomFields, setUploadingCustomFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showForm, setShowForm] = useState(false);
  const [activePanel, setActivePanel] = useState("products");
  const [categoryForm, setCategoryForm] = useState({ name: "", nameEn: "", description: "", descriptionEn: "", sortOrder: "0" });
  const [categorySaving, setCategorySaving] = useState(false);
  const [storeData, setStoreData] = useState({ settings: {}, content: {} });
  const [storeForm, setStoreForm] = useState(() => makeStoreForm());
  const [storeSaving, setStoreSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ordersRange, setOrdersRange] = useState("24h");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextProducts, nextCategories, nextStoreData, nextOrders, nextReviews] = await Promise.all([
        getManagerProducts(),
        getManagerCategories(),
        getManagerStoreData(),
        getManagerRecentOrders(ordersRange),
        getManagerReviews(),
      ]);
      setProducts(nextProducts);
      setCategories(nextCategories);
      setStoreData(nextStoreData || { settings: {}, content: {} });
      setStoreForm(makeStoreForm(nextStoreData));
      setOrders(nextOrders);
      setReviews(nextReviews);
    } catch (error) {
      if (error?.status === 401) {
        setSession(null);
        toast.error(t("انتهت جلسة الإدارة. سجل الدخول مرة أخرى."));
      } else {
        toast.error(error?.message || t("تعذر تحميل المنتجات"));
      }
    } finally {
      setLoading(false);
    }
  }, [t, ordersRange]);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  const [orderUpdating, setOrderUpdating] = useState(null);

  // Confirming a storefront order is what deducts its stock, so reload
  // products as well as orders afterwards.
  const changeOrderStatus = async (order, status) => {
    const label = ORDER_STATUS_LABELS[status]?.[isEnglish ? "en" : "ar"] || status;
    const question = status === "CANCELLED"
      ? (isEnglish ? `Cancel order ${order.orderNumber}?` : `إلغاء الطلب ${order.orderNumber}؟`)
      : (isEnglish ? `Change order ${order.orderNumber} to "${label}"?` : `تغيير حالة الطلب ${order.orderNumber} إلى "${label}"؟`);
    if (!window.confirm(question)) return;

    setOrderUpdating(order.id);
    try {
      await updateManagerOrderStatus(order.id, status);
      toast.success(isEnglish ? "Order updated" : "تم تحديث الطلب");
      await load();
    } catch (error) {
      toast.error(error?.message || t("تعذر تنفيذ العملية"));
    } finally {
      setOrderUpdating(null);
    }
  };

  const filteredProducts = useMemo(() => {
    const value = query.trim().toLowerCase();
    const manageableProducts = products.filter((product) => product.status !== "ARCHIVED");
    if (!value) return manageableProducts;
    return manageableProducts.filter((product) =>
      [product.name, product.sku, product.category?.name]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value))
    );
  }, [products, query]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sku: makeSku() });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      sku: product.sku || makeSku(),
      name: product.name || "",
      nameEn: product.nameEn || "",
      description: product.description || "",
      descriptionEn: product.descriptionEn || "",
      price: product.price ?? "",
      oldPrice: product.oldPrice ?? "",
      purchasePrice: product.purchasePrice ?? "",
      initialStock: product.stock ?? 0,
      reorderLevel: product.reorderLevel ?? 0,
      categoryId: product.categoryId || "",
      color: product.color || "",
      material: product.material || "",
      size: product.size || "",
      customFields: (Array.isArray(product.customFields) ? product.customFields : [])
        .map((field) => ({
          name: String(field?.name || ""),
          type: ["text", "number", "image"].includes(field?.type) ? field.type : "text",
          value: String(field?.value ?? ""),
        }))
        .filter((field) => field.name.trim() || field.value.trim()),
      images: (Array.isArray(product.images) ? product.images : [])
        .map((image) => (typeof image === "string" ? image : image?.url))
        .filter(Boolean),
      publish: product.status === "PUBLISHED" && product.showOnStore !== false,
      featured: product.featured === true,
      isNew: product.isNew === true,
      isSale: product.isSale === true,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const updateCustomField = (index, patch) => {
    setForm((current) => ({
      ...current,
      customFields: (Array.isArray(current.customFields) ? current.customFields : []).map((item, fieldIndex) =>
        fieldIndex === index ? { ...item, ...patch } : item
      ),
    }));
  };

  const handleImages = async (files) => {
    const selected = Array.from(files || []);
    if (!selected.length) return;
    const availableSlots = MAX_PRODUCT_IMAGES - form.images.length - uploadingImages;
    if (availableSlots <= 0) {
      toast.error(isEnglish ? `A product can have up to ${MAX_PRODUCT_IMAGES} images.` : `يمكن إضافة ${MAX_PRODUCT_IMAGES} صور كحد أقصى للمنتج.`);
      return;
    }
    const nextFiles = selected.slice(0, availableSlots);
    if (nextFiles.some((file) => !file.type.startsWith("image/"))) {
      toast.error(t("اختر صورة صالحة."));
      return;
    }
    if (nextFiles.some((file) => file.size > MAX_IMAGE_SIZE_BYTES)) {
      toast.error(isEnglish ? "Each image must be smaller than 20 MB." : "يجب أن يكون حجم كل صورة أقل من 20MB.");
      return;
    }
    setUploadingImages((count) => count + nextFiles.length);
    const results = await Promise.allSettled(nextFiles.map((file) => uploadManagerImage(file, "products")));
    setUploadingImages((count) => count - nextFiles.length);

    const uploaded = results.filter((result) => result.status === "fulfilled").map((result) => result.value);
    if (uploaded.length) {
      setForm((current) => ({ ...current, images: [...current.images, ...uploaded].slice(0, MAX_PRODUCT_IMAGES) }));
    }
    const failed = results.find((result) => result.status === "rejected");
    if (failed) {
      toast.error(failed.reason?.message || (isEnglish ? "Unable to upload the image." : "تعذر رفع الصورة."));
    }
  };

  const handleCustomFieldImage = async (index, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error(t("اختر صورة صالحة."));
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return toast.error(isEnglish ? "Each image must be smaller than 20 MB." : "يجب أن يكون حجم الصورة أقل من 20MB.");
    }

    setUploadingCustomFields((current) => ({ ...current, [index]: true }));
    const uploadToast = toast.loading(isEnglish ? "Uploading property image..." : "جاري رفع صورة الخاصية...");
    try {
      const image = await uploadManagerImage(file, "products");
      setForm((current) => ({
        ...current,
        customFields: (Array.isArray(current.customFields) ? current.customFields : []).map((item, fieldIndex) =>
          fieldIndex === index ? { ...item, type: "image", value: image } : item
        ),
      }));
      toast.success(t("تم رفع صورة الخاصية"), { id: uploadToast });
    } catch (error) {
      toast.error(error?.message || (isEnglish ? "Unable to upload the image." : "تعذر رفع الصورة."), { id: uploadToast });
    } finally {
      setUploadingCustomFields((current) => ({ ...current, [index]: false }));
    }
  };

  const removeImage = (index) => {
    setField("images", form.images.filter((_, imageIndex) => imageIndex !== index));
  };

  const handleHeroImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error(t("اختر صورة صالحة."));
    if (file.size > MAX_IMAGE_SIZE_BYTES) return toast.error(isEnglish ? "Each image must be smaller than 20 MB." : "يجب أن يكون حجم كل صورة أقل من 20MB.");
    const uploadToast = toast.loading(isEnglish ? "Uploading image..." : "جاري رفع الصورة...");
    try {
      const image = await uploadManagerImage(file, "store");
      setStoreForm((current) => ({ ...current, home: { ...current.home, hero: { ...current.home.hero, image } } }));
      toast.success(isEnglish ? "Image uploaded" : "تم رفع الصورة", { id: uploadToast });
    } catch (error) {
      toast.error(error?.message || t("تعذر قراءة الصورة."), { id: uploadToast });
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return toast.error(t("اكتب اسم المنتج."));
    if (!form.price || Number(form.price) <= 0) return toast.error(t("أدخل سعرًا صحيحًا."));
    if (uploadingImages > 0 || Object.values(uploadingCustomFields).some(Boolean)) return toast.error(isEnglish ? "Please wait for the images to finish uploading." : "انتظر حتى يكتمل رفع الصور.");
    if (!form.sku.trim()) setField("sku", makeSku());

    setSaving(true);
    try {
      const payload = {
        ...form,
        sku: form.sku.trim() || makeSku(),
        images: form.images.map((url, index) => ({
          url,
          altText: form.name.trim() || "OPTICANA",
          isPrimary: index === 0,
          sortOrder: index,
        })),
      };

      const saved = editing
        ? await updateManagerProduct(editing.id, payload)
        : await createManagerProduct(payload);

      setProducts((current) =>
        editing
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current]
      );
      toast.success(editing ? t("تم تحديث المنتج بنجاح") : t("تمت إضافة المنتج بنجاح"));
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      toast.error(error?.message || t("تعذر حفظ المنتج"));
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (product) => {
    const visible = product.status === "PUBLISHED" && product.showOnStore !== false;
    const question = visible
      ? t(`هل تريد إخفاء "${product.name}" من المتجر؟`)
      : t(`هل تريد إظهار "${product.name}" في المتجر؟`);
    if (!window.confirm(question)) return;
    try {
      const saved = await setManagerProductVisibility(product, !visible);
      setProducts((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      toast.success(visible ? t("تم إخفاء المنتج من المتجر") : t("تم إظهار المنتج في المتجر"));
    } catch (error) {
      toast.error(error?.message || t("تعذر تنفيذ العملية"));
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(t(`حذف "${product.name}" من إدارة المتجر؟ لن يظهر للزوار بعد التأكيد.`))) return;
    try {
      await archiveManagerProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      toast.success(t("تم حذف المنتج من قائمة الإدارة"));
    } catch (error) {
      toast.error(error?.message || t("تعذر حذف المنتج"));
    }
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    if (!categoryForm.name.trim()) return toast.error(t("اكتب اسم التصنيف."));
    setCategorySaving(true);
    try {
      const category = await createManagerCategory({
        name: categoryForm.name.trim(), nameEn: categoryForm.nameEn.trim() || undefined, slug: makeCategorySlug(categoryForm.name), description: categoryForm.description.trim() || undefined, descriptionEn: categoryForm.descriptionEn.trim() || undefined,
        sortOrder: Math.max(0, Math.floor(Number(categoryForm.sortOrder || 0))), isActive: true, showOnStore: true,
      });
      setCategories((current) => [...current, category].sort((a, b) => a.sortOrder - b.sortOrder));
      setCategoryForm({ name: "", nameEn: "", description: "", descriptionEn: "", sortOrder: "0" });
      toast.success(t("تمت إضافة التصنيف وسيظهر فورًا في نموذج المنتج والمتجر"));
    } catch (error) {
      toast.error(error?.message || t("تعذر إضافة التصنيف"));
    } finally { setCategorySaving(false); }
  };

  const deleteCategory = async (category, withProducts) => {
    const count = Number(category.productCount || 0);
    const firstMessage = withProducts
      ? `سيُحذف التصنيف "${category.name}" وكل المنتجات التابعة له (${count}). لا يمكن التراجع عن ذلك. هل تريد المتابعة؟`
      : `سيُحذف التصنيف "${category.name}" فقط. ستبقى المنتجات التابعة له (${count}) موجودة بدون تصنيف. هل تريد المتابعة؟`;
    if (!window.confirm(t(firstMessage))) return;

    const finalMessage = withProducts
      ? `تأكيد أخير: سيتم حذف ${count} من المنتجات مع التصنيف نهائيًا. اضغط موافق للتنفيذ.`
      : "تأكيد أخير: سيُحذف التصنيف فقط، ولن تُحذف أي منتجات. اضغط موافق للتنفيذ.";
    if (!window.confirm(t(finalMessage))) return;

    try {
      const result = withProducts
        ? await deleteManagerCategoryWithProducts(category.id)
        : await deleteManagerCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      if (withProducts) {
        setProducts((current) => current.filter((item) => item.categoryId !== category.id));
        toast.success(t(`تم حذف التصنيف و${result?.deletedProducts ?? count} من المنتجات التابعة له.`));
      } else {
        setProducts((current) => current.map((item) => item.categoryId === category.id ? { ...item, categoryId: null, category: null } : item));
        toast.success(t("تم حذف التصنيف فقط، والمنتجات ما زالت موجودة بدون تصنيف."));
      }
    } catch (error) {
      toast.error(error?.message || t("تعذر حذف التصنيف"));
    }
  };

  const setReviewStatus = async (review, status) => {
    try {
      const saved = await updateManagerReviewStatus(review.id, status, review.featured);
      setReviews((current) => current.map((item) => item.id === saved.id ? { ...item, ...saved } : item));
      toast.success(status === "APPROVED" ? t("تم اعتماد التقييم وتحديث متوسط المنتج") : t("تم رفض التقييم"));
    } catch (error) {
      toast.error(error?.message || t("تعذر تحديث التقييم"));
    }
  };

  const removeReview = async (review) => {
    if (!window.confirm(t("حذف هذا التقييم نهائيًا؟"))) return;
    try {
      await deleteManagerReview(review.id);
      setReviews((current) => current.filter((item) => item.id !== review.id));
      toast.success(t("تم حذف التقييم وتحديث متوسط المنتج"));
    } catch (error) {
      toast.error(error?.message || t("تعذر حذف التقييم"));
    }
  };

  const saveStoreData = async (event) => {
    event.preventDefault();
    setStoreSaving(true);
    try {
      const existingSettings = storeData.settings || {};
      const existingContent = storeData.content || {};
      await Promise.all([
        updateManagerStoreSetting("business", { ...(existingSettings.business || {}), ...storeForm.business }),
        updateManagerStoreSetting("general", { ...(existingSettings.general || {}), ...storeForm.general }),
        updateManagerStoreContent("contact", { ...(existingContent.contact || {}), ...storeForm.contact }),
        updateManagerStoreContent("about", { ...(existingContent.about || {}), ...storeForm.about }),
        updateManagerStoreContent("footer", { ...(existingContent.footer || {}), ...storeForm.footer }),
        updateManagerStoreContent("home", { ...(existingContent.home || {}), ...storeForm.home }),
      ]);
      setStoreData({ settings: { ...existingSettings, business: { ...(existingSettings.business || {}), ...storeForm.business }, general: { ...(existingSettings.general || {}), ...storeForm.general } }, content: { ...existingContent, contact: { ...(existingContent.contact || {}), ...storeForm.contact }, about: { ...(existingContent.about || {}), ...storeForm.about }, footer: { ...(existingContent.footer || {}), ...storeForm.footer }, home: { ...(existingContent.home || {}), ...storeForm.home } } });
      toast.success(t("تم حفظ بيانات المتجر وتظهر الآن في الموقع"));
    } catch (error) {
      toast.error(error?.message || t("تعذر حفظ بيانات المتجر"));
    } finally { setStoreSaving(false); }
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    try {
      await managerLogin(loginForm.email, loginForm.password);
      setSession(getManagerSession());
      toast.success(t("تم تسجيل الدخول بنجاح"));
      setLoginForm({ email: "", password: "" });
    } catch (error) {
      toast.error(error?.message || t("بيانات الدخول غير صحيحة."));
    }
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-[#fbfcfa] px-5 py-10 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[32px] border border-[#e1e7de] bg-white shadow-[0_25px_80px_rgba(40,55,38,0.10)] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden bg-[#B4C4AD] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1.5 ring-1 ring-white/20"><img src="/opticana-mark.png" alt="" className="h-full w-full object-contain" /></div>
                <div>
                  <div className="text-xl font-black tracking-[0.08em]">OPTICANA</div>
                  <div className="text-xs text-white/65">{t("إدارة المتجر")}</div>
                </div>
              </div>
              <div className="mt-24 max-w-md">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black">
                  <Sparkles size={14} />
                  {t("طريقة أسهل لإدارة المنتجات")}
                </div>
                <h1 className="text-5xl font-black leading-[1.08]">
                  {t("أضف المنتج وانشره")}
                  <br />
                  {t("في دقائق.")}
                </h1>
                <p className="mt-6 leading-8 text-white/70">
                  {t("أداة خفيفة داخل موقع OPTICANA نفسه، بدون لوحة إدارة منفصلة.")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/65">
              <ShieldCheck size={18} />
              {t("وصول محمي بصلاحيات الإدارة")}
            </div>
          </section>

          <section className="p-6 sm:p-10 lg:p-14">
            <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-black text-[#52604e]">
              ← {t("العودة للمتجر")}
            </Link>
            <div className="mb-8">
              <p className="text-sm font-black text-[#667460]">{t("مساحة خاصة")}</p>
              <h2 className="mt-2 text-3xl font-black text-[#20251f]">{t("إدارة المنتجات")}</h2>
              <p className="mt-2 text-sm leading-7 text-[#7a8378]">{t("سجل الدخول لإضافة المنتجات وتعديلها ونشرها على المتجر.")}</p>
            </div>
            <form onSubmit={submitLogin} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-[#424b40]">{t("البريد الإلكتروني")}</span>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                  className="h-13 w-full rounded-2xl border border-[#dfe5dc] bg-[#fbfcfa] px-4 outline-none transition focus:border-[#aebda8] focus:ring-4 focus:ring-[#EFE8E2]"
                  autoComplete="username"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-black text-[#424b40]">{t("كلمة المرور")}</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  className="h-13 w-full rounded-2xl border border-[#dfe5dc] bg-[#fbfcfa] px-4 outline-none transition focus:border-[#aebda8] focus:ring-4 focus:ring-[#EFE8E2]"
                  autoComplete="current-password"
                  required
                />
              </label>
              <button className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#B4C4AD] text-sm font-black text-white transition hover:bg-[#9ead97]">
                <LogIn size={18} />
                {t("دخول آمن")}
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfcfa] text-[#20251f]">
      <header className="sticky top-0 z-30 border-b border-[#e2e7df] bg-[#fbfcfa]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 ring-1 ring-[#dfe6dc]"><img src="/opticana-mark.png" alt="" className="h-full w-full object-contain" /></div>
            <div>
              <div className="text-lg font-black tracking-[0.08em]">OPTICANA</div>
              <div className="text-[10px] font-bold text-[#7b8578]">{t("إدارة المنتجات")}</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden rounded-xl border border-[#dfe5dc] bg-white px-3.5 py-2.5 text-xs font-black text-[#566352] sm:inline-flex">
              {t("عرض المتجر")}
            </Link>
            <button
              type="button"
              onClick={() => { managerLogout(); setSession(null); }}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dfe5dc] bg-white px-3 text-xs font-black text-[#697565]"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">{t("خروج")}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">
        <nav className="mb-8 grid gap-2 rounded-2xl border border-[#dfe6dc] bg-white p-2 sm:grid-cols-3" aria-label={t("أقسام الإدارة")}>
          <ManagerTab active={activePanel === "products"} onClick={() => setActivePanel("products")} icon={PackagePlus} label={t("المنتجات والتصنيفات")} />
          <ManagerTab active={activePanel === "store"} onClick={() => setActivePanel("store")} icon={Store} label={t("بيانات المتجر")} />
          <ManagerTab active={activePanel === "orders"} onClick={() => setActivePanel("orders")} icon={Tags} label={t("الطلبات")} />
          <ManagerTab active={activePanel === "reviews"} onClick={() => setActivePanel("reviews")} icon={MessageSquare} label={t("التقييمات")} />
        </nav>

        {activePanel === "products" && (
          <>
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black text-[#6d7869]">{t("مساحتك السريعة")}</p>
            <h1 className="mt-1 text-3xl font-black sm:text-4xl">{t("منتجات المتجر")}</h1>
            <p className="mt-2 text-sm text-[#7a8378]">{t("أضف، عدّل، وانشر منتجاتك من نفس الموقع.")}</p>
          </div>
          <button type="button" onClick={openNew} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#B4C4AD] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#9ead97]">
            <Plus size={18} />
            {t("إضافة منتج")}
          </button>
        </div>

        {showForm && (
          <section className="mb-10 overflow-hidden rounded-[28px] border border-[#dfe6dc] bg-white shadow-[0_18px_55px_rgba(40,55,38,0.08)]">
            <div className="flex items-center justify-between border-b border-[#EFE8E2] px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-black text-[#7a8577]">{editing ? t("تعديل المنتج") : t("منتج جديد")}</p>
                <h2 className="mt-1 text-xl font-black">{editing ? editing.name : t("أضف منتجًا للمتجر")}</h2>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e1e6df] text-[#697565]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_300px]">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("اسم المنتج")} required>
                  <input value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} placeholder={t("مثال: نظارة شمسية كلاسيكية")} required />
                </Field>
                <Field label={t("اسم المنتج بالإنجليزية")}>
                  <input value={form.nameEn} onChange={(e) => setField("nameEn", e.target.value)} className={inputClass} placeholder="Classic sunglasses" />
                </Field>
                <Field label="SKU">
                  <input value={form.sku} onChange={(e) => setField("sku", e.target.value)} className={inputClass} />
                </Field>
                <Field label={t("السعر")} required>
                  <input type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => setField("price", e.target.value)} className={inputClass} placeholder="0.00" required />
                </Field>
                <Field label={t("السعر القديم")}>
                  <input type="number" min="0" step="0.01" value={form.oldPrice} onChange={(e) => setField("oldPrice", e.target.value)} className={inputClass} placeholder={t("اختياري")} />
                </Field>
                <Field label={t("سعر التكلفة")}>
                  <input type="number" min="0" step="0.01" value={form.purchasePrice} onChange={(e) => setField("purchasePrice", e.target.value)} className={inputClass} placeholder={t("اختياري")} />
                </Field>
                {!editing && (
                  <Field label={t("المخزون الابتدائي")}>
                    <input type="number" min="0" step="1" value={form.initialStock} onChange={(e) => setField("initialStock", e.target.value)} className={inputClass} />
                  </Field>
                )}
                <Field label={t("الفئة")}>
                  <div className="relative">
                    <select value={form.categoryId} onChange={(e) => setField("categoryId", e.target.value)} className={`${inputClass} appearance-none pr-10`}>
                      <option value="">{t("بدون تصنيف")}</option>
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                    <ChevronDown size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7c8679]" />
                  </div>
                </Field>
                <Field label={t("المقاس")}>
                  <input value={form.size} onChange={(e) => setField("size", e.target.value)} className={inputClass} placeholder={t("مثال: 52-18-140")} />
                </Field>
                <Field label={t("اللون")}>
                  <input value={form.color} onChange={(e) => setField("color", e.target.value)} className={inputClass} />
                </Field>
                <Field label={t("الخامة")}>
                  <input value={form.material} onChange={(e) => setField("material", e.target.value)} className={inputClass} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label={t("الوصف")}>
                    <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} className={`${inputClass} min-h-28 py-3`} placeholder={t("اكتب وصفًا قصيرًا وواضحًا للمنتج...")} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label={t("وصف المنتج بالإنجليزية")}>
                    <textarea value={form.descriptionEn} onChange={(e) => setField("descriptionEn", e.target.value)} className={`${inputClass} min-h-28 py-3`} placeholder="Describe the product in English" />
                  </Field>
                </div>

                <div className="sm:col-span-2 rounded-2xl border border-[#dfe6dc] bg-[#f8faf7] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-[#34402f]">{t("حقول مخصصة للمنتج")}</h3>
                      <p className="mt-1 text-xs leading-6 text-[#758073]">{t("أضف أي خاصية إضافية باسم وقيمة من اختيارك، مثل الحماية من الأشعة أو نوع العدسة.")}</p>
                    </div>
                    <button
                      type="button"
                      disabled={(Array.isArray(form.customFields) ? form.customFields.length : 0) >= 50}
                      onClick={() => setField("customFields", [...(Array.isArray(form.customFields) ? form.customFields : []), { name: "", type: "text", value: "" }])}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#cfd9cb] bg-white px-3 text-xs font-black text-[#53604e] transition hover:border-[#9dad95] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus size={15} />
                      {t("إضافة حقل")}
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {(Array.isArray(form.customFields) ? form.customFields : []).map((customField, index) => (
                      <div key={`custom-field-${index}`} className="grid gap-3 sm:grid-cols-[1fr_0.7fr_1.5fr_auto] sm:items-end">
                        <Field label={t("اسم الخاصية")} required>
                          <input
                            value={customField.name || ""}
                            maxLength={80}
                            required
                            onChange={(event) => updateCustomField(index, { name: event.target.value })}
                            className={inputClass}
                            placeholder={t("مثال: الحماية من الأشعة")}
                          />
                        </Field>
                        <Field label={t("نوع القيمة")} required>
                          <select
                            value={["text", "number", "image"].includes(customField.type) ? customField.type : "text"}
                            disabled={Boolean(uploadingCustomFields[index])}
                            onChange={(event) => updateCustomField(index, { type: event.target.value, value: "" })}
                            className={inputClass}
                          >
                            <option value="text">{t("نص")}</option>
                            <option value="number">{t("رقم")}</option>
                            <option value="image">{t("صورة")}</option>
                          </select>
                        </Field>
                        <Field label={t("القيمة")} required>
                          {customField.type === "image" ? (
                            <div className="space-y-2">
                              {customField.value ? (
                                <img src={customField.value} alt={customField.name || t("صورة")} className="h-24 w-24 rounded-xl border border-[#dfe5dc] bg-white object-contain p-1" />
                              ) : (
                                <p className="text-xs text-[#8a9388]">{t("لم يتم رفع صورة لهذه الخاصية بعد")}</p>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                required={!customField.value}
                                disabled={Boolean(uploadingCustomFields[index])}
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  void handleCustomFieldImage(index, file);
                                  event.target.value = "";
                                }}
                                className={inputClass}
                                aria-label={t("ارفع صورة للخاصية")}
                              />
                            </div>
                          ) : (
                            <input
                              type={customField.type === "number" ? "number" : "text"}
                              step={customField.type === "number" ? "any" : undefined}
                              value={customField.value ?? ""}
                              maxLength={customField.type === "number" ? undefined : 500}
                              required
                              onChange={(event) => updateCustomField(index, { value: event.target.value })}
                              className={inputClass}
                              placeholder={customField.type === "number" ? t("مثال: 250") : t("مثال: UV400")}
                            />
                          )}
                        </Field>
                        <button
                          type="button"
                          disabled={Boolean(uploadingCustomFields[index])}
                          onClick={() => setField("customFields", form.customFields.filter((_, fieldIndex) => fieldIndex !== index))}
                          className="mb-0.5 flex h-11 w-11 items-center justify-center rounded-xl border border-[#ead6d2] bg-white text-[#9c5b50] transition hover:bg-[#fff7f5] disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={t("حذف الحقل")}
                          title={t("حذف الحقل")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {(!Array.isArray(form.customFields) || form.customFields.length === 0) && (
                      <p className="rounded-xl border border-dashed border-[#d8e0d4] bg-white/70 px-3 py-4 text-xs text-[#8a9388]">
                        {t("لا توجد حقول إضافية. أضف حقلًا عند الحاجة.")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                  <Toggle checked={form.publish} onChange={(value) => setField("publish", value)} title={t("نشر المنتج")} text={t("سيظهر مباشرة للزوار")} />
                  <Toggle checked={form.isNew} onChange={(value) => setField("isNew", value)} title={t("منتج جديد")} text={t("إظهار شارة جديد")} />
                  <Toggle checked={form.featured} onChange={(value) => setField("featured", value)} title={t("مميز")} text={t("إظهاره في الاختيارات المميزة")} />
                  <Toggle checked={form.isSale} onChange={(value) => setField("isSale", value)} title={t("عرض")} text={t("استخدمه مع السعر القديم")} />
                </div>
              </div>

              <div>
                <Field label={isEnglish ? "Product gallery" : "معرض صور المنتج"}>
                  <div className="space-y-3">
                    {(form.images.length > 0 || uploadingImages > 0) && (
                      <div className="grid grid-cols-2 gap-3">
                        {form.images.map((image, index) => (
                          <div key={`${image.slice(0, 30)}-${index}`} className="group relative aspect-square overflow-hidden rounded-2xl border border-[#dfe5dc] bg-white">
                            <img src={image} alt={`${form.name || "OPTICANA"} ${index + 1}`} className="h-full w-full object-cover" />
                            {index === 0 && <span className="absolute right-2 top-2 rounded-lg bg-[#B4C4AD]/90 px-2 py-1 text-[10px] font-black text-white">{isEnglish ? "Main" : "الرئيسية"}</span>}
                            <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); removeImage(index); }} className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-[#8a594f] shadow-sm opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100" aria-label={isEnglish ? "Remove image" : "حذف الصورة"}>
                              <X size={15} />
                            </button>
                          </div>
                        ))}
                        {Array.from({ length: uploadingImages }, (_, index) => (
                          <div key={`uploading-${index}`} className="flex aspect-square animate-pulse items-center justify-center rounded-2xl border border-dashed border-[#cfd9cb] bg-[#EFE8E2] text-xs font-black text-[#7b8877]">
                            {isEnglish ? "Uploading..." : "جاري الرفع..."}
                          </div>
                        ))}
                      </div>
                    )}
                    {form.images.length + uploadingImages < MAX_PRODUCT_IMAGES && (
                      <label className="group flex min-h-[140px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[24px] border border-dashed border-[#cfd9cb] bg-[#EFE8E2] text-center transition hover:border-[#aebda8] hover:bg-[#EFE8E2]">
                        <ImagePlus size={30} className="mb-3 text-[#7b8877]" />
                        <span className="text-sm font-black text-[#556151]">{form.images.length ? (isEnglish ? "Add more photos" : "أضف صورًا أخرى") : t("ارفع صورة")}</span>
                        <span className="mt-1 text-xs text-[#8a9388]">{isEnglish ? `Up to ${MAX_PRODUCT_IMAGES} images · compressed automatically` : `حتى ${MAX_PRODUCT_IMAGES} صور · تُضغط تلقائيًا`}</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => { handleImages(e.target.files); e.target.value = ""; }} />
                      </label>
                    )}
                  </div>
                </Field>
                <div className="mt-4 rounded-2xl border border-[#e3e9e0] bg-[#f8faf7] p-4 text-xs leading-6 text-[#758073]">
                  <div className="flex items-start gap-2">
                    <Sparkles size={15} className="mt-0.5 shrink-0 text-[#64725f]" />
                    <span>{isEnglish ? "The first image appears on the product card. All images are saved with the product automatically." : "تظهر الصورة الأولى على بطاقة المنتج، وتُحفظ كل الصور مع المنتج تلقائيًا."}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#EFE8E2] pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="h-12 rounded-2xl border border-[#dfe5dc] bg-white px-5 text-sm font-black text-[#687366]">
                  {t("إلغاء")}
                </button>
                <button disabled={saving || uploadingImages > 0} type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#B4C4AD] px-6 text-sm font-black text-white disabled:opacity-50">
                  {saving ? t("جاري الحفظ...") : uploadingImages > 0 ? (isEnglish ? "Uploading images..." : "جاري رفع الصور...") :<><Check size={18} /> {editing ? t("حفظ التعديلات") : t("حفظ ونشر")}</>}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mb-8 rounded-[28px] border border-[#dfe6dc] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-xl bg-[#EFE8E2] p-2.5 text-[#596955]"><Tags size={19} /></div>
            <div><p className="text-xs font-black text-[#778274]">{t("قبل إضافة المنتج")}</p><h2 className="mt-1 text-lg font-black">{t("إضافة تصنيف للنظارات")}</h2><p className="mt-1 text-xs leading-6 text-[#818a7f]">{t("أي تصنيف تضيفه هنا يظهر تلقائيًا في حقل تصنيف المنتج وفي المتجر.")}</p></div>
          </div>
          <form onSubmit={saveCategory} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.5fr_1.5fr_120px_auto] sm:items-end">
            <Field label={t("اسم التصنيف")} required><input value={categoryForm.name} onChange={(e) => setCategoryForm((current) => ({ ...current, name: e.target.value }))} className={inputClass} placeholder={t("مثال: نظارات شمسية")} required /></Field>
            <Field label={t("اسم التصنيف بالإنجليزية")}><input value={categoryForm.nameEn} onChange={(e) => setCategoryForm((current) => ({ ...current, nameEn: e.target.value }))} className={inputClass} placeholder="Sunglasses" /></Field>
            <Field label={t("وصف مختصر")}><input value={categoryForm.description} onChange={(e) => setCategoryForm((current) => ({ ...current, description: e.target.value }))} className={inputClass} placeholder={t("اختياري")} /></Field>
            <Field label={t("وصف مختصر بالإنجليزية")}><input value={categoryForm.descriptionEn} onChange={(e) => setCategoryForm((current) => ({ ...current, descriptionEn: e.target.value }))} className={inputClass} placeholder="Optional" /></Field>
            <Field label={t("الترتيب")}><input type="number" min="0" value={categoryForm.sortOrder} onChange={(e) => setCategoryForm((current) => ({ ...current, sortOrder: e.target.value }))} className={inputClass} /></Field>
            <button disabled={categorySaving} className="h-12 rounded-2xl bg-[#53634f] px-5 text-sm font-black text-white disabled:opacity-50">{categorySaving ? t("جاري الحفظ...") : t("إضافة تصنيف")}</button>
          </form>
          {categories.length > 0 && <div className="mt-5 grid gap-3 sm:grid-cols-2">{categories.filter((category) => category.isActive).map((category) => <div key={category.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#EFE8E2] px-3 py-2.5"><div><p className="text-xs font-black text-[#576354]">{category.name}</p><p className="mt-1 text-[11px] text-[#788575]">{category.productCount || 0} {t("منتج")}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => deleteCategory(category, false)} className="rounded-xl border border-[#d7dfd4] bg-white px-3 py-2 text-[11px] font-black text-[#596555]">{t("حذف التصنيف فقط")}</button><button type="button" onClick={() => deleteCategory(category, true)} className="rounded-xl bg-[#8b5f54] px-3 py-2 text-[11px] font-black text-white">{t("حذف التصنيف والمنتجات")}</button></div></div>)}</div>}
        </section>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#899287]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className={`${inputClass} h-12 pr-11`} placeholder={t("ابحث بالاسم أو SKU...")} />
          </div>
          <div className="inline-flex h-12 items-center rounded-2xl border border-[#dfe5dc] bg-white px-4 text-xs font-black text-[#687366]">
            {filteredProducts.length} {t("منتج")}
          </div>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-[#e1e7de] bg-white">
          {loading ? (
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-2xl bg-[#f0f3ed]" />)}
            </div>
          ) : filteredProducts.length ? (
            <div className="divide-y divide-[#EFE8E2]">
              {filteredProducts.map((product) => (
                <article key={product.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#f4f6f2]">
                    {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs font-black text-[#9aa399]">OPTICANA</div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-black">{product.name}</h3>
                      {product.status === "PUBLISHED" && product.showOnStore !== false ? (
                        <span className="rounded-full bg-[#edf4e9] px-2.5 py-1 text-[10px] font-black text-[#53634f]">{t("منشور")}</span>
                      ) : (
                        <span className="rounded-full bg-[#f2f3f0] px-2.5 py-1 text-[10px] font-black text-[#7b8479]">{t("مسودة")}</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[#818a7f]">{product.sku} · {product.category?.name || t("بدون تصنيف")}</p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs font-black text-[#566151]">
                      <span>{Number(product.price || 0).toLocaleString(isEnglish ? "en-EG" : "ar-EG")} {isEnglish ? "EGP" : "ج.م"}</span>
                      <span>{t("المخزون")}: {product.stock}</span>
                      {product.isSale && <span>{t("عرض")}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => openEdit(product)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dfe5dc] bg-white px-3 text-xs font-black text-[#596555]">
                      <Pencil size={15} /> {t("تعديل")}
                    </button>
                    <button type="button" onClick={() => toggleVisibility(product)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe5dc] bg-white text-[#566a52]" aria-label={product.status === "PUBLISHED" && product.showOnStore !== false ? t("إخفاء المنتج") : t("إظهار المنتج")} title={product.status === "PUBLISHED" && product.showOnStore !== false ? t("إخفاء المنتج") : t("إظهار المنتج")}>
                      {product.status === "PUBLISHED" && product.showOnStore !== false ? <Eye size={17} /> : <EyeOff size={17} />}
                    </button>
                    <button type="button" onClick={() => deleteProduct(product)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfdb] bg-white text-[#8b665c]" aria-label={t("حذف المنتج")} title={t("حذف المنتج")}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-6 py-20 text-center">
              <PackagePlus size={34} className="mx-auto text-[#9aa598]" />
              <h3 className="mt-4 text-xl font-black">{t("لا توجد منتجات بعد")}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#818a7f]">{t("ابدأ بإضافة أول منتج، وستظهره الأداة تلقائيًا في المتجر عند نشره.")}</p>
              <button type="button" onClick={openNew} className="mt-5 rounded-2xl bg-[#B4C4AD] px-5 py-3 text-sm font-black text-white">{t("إضافة أول منتج")}</button>
            </div>
          )}
        </section>
          </>
        )}

        {activePanel === "store" && (
          <form onSubmit={saveStoreData} className="space-y-6">
            <section className="rounded-[28px] border border-[#dfe6dc] bg-white p-5 shadow-sm sm:p-7">
              <p className="text-sm font-black text-[#6d7869]">{t("بيانات الموقع والمتجر")}</p><h1 className="mt-1 text-3xl font-black">{t("كل ما يظهر للزائر")}</h1><p className="mt-2 text-sm text-[#7a8378]">{t("رقم واتساب السلة، التواصل، روابط السوشيال والفوتر وصفحة من نحن.")}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StoreInput label={t("اسم المتجر")} value={storeForm.business.storeName} onChange={(value) => setStoreForm((f) => ({ ...f, business: { ...f.business, storeName: value } }))} />
                <StoreInput label={t("الشعار المختصر")} value={storeForm.general.slogan} onChange={(value) => setStoreForm((f) => ({ ...f, general: { ...f.general, slogan: value } }))} />
                <StoreInput label={t("العملة")} value={storeForm.general.currency} onChange={(value) => setStoreForm((f) => ({ ...f, general: { ...f.general, currency: value } }))} />
                <StoreInput label={t("رقم الهاتف")} value={storeForm.business.phone} onChange={(value) => setStoreForm((f) => ({ ...f, business: { ...f.business, phone: value } }))} />
                <StoreInput label={t("رقم واتساب للسلة والطلبات")} value={storeForm.business.whatsapp} onChange={(value) => setStoreForm((f) => ({ ...f, business: { ...f.business, whatsapp: value } }))} placeholder="2010..." />
                <StoreInput label={t("البريد الإلكتروني")} value={storeForm.business.email} onChange={(value) => setStoreForm((f) => ({ ...f, business: { ...f.business, email: value } }))} type="email" />
                <StoreInput label={t("الموقع الإلكتروني")} value={storeForm.business.website} onChange={(value) => setStoreForm((f) => ({ ...f, business: { ...f.business, website: value } }))} type="url" />
                <StoreInput label="Instagram" value={storeForm.business.instagram} onChange={(value) => setStoreForm((f) => ({ ...f, business: { ...f.business, instagram: value } }))} type="url" />
                <StoreInput label="TikTok" value={storeForm.business.tiktok} onChange={(value) => setStoreForm((f) => ({ ...f, business: { ...f.business, tiktok: value } }))} type="url" />
                <StoreInput label={isEnglish ? "Links page (Linktree) · shown as a QR code in the footer" : "صفحة الروابط (Linktree) · تظهر كـ QR في أسفل الموقع"} value={storeForm.business.linktree} onChange={(value) => setStoreForm((f) => ({ ...f, business: { ...f.business, linktree: value } }))} type="url" placeholder="https://linktr.ee/..." />
                <StoreInput label="Facebook" value={storeForm.business.facebook} onChange={(value) => setStoreForm((f) => ({ ...f, business: { ...f.business, facebook: value } }))} type="url" />
                <StoreInput label={t("ساعات العمل")} value={storeForm.business.workingHours} onChange={(value) => setStoreForm((f) => ({ ...f, business: { ...f.business, workingHours: value } }))} />
                <StoreInput label={t("العنوان")} value={storeForm.business.address} onChange={(value) => setStoreForm((f) => ({ ...f, business: { ...f.business, address: value } }))} />
                <StoreInput label={isEnglish ? "Address (English)" : "العنوان بالإنجليزية"} value={storeForm.business.addressEn} onChange={(value) => setStoreForm((f) => ({ ...f, business: { ...f.business, addressEn: value } }))} />
                <div className="sm:col-span-2 lg:col-span-3"><StoreInput label={t("رابط الخريطة المضمّن")} value={storeForm.business.googleMaps} onChange={(value) => setStoreForm((f) => ({ ...f, business: { ...f.business, googleMaps: value } }))} type="url" /></div>
                {storeForm.business.branches.map((branch, index) => {
                  const setBranch = (field, value) => setStoreForm((f) => ({
                    ...f,
                    business: { ...f.business, branches: f.business.branches.map((item, i) => (i === index ? { ...item, [field]: value } : item)) },
                  }));
                  const number = index === 0 ? (isEnglish ? "first" : "الأول") : (isEnglish ? "second" : "الثاني");
                  return (
                    <div key={index} className="grid gap-4 rounded-2xl border border-[#e3e9e0] bg-[#fbfcfa] p-4 sm:col-span-2 sm:grid-cols-3 lg:col-span-3">
                      <StoreInput label={isEnglish ? `Branch ${index + 1} (Arabic)` : `الفرع ${number}`} value={branch.name} onChange={(value) => setBranch("name", value)} placeholder={isEnglish ? "Leave empty to hide" : "اتركه فارغًا لإخفائه"} />
                      <StoreInput label={isEnglish ? `Branch ${index + 1} (English)` : `الفرع ${number} بالإنجليزية`} value={branch.nameEn} onChange={(value) => setBranch("nameEn", value)} />
                      <StoreInput label={isEnglish ? "Google Maps link" : "رابط الفرع على Google Maps"} value={branch.mapUrl} onChange={(value) => setBranch("mapUrl", value)} type="url" placeholder="https://maps.app.goo.gl/..." />
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[28px] border border-[#dfe6dc] bg-white p-5 shadow-sm sm:p-7 lg:col-span-2"><h2 className="text-xl font-black">{t("صورة الصفحة الرئيسية")}</h2><p className="mt-1 text-sm text-[#7a8378]">{t("تظهر هذه الصورة في القسم الرئيسي من الصفحة الرئيسية.")}</p><div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]"><StoreInput label={t("رابط الصورة")} value={storeForm.home.hero.image} onChange={(value) => setStoreForm((f) => ({ ...f, home: { ...f.home, hero: { ...f.home.hero, image: value } } }))} type="url" placeholder="https://..." /><label className="flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#aebda8] bg-[#EFE8E2] px-5 text-sm font-black text-[#53634f]"><ImagePlus size={17} className="ml-2" />{t("رفع صورة من ملف")}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => handleHeroImage(event.target.files?.[0])} /></label></div>{storeForm.home.hero.image && <img src={storeForm.home.hero.image} alt={t("معاينة صورة الصفحة الرئيسية")} className="mt-4 h-40 w-full rounded-2xl object-cover sm:h-56" />}</div>
              <div className="rounded-[28px] border border-[#dfe6dc] bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-black">{t("صفحة تواصل معنا")}</h2><div className="mt-5 space-y-4"><StoreInput label={t("العنوان")} value={storeForm.contact.title} onChange={(value) => setStoreForm((f) => ({ ...f, contact: { ...f.contact, title: value } }))} /><StoreTextarea label={t("الوصف")} value={storeForm.contact.description} onChange={(value) => setStoreForm((f) => ({ ...f, contact: { ...f.contact, description: value } }))} /></div></div>
              <div className="rounded-[28px] border border-[#dfe6dc] bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-black">{t("الفوتر")}</h2><div className="mt-5"><StoreTextarea label={t("وصف الفوتر")} value={storeForm.footer.description} onChange={(value) => setStoreForm((f) => ({ ...f, footer: { ...f.footer, description: value } }))} /><div className="mt-4"><StoreTextarea label={isEnglish ? "Footer description (English)" : "وصف الفوتر بالإنجليزية"} value={storeForm.footer.descriptionEn} onChange={(value) => setStoreForm((f) => ({ ...f, footer: { ...f.footer, descriptionEn: value } }))} /></div></div></div>
              <div className="rounded-[28px] border border-[#dfe6dc] bg-white p-5 shadow-sm sm:p-7 lg:col-span-2"><h2 className="text-xl font-black">{t("صفحة من نحن")}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><StoreInput label={t("العنوان")} value={storeForm.about.title} onChange={(value) => setStoreForm((f) => ({ ...f, about: { ...f.about, title: value } }))} /><StoreInput label={t("الرؤية")} value={storeForm.about.vision} onChange={(value) => setStoreForm((f) => ({ ...f, about: { ...f.about, vision: value } }))} /><StoreTextarea label={t("الوصف")} value={storeForm.about.description} onChange={(value) => setStoreForm((f) => ({ ...f, about: { ...f.about, description: value } }))} /><StoreTextarea label={t("الرسالة")} value={storeForm.about.mission} onChange={(value) => setStoreForm((f) => ({ ...f, about: { ...f.about, mission: value } }))} /></div></div>
            </section>
            <div className="flex justify-end"><button disabled={storeSaving} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#B4C4AD] px-6 text-sm font-black text-white disabled:opacity-50"><Save size={17} />{storeSaving ? t("جاري الحفظ...") : t("حفظ بيانات المتجر")}</button></div>
          </form>
        )}

        {activePanel === "orders" && (
          <section className="overflow-hidden rounded-[28px] border border-[#dfe6dc] bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-[#EFE8E2] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7"><div><p className="text-sm font-black text-[#6d7869]">{t("متابعة سريعة")}</p><h1 className="mt-1 text-3xl font-black">{t("طلبات المتجر")}</h1><p className="mt-2 text-sm text-[#7a8378]">{t("الرقم الظاهر هو رقم العميل الذي أدخله عند فتح طلب واتساب.")}</p></div><select value={ordersRange} onChange={(e) => setOrdersRange(e.target.value)} className={`${inputClass} max-w-52`}><option value="24h">{t("آخر 24 ساعة")}</option><option value="all">{t("كل الطلبات السابقة")}</option></select></div>
            {loading ? <div className="p-8 text-center text-sm text-[#7a8378]">{t("جاري تحميل الطلبات...")}</div> : orders.length ? <div className="divide-y divide-[#EFE8E2]">{orders.map((order) => <article key={order.id} className="p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">{order.orderNumber}</h2><span className="rounded-full bg-[#EFE8E2] px-2.5 py-1 text-[10px] font-black text-[#5d6c59]">{ORDER_STATUS_LABELS[order.status]?.[isEnglish ? "en" : "ar"] || order.status}</span></div><p className="mt-2 text-sm font-bold text-[#4e5b4b]">{order.customer?.name || t("عميل غير معروف")} · {order.customer?.phone || t("لم يُدخل رقمًا")}</p><p className="mt-1 text-xs text-[#849080]">{new Date(order.createdAt).toLocaleString(isEnglish ? "en-EG" : "ar-EG")}</p></div><p className="text-lg font-black">{Number(order.total || 0).toLocaleString(isEnglish ? "en-EG" : "ar-EG")} {order.currency || "ج.م"}</p></div><div className="mt-4 flex flex-wrap gap-2">{order.items.map((item) => <span key={item.id} className="rounded-xl bg-[#EFE8E2] px-3 py-2 text-xs font-bold text-[#596555]">{item.name} × {item.quantity}</span>)}</div><OrderActions order={order} busy={orderUpdating === order.id} onChange={changeOrderStatus} isEnglish={isEnglish} /></article>)}</div> : <div className="p-12 text-center text-sm text-[#7a8378]">{ordersRange === "24h" ? t("لا توجد طلبات في آخر 24 ساعة") : t("لا توجد طلبات حتى الآن")}</div>}
          </section>
        )}

        {activePanel === "reviews" && (
          <section className="overflow-hidden rounded-[28px] border border-[#dfe6dc] bg-white shadow-sm">
            <div className="border-b border-[#EFE8E2] p-5 sm:p-7"><p className="text-sm font-black text-[#6d7869]">{t("مراجعة العملاء")}</p><h1 className="mt-1 text-3xl font-black">{t("التقييمات")}</h1><p className="mt-2 text-sm text-[#7a8378]">{t("لا تدخل التقييمات في متوسط المنتج إلا بعد اعتمادها.")}</p></div>
            {reviews.length ? <div className="divide-y divide-[#EFE8E2]">{reviews.map((review) => <article key={review.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><div className="flex flex-wrap items-center gap-2"><p className="font-black">{review.product?.name || t("منتج محذوف")}</p><span className="rounded-full bg-[#EFE8E2] px-2.5 py-1 text-[10px] font-black text-[#5d6c59]">{review.rating}/5</span><span className="rounded-full bg-[#f7f3ed] px-2.5 py-1 text-[10px] font-black text-[#846b4e]">{review.status}</span></div><p className="mt-2 text-sm text-[#596555]">{review.comment || t("بدون تعليق")}</p><p className="mt-2 text-xs text-[#849080]">{review.customer?.name || t("زائر")}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setReviewStatus(review, "APPROVED")} className="rounded-xl bg-[#53634f] px-3 py-2 text-xs font-black text-white">{t("اعتماد")}</button><button type="button" onClick={() => setReviewStatus(review, "REJECTED")} className="rounded-xl border border-[#dfe5dc] bg-white px-3 py-2 text-xs font-black text-[#596555]">{t("رفض")}</button><button type="button" onClick={() => removeReview(review)} className="rounded-xl border border-[#eadfdb] bg-white px-3 py-2 text-xs font-black text-[#8b665c]">{t("حذف")}</button></div></article>)}</div> : <div className="p-12 text-center text-sm text-[#7a8378]">{t("لا توجد تقييمات حتى الآن")}</div>}
          </section>
        )}
      </div>
    </main>
  );
}

const inputClass = "h-12 w-full rounded-2xl border border-[#dfe5dc] bg-white px-4 text-sm font-semibold text-[#30382e] outline-none transition focus:border-[#aebda8] focus:ring-4 focus:ring-[#EFE8E2]";

function Field({ label, required, children, hint }) {
  const [focused, setFocused] = useState(false);
  const { isEnglish } = useLanguage();
  const field = cloneElement(children, {
    onFocus: (event) => { children.props.onFocus?.(event); setFocused(true); },
    onBlur: (event) => { children.props.onBlur?.(event); setFocused(false); },
  });
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-[#5d685a]">{label}{required ? " *" : ""}</span>
      {field}
      {focused && <span className="mt-2 block text-xs leading-5 text-[#758170]">{hint || tHint(label, isEnglish)}</span>}
    </label>
  );
}

function tHint(label, isEnglish) {
  return isEnglish
    ? `This field updates ${label}; save the form to publish the change on the site.`
    : `هذه الخانة تعدّل ${label}؛ احفظ النموذج لتظهر التغييرات في الموقع.`;
}

function Toggle({ checked, onChange, title, text }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`flex items-center gap-3 rounded-2xl border p-4 text-right transition ${checked ? "border-[#cbd8c7] bg-[#f3f7f1]" : "border-[#e4e9e2] bg-white"}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${checked ? "border-[#71806c] bg-[#657361] text-white" : "border-[#d8dfd5] bg-white text-transparent"}`}><Check size={14} /></span>
      <span className="min-w-0">
        <span className="block text-xs font-black text-[#465142]">{title}</span>
        <span className="mt-0.5 block text-[11px] text-[#899287]">{text}</span>
      </span>
    </button>
  );
}

function ManagerTab({ active, onClick, icon: Icon, label }) {
  return <button type="button" onClick={onClick} className={`flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black transition ${active ? "bg-[#B4C4AD] text-white" : "text-[#667360] hover:bg-[#f3f6f1]"}`}><Icon size={16} />{label}</button>;
}

function StoreInput({ label, value, onChange, type = "text", placeholder = "" }) {
  return <Field label={label}><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} placeholder={placeholder} /></Field>;
}

function StoreTextarea({ label, value, onChange }) {
  return <Field label={label}><textarea value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} min-h-28 py-3`} /></Field>;
}

function OrderActions({ order, busy, onChange, isEnglish }) {
  const next = NEXT_ORDER_STATUS[order.status];
  if (!next) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" disabled={busy} onClick={() => onChange(order, next.status)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#B4C4AD] px-4 text-xs font-black text-white disabled:opacity-50">
        <Check size={15} />{isEnglish ? next.en : next.ar}
      </button>
      <button type="button" disabled={busy} onClick={() => onChange(order, "CANCELLED")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e6d6d2] bg-white px-4 text-xs font-black text-[#8a594f] disabled:opacity-50">
        <X size={15} />{isEnglish ? "Cancel order" : "إلغاء الطلب"}
      </button>
    </div>
  );
}

export default Manager;
