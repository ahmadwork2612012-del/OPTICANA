import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "../config/env.js";

export const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const ALLOWED_FOLDERS = new Set(["products", "categories", "store", "general"]);
const UPLOAD_URL_TTL_SECONDS = 5 * 60;

const r2PublicBase = String(env.R2_PUBLIC_BASE_URL || "").replace(/\/+$/, "");

export const isR2Enabled = Boolean(
  env.R2_ACCOUNT_ID &&
  env.R2_ACCESS_KEY_ID &&
  env.R2_SECRET_ACCESS_KEY &&
  env.R2_BUCKET &&
  r2PublicBase
);

let client = null;

function r2() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      forcePathStyle: true,
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}

function mediaError(message, statusCode, code) {
  return Object.assign(new Error(message), { statusCode, code });
}

export function assertImage(mimeType, size) {
  const mime = String(mimeType || "").toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(mime)) {
    throw mediaError("Unsupported image type", 400, "INVALID_MEDIA_TYPE");
  }
  const bytes = Number(size);
  if (!Number.isInteger(bytes) || bytes <= 0) {
    throw mediaError("Invalid image size", 400, "INVALID_MEDIA");
  }
  if (bytes > MAX_IMAGE_BYTES) {
    throw mediaError("Media file is too large", 413, "MEDIA_TOO_LARGE");
  }
  return mime;
}

function makeKey(folder, mime) {
  const safeFolder = ALLOWED_FOLDERS.has(folder) ? folder : "general";
  const ext = ALLOWED_IMAGE_TYPES.get(mime);
  return `${safeFolder}/${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
}

function localDir() {
  return path.resolve(env.MEDIA_STORAGE_DIR || path.join(process.cwd(), "uploads"));
}

function localBase() {
  return String(env.MEDIA_BASE_URL || "/uploads").replace(/\/+$/, "");
}

/*
  Direct browser -> R2 upload. The image never passes through the API, so the
  Vercel request body limit (4.5 MB) does not apply. ContentType and
  ContentLength are part of the signature, so the browser cannot upload a
  different type or a larger file than the one validated here.
*/
export async function createUploadUrl({ mimeType, size, folder }) {
  if (!isR2Enabled) {
    throw mediaError("Direct uploads require R2 storage to be configured", 503, "MEDIA_STORAGE_NOT_CONFIGURED");
  }
  const mime = assertImage(mimeType, size);
  const key = makeKey(String(folder || ""), mime);
  const uploadUrl = await getSignedUrl(
    r2(),
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      ContentType: mime,
      ContentLength: Number(size),
      CacheControl: "public, max-age=31536000, immutable",
    }),
    {
      expiresIn: UPLOAD_URL_TTL_SECONDS,
      signableHeaders: new Set(["content-type", "content-length"]),
    }
  );
  return {
    uploadUrl,
    publicUrl: `${r2PublicBase}/${key}`,
    headers: { "Content-Type": mime },
    expiresIn: UPLOAD_URL_TTL_SECONDS,
  };
}

export async function putObject(buffer, mimeType, folder = "general") {
  const mime = assertImage(mimeType, buffer.length);
  const key = makeKey(folder, mime);

  if (isR2Enabled) {
    await r2().send(new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mime,
      CacheControl: "public, max-age=31536000, immutable",
    }));
    return `${r2PublicBase}/${key}`;
  }

  const filename = path.basename(key);
  await fs.mkdir(localDir(), { recursive: true });
  await fs.writeFile(path.join(localDir(), filename), buffer);
  return `${localBase()}/${filename}`;
}

/*
  Only URLs that point at our own storage are deletable; anything else
  (external links, other domains) is ignored.
*/
export async function deleteObjectByUrl(url) {
  const value = String(url || "").trim();
  if (!value) return;

  try {
    if (r2PublicBase && value.startsWith(`${r2PublicBase}/`)) {
      if (!isR2Enabled) return;
      const key = decodeURIComponent(value.slice(r2PublicBase.length + 1));
      if (!key || key.includes("..")) return;
      await r2().send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
      return;
    }

    const pathname = value.startsWith("/") ? value : new URL(value).pathname;
    if (pathname.startsWith(`${localBase()}/`)) {
      await fs.unlink(path.join(localDir(), path.basename(pathname)));
    }
  } catch (error) {
    console.error("Failed to delete stored media:", value, error?.message);
  }
}

export async function deleteObjectsByUrl(urls) {
  await Promise.all([...new Set(urls)].map(deleteObjectByUrl));
}
