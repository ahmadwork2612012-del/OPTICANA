/*
  Default store information shown until a manager edits it from the
  dashboard. Defaults only fill fields that were never saved: once a manager
  saves a key, the server stamps it (DEFAULTS_SAVED_FLAG) and from then on a
  cleared field stays cleared.
*/

export const DEFAULTS_SAVED_FLAG = "_savedByManager";

export const SETTING_DEFAULTS = {
  business: {
    phone: "+20 100 327 7700",
    whatsapp: "201003277700",
    address: "إمبابة، الجيزة • عباس العقاد، مدينة نصر",
    addressEn: "Imbaba, Giza • Abbas El Akkad, Nasr City",
    // CID taken from the shop's Google Maps place link; works both as a
    // link and, with &output=embed, inside the contact page map.
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
  },
};

export const CONTENT_DEFAULTS = {
  footer: {
    description: "نظارات شمسية • إطارات طبية • عدسات لاصقة\n📍 إمبابة، الجيزة\n📍 عباس العقاد، مدينة نصر",
    descriptionEn: "Sunglasses • Optical Frames • Contact Lenses\n📍 Imbaba, Giza\n📍 Abbas El Akkad, Nasr City",
  },
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/*
  Before the first manager save, empty strings count as "not set" too, so
  values that were saved blank by the old dashboard still get the defaults.
*/
export function applyDefaults(value, defaults) {
  if (!defaults) return value;
  if (value !== undefined && value !== null && !isPlainObject(value)) return value;

  const current = isPlainObject(value) ? value : {};
  const saved = current[DEFAULTS_SAVED_FLAG] === true;
  const result = { ...current };

  for (const [field, fallback] of Object.entries(defaults)) {
    const existing = current[field];
    const missing = existing === undefined || existing === null || (!saved && existing === "");
    if (missing) result[field] = fallback;
  }

  delete result[DEFAULTS_SAVED_FLAG];
  return result;
}

export function withDefaults(rowsByKey, defaultsByKey) {
  const result = { ...rowsByKey };
  for (const [key, defaults] of Object.entries(defaultsByKey)) {
    result[key] = applyDefaults(rowsByKey[key], defaults);
  }
  return result;
}

export function markSavedByManager(key, value, defaultsByKey) {
  if (!defaultsByKey[key] || !isPlainObject(value)) return value;
  return { ...value, [DEFAULTS_SAVED_FLAG]: true };
}
