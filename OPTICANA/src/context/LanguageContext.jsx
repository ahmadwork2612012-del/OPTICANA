import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "opticana-language";
const catalogTranslations = new Map();

// Catalog records are authored in Arabic and English from the manager. Keeping
// this small runtime registry lets the existing DOM translator also translate
// newly-loaded product/category text without an external translation service.
export function registerCatalogTranslation(arabic, english) {
  const source = String(arabic || "").trim();
  const translated = String(english || "").trim();
  if (source && translated) catalogTranslations.set(source, translated);
}

const translations = {
  "OPTICANA | عيونك أحلى معانا": "OPTICANA | Your Eyes Look Better With Us",
  "عيونك أحلى معانا": "Your Eyes Look Better With Us",
  "ج.م": "EGP",
  "الرئيسية": "Home",
  "المنتجات": "Products",
  "العروض": "Offers",
  "من نحن": "About Us",
  "تواصل معنا": "Contact Us",
  "البحث": "Search",
  "المفضلة": "Favorites",
  "السلة": "Cart",
  "واتساب": "WhatsApp",
  "واتساب غير مضاف": "WhatsApp not configured",
  "فتح القائمة": "Open menu",
  "القائمة": "Menu",
  "إغلاق القائمة": "Close menu",
  "إغلاق": "Close",
  "جاري التحميل...": "Loading...",
  "جاري تحميل معلومات المتجر...": "Loading store information...",
  "جاري تحديث السلة...": "Updating cart...",
  "جاري إنشاء الطلب...": "Creating order...",
  "إتمام الطلب عبر واتساب": "Complete order via WhatsApp",
  "السلة فارغة": "Your cart is empty",
  "لم تقم بإضافة أي منتج بعد.": "You have not added any products yet.",
  "تصفح المنتجات": "Browse Products",
  "متابعة التسوق": "Continue Shopping",
  "منتج": "product",
  "منتجات": "products",
  "قطعة": "item",
  "قطع": "items",
  "غير متوفر حاليًا": "Currently unavailable",
  "المنتج غير متوفر حاليًا": "This product is currently unavailable",
  "المنتج لم يعد منشورًا": "The product is no longer published",
  "غير متوفر": "Unavailable",
  "متوفر": "Available",
  "أضف للسلة": "Add to cart",
  "تمت إضافة المنتج إلى السلة": "Product added to cart",
  "تمت إزالة المنتج من المفضلة": "Product removed from favorites",
  "تمت إضافة المنتج إلى المفضلة": "Product added to favorites",
  "إزالة من المفضلة": "Remove from favorites",
  "إضافة إلى المفضلة": "Add to favorites",
  "لا توجد منتجات مفضلة": "No favorite products",
  "أضف المنتجات التي تعجبك إلى المفضلة لتجدها هنا.": "Add products you like to your favorites to find them here.",
  "لم تتم الإضافة بعد": "Not added yet",
  "لا توجد منتجات مطابقة": "No matching products",
  "جرّب تغيير الفلاتر أو اختيار تصنيف آخر.": "Try changing the filters or choosing another category.",
  "جميع المنتجات": "All Products",
  "تصفح المنتجات المنشورة والمتاحة من OPTICANA.": "Browse published products available from OPTICANA.",
  "فلترة المنتجات": "Filter Products",
  "الكل": "All",
  "الفئة": "Category",
  "اللون": "Color",
  "الخامة": "Material",
  "المقاس": "Size",
  "السعر من": "Price from",
  "السعر إلى": "Price to",
  "نتائج:": "Results:",
  "عروض OPTICANA": "OPTICANA Offers",
  "عروض المتجر": "Store Offers",
  "منتج عليه خصم حاليًا": "Products currently on sale",
  "اكتشف المنتجات التي عليها خصومات حاليًا.": "Discover products currently on sale.",
  "جاري تحميل العروض...": "Loading offers...",
  "لا توجد عروض حاليًا": "No current offers",
  "ستظهر هنا المنتجات التي يفعّل لها Store Management خيار العرض ويحدد لها سعرًا قديمًا وسعرًا حاليًا.": "Products marked as offers in Store Management with an original and current price will appear here.",
  "البيانات محدثة من إدارة المتجر": "Data is updated from Store Management",
  "تصفح المجموعة الكاملة من المنتجات المنشورة في المتجر.": "Browse the full collection of products published in the store.",
  "عن OPTICANA": "About OPTICANA",
  "نقدم في OPTICANA تجربة تجمع بين الأناقة والجودة والاهتمام بتفاصيل العميل.": "At OPTICANA, we provide an experience that combines style, quality, and attention to every customer detail.",
  "لم تتم إضافة رؤية المتجر بعد.": "The store vision has not been added yet.",
  "لم تتم إضافة رسالة المتجر بعد.": "The store mission has not been added yet.",
  "جودة موثوقة": "Trusted Quality",
  "نختار المنتجات بعناية ونركز على الجودة في كل تفصيل.": "We carefully select our products and focus on quality in every detail.",
  "خدمة مميزة": "Premium Service",
  "نهتم بسرعة الاستجابة ووضوح المعلومات قبل الشراء وبعده.": "We care about fast responses and clear information before and after purchase.",
  "تنوع المنتجات": "Product Variety",
  "نوفر خيارات متنوعة تساعدك على الوصول لما يناسب احتياجك.": "We offer a variety of options to help you find what fits your needs.",
  "دعم مستمر": "Ongoing Support",
  "نقدم مساعدة واضحة واحترافية عندما تحتاجها.": "We provide clear, professional assistance whenever you need it.",
  "بيانات غير متاحة بعد": "Data not available yet",
  "رؤيتنا": "Our Vision",
  "إلى أين نتجه؟": "Where are we heading?",
  "رسالتنا": "Our Mission",
  "ماذا نقدم؟": "What do we offer?",
  "لماذا نحن؟": "Why Choose Us?",
  "ما الذي يميز": "What makes us different",
  "هذه المزايا يتم التحكم بها بالكامل من إدارة المتجر.": "These features are fully managed from Store Management.",
  "OPTICANA بالأرقام": "OPTICANA by the Numbers",
  "إحصائيات المتجر قابلة للتحديث من إدارة المتجر.": "Store statistics can be updated from Store Management.",
  "تسوق الآن": "Shop Now",
  "ميزة جديدة": "New Feature",
  "يمكن إضافة وصف هذه الميزة من إدارة المتجر.": "A description for this feature can be added from Store Management.",
  "اختياراتك": "Your Choices",
  "تسوق حسب الفئة": "Shop by Category",
  "اختيارات OPTICANA": "OPTICANA Picks",
  "عرض كل المنتجات": "View All Products",
  "وصل حديثًا": "Just Arrived",
  "أحدث المنتجات": "Latest Products",
  "منتجات جديدة منشورة من إدارة المتجر.": "New products published from Store Management.",
  "عرض الكل": "View All",
  "عروض مميزة": "Featured Offers",
  "تجارب العملاء": "Customer Experiences",
  "آراء عملائنا": "Customer Reviews",
  "تجارب حقيقية من عملاء OPTICANA.": "Real experiences from OPTICANA customers.",
  "تجربة مميزة مع OPTICANA.": "A great experience with OPTICANA.",
  "عميل OPTICANA": "OPTICANA Customer",
  "كن أول من يشاركنا تجربته": "Be the first to share your experience",
  "ستظهر تقييمات العملاء المعتمدة هنا بعد مراجعتها من فريق OPTICANA.": "Approved customer reviews will appear here after review by the OPTICANA team.",
  "الفئات السابقة": "Previous categories",
  "الفئات التالية": "Next categories",
  "الأسئلة الشائعة": "Frequently Asked Questions",
  "إجابات سريعة عن أكثر الأسئلة شيوعًا.": "Quick answers to the most common questions.",
  "تعذر تحميل محتوى المتجر": "Unable to load store content",
  "تعذر تحميل الصفحة الرئيسية": "Unable to load the home page",
  "حاول تحديث الصفحة مرة أخرى.": "Please refresh the page and try again.",
  "لماذا OPTICANA؟": "Why OPTICANA?",
  "جاهز تختار نظارتك الجديدة؟": "Ready to choose your new glasses?",
  "اكتشف تشكيلتنا وتسوق الآن.": "Discover our collection and shop now.",
  "هذا المنتج غير متوفر حاليًا": "This product is currently unavailable",
  "الصورة السابقة": "Previous image",
  "الصورة التالية": "Next image",
  "لا توجد مراجعات": "No reviews",
  "لا يوجد وصف إضافي لهذا المنتج.": "No additional description is available for this product.",
  "سيظهر التوفر من إدارة المتجر عند تحديث المخزون.": "Availability will appear when inventory is updated from Store Management.",
  "منتج منشور": "Published product",
  "من إدارة المتجر": "From the Store management",
  "مخزون مباشر": "Live inventory",
  "حسب المتوفر": "Based on availability",
  "سعر القطعة": "Unit price",
  "إجمالي الكمية": "Total quantity",
  "خصم": "Discount",
  "على السعر الأصلي": "off the original price",
  "رقم المنتج": "Product number",
  "المخزون": "Inventory",
  "بدون تصنيف": "Uncategorized",
  "بدون تقييم": "No rating",
  "آراء العملاء": "Customer Reviews",
  "تقييمات هذا المنتج": "Reviews for this product",
  "تجربة رائعة.": "Great experience.",
  "لا توجد مراجعات معتمدة بعد": "No approved reviews yet",
  "ستظهر هنا تقييمات العملاء بعد مراجعتها واعتمادها من إدارة المتجر.": "Customer reviews will appear here after they are reviewed and approved from Store Management.",
  "قد يعجبك أيضًا": "You may also like",
  "منتجات مشابهة": "Similar Products",
  "يسعدنا استقبال استفساراتك ومساعدتك في اختيار ما يناسبك.": "We are happy to answer your questions and help you choose what suits you.",
  "الهاتف": "Phone",
  "تواصل معنا مباشرة": "Contact us directly",
  "البريد الإلكتروني": "Email",
  "ساعات العمل": "Working Hours",
  "موقع OPTICANA": "OPTICANA Location",
  "موقع": "Location",
  "لم تتم إضافة رابط الخريطة بعد.": "A map link has not been added yet.",
  "يمكن إضافته من إدارة المتجر.": "It can be added from Store Management.",
  "تابعنا": "Follow Us",
  "ابقَ قريبًا من": "Stay connected with",
  "جميع روابط التواصل الاجتماعي يتم التحكم بها من إدارة المتجر.": "All social links are managed from Store Management.",
  "هل لديك استفسار؟": "Have a question?",
  "تواصل معنا أو تصفح منتجاتنا واكتشف المجموعة المتاحة.": "Contact us or browse our products and discover the available collection.",
  "تواصل عبر واتساب": "Contact via WhatsApp",
  "المتجر تحت الصيانة": "Store Under Maintenance",
  "نعمل حاليًا على تحسين تجربة OPTICANA. سنعود إليك قريبًا.": "We are currently improving the OPTICANA experience. We will be back soon.",
  "نعمل حاليًا على تطوير المتجر. سنعود قريبًا.": "We are currently improving the store. We will be back soon.",
  "تعذر تحميل التصنيفات": "Unable to load categories",
  "تعذر تحميل المنتجات حاليًا.": "Unable to load products right now.",
  "تعذر تحميل المنتجات": "Unable to load products",
  "اختر تقييمك بالنجوم أولًا": "Please choose a star rating first",
  "تم حفظ تقييمك وإرساله للمراجعة": "Your review was saved and sent for review",
  "تعذر إرسال التقييم حاليًا": "Unable to submit the review right now",
  "تقييم المنتج": "Product rating",
  "اكتب ملاحظتك عن المنتج...": "Write your feedback about the product...",
  "إلغاء": "Cancel",
  "إرسال التقييم": "Submit Review",
  "البحث في OPTICANA": "Search OPTICANA",
  "ابحث عن منتجك": "Search for your product",
  "البحث يعمل مباشرة على المنتجات المنشورة من إدارة المتجر.": "Search works directly on products published from Store Management.",
  "اكتب اسم المنتج أو SKU أو الفئة...": "Enter a product name, SKU, or category...",
  "لا توجد نتائج": "No results",
  "جرّب اسمًا أو رقمًا أو فئة مختلفة.": "Try a different name, number, or category.",
  "ابدأ بالبحث أو استخدم الفلاتر": "Start searching or use the filters",
  "جميع الخيارات مأخوذة من منتجات Store management.": "All options come from Store products.",
  "إعادة تعيين": "Reset",
  "عرض المنتجات": "View Products",
  "روابط سريعة": "Quick Links",
  "رابط": "Link",
  "العنوان": "Address",
  "تواصل سريع": "Quick Contact",
  "للاستفسارات أو طلب المنتجات مباشرة، يمكنك التواصل معنا عبر واتساب.": "For questions or direct product orders, you can contact us via WhatsApp.",
  "جميع الحقوق محفوظة.": "All rights reserved.",
  "تعذر تحميل بيانات المتجر": "Failed to load store data",
  "فشل تحميل بيانات المتجر": "Failed to load store data",
  "اكتب اسمك لإتمام الطلب:": "Enter your name to complete the order:",
  "اكتب رقم الهاتف للتواصل:": "Enter your phone number for contact:",
  "تعذر إنشاء الطلب": "Unable to create order",
  "تعذر تنفيذ العملية": "Unable to complete the operation",
  "طلبات كثيرة، حاول بعد قليل": "Too many requests. Please try again shortly.",
  "زائر المتجر": "Store Visitor",
  "تعذر إنشاء الطلب، حاول مرة أخرى": "Unable to create the order. Please try again.",
  "تم حذف المنتج من السلة": "Product removed from cart",
  "راجع المنتجات غير المتاحة أولًا": "Review unavailable products first",
  "لا توجد منتجات متاحة للطلب": "No products are available to order",
  "واتساب غير مضاف في إعدادات المتجر": "WhatsApp is not configured in store settings",
  "احذف المنتجات غير المتاحة أو عدّل الكمية قبل إتمام الطلب.": "Remove unavailable products or adjust the quantity before completing the order.",
  "أضف رقم واتساب من إعدادات المتجر لتفعيل الطلب.": "Add a WhatsApp number in store settings to enable ordering.",
  "سيتم إرسال تفاصيل الطلب إلى واتساب لتأكيد التوفر والطلب.": "Order details will be sent to WhatsApp to confirm availability and the order.",
  "جاري تحميل المنتج...": "Loading product...",
  "غير مضاف": "Not configured",
  "متوفر في المخزون": "In stock",
  "تعرف علينا": "Learn About Us",
  "اكتشف تشكيلتنا المميزة من النظارات والعدسات بتصاميم تجمع بين الأناقة والجودة.": "Discover our premium collection of glasses and lenses, designed to combine style and quality.",
  "اختر الفئة التي تناسب احتياجك.": "Choose the category that fits your needs.",
  "منتجاتنا المميزة": "Featured Products",
  "اختيارات مميزة من أحدث منتجات OPTICANA.": "A curated selection of the latest OPTICANA products.",
  "نهتم بكل تفاصيل تجربة العميل.": "We care about every detail of your customer experience.",
  "اكتشف أحدث العروض والخصومات.": "Discover the latest offers and discounts.",
  "أضف صورة قسم \"من نحن\" من إدارة المتجر": "Add an image for the \"About Us\" section from Store Management",
  "إجمالي المنتج": "Product total",
  "اخترت": "You selected",
  "اطلب عبر واتساب": "Order via WhatsApp",
  "اكتشف": "Discover",
  "اكتشف منتجاتنا": "Discover Our Products",
  "الإجمالي": "Total",
  "الإجمالي محسوب للمنتجات المتاحة فقط.": "The total is calculated for available products only.",
  "الصفحة غير موجودة": "Page Not Found",
  "الصورة الرئيسية ستضاف من CMS": "The main image will be added from the CMS",
  "العودة للمنتجات": "Back to Products",
  "القطع المتاحة": "Available items",
  "الكمية": "Quantity",
  "المفضلة تعرض فقط المنتجات الموجودة حاليًا في بيانات المتجر القادمة من إدارة المتجر.": "Favorites only show products currently available in the store data from Store Management.",
  "المنتج غير موجود": "Product Not Found",
  "المنتجات المفضلة": "Favorite Products",
  "النتائج:": "Results:",
  "بعض المنتجات تحتاج مراجعة": "Some products need attention",
  "بعض المنتجات لم تعد متاحة أو تغير مخزونها في إدارة المتجر. احذفها أو عدّل الكمية قبل إتمام الطلب.": "Some products are no longer available or their stock changed in the Store management. Remove them or adjust the quantity before completing the order.",
  "تحديث الصفحة": "Refresh Page",
  "تصفح الفئة": "Browse Category",
  "تم العثور على": "Found",
  "تم تحديث أسعار بعض المنتجات حسب الأسعار الحالية في المتجر.": "Some product prices were updated to the current store prices.",
  "جاري تحميل المنتجات...": "Loading products...",
  "جديد": "New",
  "سلة التسوق": "Shopping Cart",
  "عدد القطع": "Total items",
  "عدد المنتجات": "Number of products",
  "عن المنتج": "About the Product",
  "عنوان المحل": "Store Address",
  "فقط": "Only",
  "قد يكون المنتج غير منشور أو تم حذفه من إدارة المتجر.": "The product may be unpublished or removed from Store Management.",
  "قطعة في السلة": "items in your cart",
  "كل المنتجات": "All Products",
  "لديك": "You have",
  "ما لقيت اللي تدور عليه?": "Didn't find what you're looking for?",
  "ما لقيت اللي تدور عليه؟": "Didn't find what you're looking for?",
  "متبقي": "left",
  "ملخص الطلب": "Order Summary",
  "مميز": "Featured",
  "من 5": "out of 5",
  "منتج في المفضلة": "product in favorites",
  "مواصفات المنتج": "Product Specifications",
  "يبدو أن الرابط الذي وصلت إليه غير موجود أو تم نقل الصفحة من مكانها.": "The link you reached does not exist or the page has been moved.",
  "السعر:": "Price:",
  "الفئة:": "Category:",
  "الاسم:": "Name:",
  "سعر القطعة:": "Unit price:",
  "الإجمالي:": "Total:",
  "عدد القطع:": "Total items:",

  "العربية": "Arabic",
  "تم نسخ رابط المنتج": "Product link copied",
  "تعذر مشاركة المنتج": "Unable to share the product",
  "مشاركة المنتج": "Share Product",
  "التبديل إلى العربية": "Switch to Arabic",
  "كلمة المرور": "Password",
  "تم تسجيل الدخول بنجاح": "Signed in successfully",
  "تم إخفاء المنتج من المتجر": "Product hidden from the store",
  "إدارة المتجر": "Store Management",
  "طريقة أسهل لإدارة المنتجات": "A simpler way to manage products",
  "أضف المنتج وانشره": "Add a product and publish it",
  "في دقائق.": "in minutes.",
  "أداة خفيفة داخل موقع OPTICANA نفسه، بدون لوحة إدارة منفصلة.": "A lightweight tool inside the OPTICANA website itself, with no separate admin dashboard.",
  "وصول محمي بصلاحيات الإدارة": "Protected admin access",
  "مساحة خاصة": "Private area",
  "إدارة المنتجات": "Product Management",
  "سجل الدخول لإضافة المنتجات وتعديلها ونشرها على المتجر.": "Sign in to add, edit, and publish products to the store.",
  "دخول آمن": "Secure sign in",
  "العودة للمتجر": "Back to Store",
  "مساحتك السريعة": "Your quick workspace",
  "منتجات المتجر": "Store Products",
  "أضف، عدّل، وانشر منتجاتك من نفس الموقع.": "Add, edit, and publish products from the same website.",
  "إضافة منتج": "Add Product",
  "تعديل المنتج": "Edit Product",
  "منتج جديد": "New Product",
  "أضف منتجًا للمتجر": "Add a product to the store",
  "اسم المنتج": "Product Name",
  "مثال: نظارة شمسية كلاسيكية": "Example: Classic Sunglasses",
  "السعر": "Price",
  "السعر القديم": "Original Price",
  "سعر التكلفة": "Cost Price",
  "اختياري": "Optional",
  "المخزون الابتدائي": "Initial Stock",
  "مثال: 52-18-140": "Example: 52-18-140",
  "الوصف": "Description",
  "اكتب وصفًا قصيرًا وواضحًا للمنتج...": "Write a short, clear product description...",
  "نشر المنتج": "Publish Product",
  "سيظهر مباشرة للزوار": "It will appear to visitors immediately",
  "منتج جديد": "New Product",
  "إظهار شارة جديد": "Show the New badge",
  "مميز": "Featured",
  "إظهاره في الاختيارات المميزة": "Show it in featured picks",
  "عرض": "Sale",
  "استخدمه مع السعر القديم": "Use it with the original price",
  "صورة المنتج": "Product Image",
  "تغيير الصورة": "Change image",
  "ارفع صورة": "Upload an image",
  "JPG أو PNG حتى 8MB": "JPG or PNG up to 8MB",
  "الصورة تُحفظ مع المنتج تلقائيًا، ولا تحتاج لوحة وسائط منفصلة.": "The image is saved with the product automatically. No separate media panel is needed.",
  "حفظ التعديلات": "Save Changes",
  "حفظ ونشر": "Save & Publish",
  "جاري الحفظ...": "Saving...",
  "ابحث بالاسم أو SKU...": "Search by name or SKU...",
  "منشور": "Published",
  "مسودة": "Draft",
  "تعديل": "Edit",
  "إخفاء المنتج": "Hide product",
  "إخفاء المنتج من المتجر": "Hide product from store",
  "تم إخفاء المنتج من المتجر": "Product hidden from the store",
  "تم تحديث المنتج بنجاح": "Product updated successfully",
  "تمت إضافة المنتج بنجاح": "Product added successfully",
  "تعذر حفظ المنتج": "Unable to save the product",
  "اكتب اسم المنتج.": "Enter a product name.",
  "أدخل سعرًا صحيحًا.": "Enter a valid price.",
  "اختر صورة صالحة.": "Choose a valid image.",
  "حجم الصورة يجب أن يكون أقل من 8MB.": "Image size must be under 8MB.",
  "تعذر قراءة الصورة.": "Unable to read the image.",
  "انتهت جلسة الإدارة. سجل الدخول مرة أخرى.": "Your admin session expired. Please sign in again.",
  "بيانات الدخول غير صحيحة.": "The login details are incorrect.",
  "عرض المتجر": "View Store",
  "خروج": "Sign out",
  "أضف أول منتج": "Add your first product",
  "لا توجد منتجات بعد": "No products yet",
  "ابدأ بإضافة أول منتج، وستظهره الأداة تلقائيًا في المتجر عند نشره.": "Add your first product and it will appear in the store automatically when published.",
  "إضافة أول منتج": "Add First Product",
  "JPG أو PNG حتى 8MB": "JPG or PNG up to 8MB",
  "هذا الحساب لا يملك صلاحية إدارة المنتجات.": "This account does not have permission to manage products.",
  "تعذر تحميل المنتجات": "Unable to load products",
  "تعذر تنفيذ العملية": "Unable to complete the operation",
  "سيظهر مباشرة للزوار": "It will appear to visitors immediately",
  "بدون تصنيف": "Uncategorized",
  "المخزون": "Inventory",
  "أضف رقم واتساب من إعدادات المتجر لتفعيل الطلب.": "Add a WhatsApp number in store settings to enable ordering.",
  "انتهت جلسة الإدارة. سجل الدخول مرة أخرى.": "Your admin session expired. Please sign in again.",
};

