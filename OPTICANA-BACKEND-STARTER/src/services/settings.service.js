import prisma from "../lib/prisma.js";
import { persistNestedMedia } from "./media.service.js";
import {
  CONTENT_DEFAULTS,
  SETTING_DEFAULTS,
  applyDefaults,
  markSavedByManager,
  withDefaults,
} from "../config/storeDefaults.js";


/* =====================================
   PUBLIC KEYS
===================================== */

const PUBLIC_SETTING_KEYS = new Set([
  "business",
  "general",
  "appearance",
  "store",
  "seo",
]);

const PUBLIC_CONTENT_KEYS = new Set([
  "home",
  "about",
  "contact",
  "faq",
  "footer",
  "maintenance",
  "seo",
  "banners",
]);


/* =====================================
   STORE SETTINGS
===================================== */

export async function getAllSettings() {
  const rows =
    await prisma.storeSetting.findMany({
      orderBy: {
        key: "asc",
      },
    });

  const settings = {};

  for (const row of rows) {
    settings[row.key] =
      row.valueJson;
  }

  return withDefaults(settings, SETTING_DEFAULTS);
}


export async function getPublicSettings() {
  const rows =
    await prisma.storeSetting.findMany({
      where: {
        key: {
          in:
            Array.from(
              PUBLIC_SETTING_KEYS
            ),
        },
      },

      orderBy: {
        key: "asc",
      },
    });

  const settings = {};

  for (const row of rows) {
    let value = row.valueJson;

    if (
      row.key === "business" &&
      value &&
      typeof value === "object"
    ) {
      const { taxNumber, ...publicBusiness } = value;
      value = publicBusiness;
    }

    settings[row.key] =
      value;
  }

  return withDefaults(settings, SETTING_DEFAULTS);
}


export async function upsertSetting(
  key,
  value
) {
  const normalizedKey =
    String(
      key || ""
    ).trim();

  if (!normalizedKey) {
    const error =
      new Error(
        "Setting key is required"
      );

    error.statusCode = 400;
    error.code =
      "INVALID_SETTING_KEY";

    throw error;
  }

  if (
    normalizedKey.length >
    100
  ) {
    const error =
      new Error(
        "Setting key is too long"
      );

    error.statusCode = 400;
    error.code =
      "INVALID_SETTING_KEY";

    throw error;
  }

  const safeValue = markSavedByManager(normalizedKey, await persistNestedMedia(value), SETTING_DEFAULTS);

  const row =
    await prisma.storeSetting.upsert({
      where: {
        key:
          normalizedKey,
      },

      update: {
        valueJson:
          safeValue,
      },

      create: {
        key:
          normalizedKey,

        valueJson:
          safeValue,
      },
    });

  return {
    key:
      row.key,

    value:
      applyDefaults(row.valueJson, SETTING_DEFAULTS[row.key]),
  };
}


/* =====================================
   STORE CONTENT
===================================== */

export async function getAllContent() {
  const rows =
    await prisma.storeContent.findMany({
      orderBy: {
        key: "asc",
      },
    });

  const content = {};

  for (const row of rows) {
    content[row.key] =
      row.valueJson;
  }

  return withDefaults(content, CONTENT_DEFAULTS);
}


export async function getPublicContent() {
  const publicKeys =
    Array.from(
      PUBLIC_CONTENT_KEYS
    );

  if (
    publicKeys.length ===
    0
  ) {
    return {};
  }

  const rows =
    await prisma.storeContent.findMany({
      where: {
        key: {
          in:
            publicKeys,
        },
      },

      orderBy: {
        key: "asc",
      },
    });

  const content = {};

  for (const row of rows) {
    content[row.key] =
      row.valueJson;
  }

  return withDefaults(content, CONTENT_DEFAULTS);
}


export async function upsertContent(
  key,
  value
) {
  const normalizedKey =
    String(
      key || ""
    ).trim();

  if (!normalizedKey) {
    const error =
      new Error(
        "Content key is required"
      );

    error.statusCode = 400;
    error.code =
      "INVALID_CONTENT_KEY";

    throw error;
  }

  if (
    normalizedKey.length >
    100
  ) {
    const error =
      new Error(
        "Content key is too long"
      );

    error.statusCode = 400;
    error.code =
      "INVALID_CONTENT_KEY";

    throw error;
  }

  const safeValue = markSavedByManager(normalizedKey, await persistNestedMedia(value), CONTENT_DEFAULTS);

  const row =
    await prisma.storeContent.upsert({
      where: {
        key:
          normalizedKey,
      },

      update: {
        valueJson:
          safeValue,
      },

      create: {
        key:
          normalizedKey,

        valueJson:
          safeValue,
      },
    });

  return {
    key:
      row.key,

    value:
      applyDefaults(row.valueJson, CONTENT_DEFAULTS[row.key]),
  };
}