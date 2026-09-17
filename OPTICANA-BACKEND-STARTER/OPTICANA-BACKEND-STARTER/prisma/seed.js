import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";

const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || "");
const name = String(process.env.ADMIN_NAME || "OPTICANA Admin").trim();

if (!email || !password) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required for a production-safe seed.");
}
if (password.length < 8) {
  throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
}

const passwordHash = await bcrypt.hash(password, 12);

await prisma.user.upsert({
  where: { email },
  update: { name, passwordHash, role: "SUPER_ADMIN", isActive: true },
  create: { name, email, passwordHash, role: "SUPER_ADMIN", isActive: true },
});

const settings = {
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
  general: { language: "ar", direction: "rtl", dateFormat: "DD/MM/YYYY", timeFormat: "12", weekStartsOn: "saturday" },
  appearance: { theme: "light", accentColor: "blue", compactMode: false, animations: true },
  store: { enabled: true, maintenanceMode: false, showPrices: true, allowGuestCheckout: true, requirePhone: true, allowReviews: true, allowFavorites: true },
};

for (const [key, valueJson] of Object.entries(settings)) {
  await prisma.storeSetting.upsert({ where: { key }, update: { valueJson }, create: { key, valueJson } });
}

const content = {
  home: {
    hero: { enabled: true, title: "عيونك أحلى معانا", subtitle: "اكتشف تشكيلتنا من النظارات والعدسات.", image: null, primaryButton: { enabled: true, text: "تسوق الآن", link: "/products" }, secondaryButton: { enabled: false, text: "", link: "/about" } },
    announcement: { enabled: false, text: "", link: "/products" },
  },
  about: { enabled: true, title: "من نحن", description: "متجر OPTICANA للنظارات والعدسات.", image: null },
  contact: { enabled: true, title: "تواصل معنا" },
  faq: { enabled: true, title: "الأسئلة الشائعة", items: [] },
  footer: { enabled: true, copyright: "© OPTICANA. جميع الحقوق محفوظة." },
  maintenance: { enabled: false, title: "المتجر تحت الصيانة", message: "سنعود قريبًا." },
};

for (const [key, valueJson] of Object.entries(content)) {
  await prisma.storeContent.upsert({ where: { key }, update: { valueJson }, create: { key, valueJson } });
}

console.log(`Seeded admin account ${email} and baseline OPTICANA settings/content.`);