function replaceDynamic(value, language) {
  if (language === "ar" || !value) return value;

  const rules = [
    [/^تم تعديل كمية (.+) حسب المخزون المتاح$/, "Quantity for $1 was adjusted to available stock"],
    [/^تم إنشاء الطلب (.+)$/, "Order created: $1"],
    [/^تم حذف المنتج من السلة$/, "Product removed from cart"],
    [/^تمت إضافة (\d+) (قطعة|قطع) إلى السلة$/, (match, count) => `Added ${count} ${count === "1" ? "item" : "items"} to the cart`],
    [/^هل أنت متأكد من حذف "(.+)" من السلة؟$/, 'Are you sure you want to remove "$1" from the cart?'],
    [/^راجع المنتجات غير المتاحة أولًا$/, "Review unavailable products first"],
    [/^لا توجد منتجات متاحة للطلب$/, "No products are available to order"],
    [/^المتاح حاليًا (\d+) فقط$/, "Only $1 available"],
    [/^حذف (.+)$/, "Remove $1"],
    [/^تصفح جميع منتجات (.+)\.$/, "Browse all $1 products."],
    [/^عرض (.+)$/, "View $1"],
    [/^اختيار (\d+) نجوم$/, "Select $1 stars"],
    [/^(\d+) قطعة متاحة$/, "$1 items available"],
    [/^(\d+) قطعة$/, "$1 items"],
    [/^من (.+) ج\.م$/, "From $1 EGP"],
    [/^إلى (.+) ج\.م$/, "To $1 EGP"],
  ];

  for (const [pattern, replacement] of rules) {
    if (typeof replacement === "function") {
      if (pattern.test(value)) return value.replace(pattern, replacement);
    } else if (pattern.test(value)) {
      return value.replace(pattern, replacement);
    }
  }

  return value;
}

