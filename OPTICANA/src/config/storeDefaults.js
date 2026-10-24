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
  // Each branch opens its own Google Maps place (ids from the shop's Linktree).
  branches: [
    { name: "عباس العقاد، مدينة نصر", nameEn: "Abbas El Akkad, Nasr City", mapUrl: "https://www.google.com/maps/place/Opticana+Optics/@30.0664373,31.335857,17z/data=!3m1!4b1!4m6!3m5!1s0x14583ffe07bf138f:0x6620681779079f23!8m2!3d30.0664373!4d31.335857" },
    { name: "إمبابة، الجيزة", nameEn: "Imbaba, Giza", mapUrl: "https://www.google.com/maps/place/Opticana+Optics/@30.0800702,31.2159139,17z/data=!3m1!4b1!4m6!3m5!1s0x1458410071656a75:0xf0417371afe32604!8m2!3d30.0800702!4d31.2159139" },
  ],
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
