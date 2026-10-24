/*
  Default store details, mirrored from the API
  (OPTICANA-BACKEND-STARTER/src/config/storeDefaults.js) so they also show
  when the API runs an older version that does not send them yet.

  They only fill fields that are missing (undefined/null). An empty string
  means a manager cleared the field on purpose, so it stays empty.
*/

export const BUSINESS_DEFAULTS = {
  phone: "+20 100 327 7700",
  whatsapp: "201003277700",
  address: "إمبابة، الجيزة • عباس العقاد، مدينة نصر",
  addressEn: "Imbaba, Giza • Abbas El Akkad, Nasr City",
  googleMaps: "https://www.google.com/maps?cid=7358996241147469603",
  instagram: "https://www.instagram.com/opticana_optics",
  tiktok: "https://www.tiktok.com/@opticana_optics",
  facebook: "https://www.facebook.com/Opticana.optics",
  linktree: "https://linktr.ee/opticanaoptics",
};

export const FOOTER_DEFAULTS = {
  description: "نظارات شمسية • إطارات طبية • عدسات لاصقة\n📍 إمبابة، الجيزة\n📍 عباس العقاد، مدينة نصر",
  descriptionEn: "Sunglasses • Optical Frames • Contact Lenses\n📍 Imbaba, Giza\n📍 Abbas El Akkad, Nasr City",
};

export function withDefaults(value, defaults) {
  const result = { ...(value && typeof value === "object" ? value : {}) };
  for (const [field, fallback] of Object.entries(defaults)) {
    if (result[field] === undefined || result[field] === null) result[field] = fallback;
  }
  return result;
}