function translate(value, language) {
  if (!value || language === "ar") return value;

  const match = String(value).match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match) return value;

  const [, leading, core, trailing] = match;
  const normalizedCore = core.replace(/\s+/g, " ").trim();
  const translatedCore =
    Object.prototype.hasOwnProperty.call(translations, normalizedCore)
      ? translations[normalizedCore]
      : (catalogTranslations.get(normalizedCore) || replaceDynamic(normalizedCore, language));

  return leading + translatedCore + trailing;
}

function shouldSkip(node) {
  const parent = node.parentElement;
  if (!parent) return true;
  return ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"].includes(parent.tagName);
}

function createTranslator() {
  const textOriginals = new WeakMap();
  const attributeOriginals = new WeakMap();
  let language = "ar";
  let applying = false;

  const rememberTextNode = (node) => {
    if (!textOriginals.has(node)) {
      textOriginals.set(node, node.textContent);
    }
    return textOriginals.get(node);
  };

  const rememberAttribute = (element, attribute) => {
    let originals = attributeOriginals.get(element);
    if (!originals) {
      originals = {};
      attributeOriginals.set(element, originals);
    }
    if (!(attribute in originals)) {
      originals[attribute] = element.getAttribute(attribute);
    }
    return originals[attribute];
  };

  const synchronizeMutations = (records) => {
    if (applying) return;
    for (const record of records) {
      if (record.type === "characterData") {
        const node = record.target;
        const source = textOriginals.get(node);
        const current = node.textContent;
        if (source == null) {
          textOriginals.set(node, current);
          continue;
        }
        const translatedSource = translate(source, "en");
        if (language === "en" && current !== translatedSource) {
          textOriginals.set(node, current);
        } else if (language === "ar" && current !== source) {
          textOriginals.set(node, current);
        }
      }

      if (record.type === "attributes") {
        const element = record.target;
        const attribute = record.attributeName;
        if (!attribute) continue;
        const source = rememberAttribute(element, attribute);
        const current = element.getAttribute(attribute);
        const translatedSource = translate(source, "en");
        if (language === "en" && current !== translatedSource) {
          const originals = attributeOriginals.get(element);
          originals[attribute] = current;
        } else if (language === "ar" && current !== source) {
          const originals = attributeOriginals.get(element);
          originals[attribute] = current;
        }
      }
    }
  };

  const apply = () => {
    if (typeof document === "undefined" || !document.body) return;
    applying = true;
    try {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );
      let node;
      while ((node = walker.nextNode())) {
        if (shouldSkip(node)) continue;
        const source = rememberTextNode(node);
        const next = translate(source, language);
        if (node.textContent !== next) node.textContent = next;
      }

      const elements = document.querySelectorAll(
        "[aria-label], [title], [placeholder], meta[name=\"description\"], meta[name=\"keywords\"], meta[property=\"og:title\"], meta[property=\"og:description\"], meta[property=\"og:site_name\"], meta[property=\"og:image\"]"
      );
      for (const element of elements) {
        for (const attribute of ["aria-label", "title", "placeholder", "content"]) {
          if (!element.hasAttribute(attribute)) continue;
          const source = rememberAttribute(element, attribute);
          const next = translate(source, language);
          if (element.getAttribute(attribute) !== next) {
            element.setAttribute(attribute, next);
          }
        }
      }

      const title = document.querySelector("head > title");
      if (title && title.firstChild) {
        const source = rememberTextNode(title.firstChild);
        const next = translate(source, language);
        if (title.textContent !== next) title.textContent = next;
      }
    } finally {
      applying = false;
    }
  };

  const observer = new MutationObserver((records) => {
    synchronizeMutations(records);
    if (!applying) apply();
  });

  return {
    apply,
    observer,
    setLanguage(nextLanguage) {
      language = nextLanguage === "en" ? "en" : "ar";
      apply();
    },
  };
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === "undefined") return "ar";
    return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "ar";
  });
  const translatorRef = useRef(null);

  if (!translatorRef.current) {
    translatorRef.current = createTranslator();
  }

  const setLanguage = useCallback((nextLanguage) => {
    const next = nextLanguage === "en" ? "en" : "ar";
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "ar" ? "en" : "ar");
  }, [language, setLanguage]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    document.documentElement.lang = language;
    document.documentElement.dir = language === "en" ? "ltr" : "rtl";
    document.body.lang = language;

    const translator = translatorRef.current;
    translator.setLanguage(language);
    translator.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-label", "title", "placeholder", "content"],
    });

    return () => translator.observer.disconnect();
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      isEnglish: language === "en",
      t: (valueToTranslate) => translate(valueToTranslate, language),
    }),
    [language, setLanguage, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
