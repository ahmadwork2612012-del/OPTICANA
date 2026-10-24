/*
  Default store information shown until a manager edits it from the
  dashboard. Defaults only fill fields that were never saved: once a manager
  saves a key, the server stamps it (DEFAULTS_SAVED_FLAG) and from then on a
  cleared field stays cleared.
*/

export const DEFAULTS_SAVED_FLAG = "_savedByManager";

export const SETTING_DEFAULTS = {
  business: {
    whatsapp: "201003277700",
    address: "Imbaba, Giza • Abbas El Akkad, Nasr City",
    // CID taken from the shop's Google Maps place link; works both as a
    // link and, with &output=embed, inside the contact page map.
    googleMaps: "https://www.google.com/maps?cid=7358996241147469603",
    instagram: "https://tr.ee/VpdkBQKL9p",
    tiktok: "https://tr.ee/caFEwUf98Q",
    facebook: "https://tr.ee/LNiuUtgm9_",
    linktree: "https://linktr.ee/opticanaoptics",
  },
};

export const CONTENT_DEFAULTS = {
  footer: {
    description: "Sunglasses • Optical Frames • Contact Lenses\n📍 Imbaba, Giza\n📍 Abbas El Akkad, Nasr City",
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
