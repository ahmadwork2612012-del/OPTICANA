import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import {
  DeleteObjectCommand,
  GetObjectCommand,
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
      // Newer SDKs add a default CRC32 checksum (of an empty body) to
      // presigned uploads; R2 does not need it, so only send checksums when
      // an operation requires them.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
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

/*
  The declared type comes from the browser and can be anything, so the file's
  own leading bytes ("magic numbers") decide what it really is.
*/
export function detectImageType(bytes) {
  const b = Buffer.from(bytes || []);
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.length >= 6 && ["GIF87a", "GIF89a"].includes(b.subarray(0, 6).toString("latin1"))) return "image/gif";
  if (b.length >= 12 && b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  return null;
}

function assertContentMatches(bytes, declaredMime) {
  const actual = detectImageType(bytes);
  const declared = declaredMime === "image/jpg" ? "image/jpeg" : declaredMime;
  if (!actual || (declared && actual !== declared)) {
    throw mediaError("The file is not a valid image", 400, "INVALID_MEDIA_CONTENT");
  }
  return actual;
}

const verifiedUploads = new Set();

/*
  Direct browser uploads never pass through the API, so their content is
  checked when a URL is first saved on a product/category/setting: read the
  first bytes from R2 and delete the object if it is not a real image.
  Non-R2 URLs (external links, legacy /uploads) are left as they are.
*/
export async function verifyStoredImage(url) {
  const value = String(url || "").trim();
  if (!isR2Enabled || !value.startsWith(`${r2PublicBase}/`) || verifiedUploads.has(value)) return;

  const key = decodeURIComponent(value.slice(r2PublicBase.length + 1));
  let head;
  try {
    const object = await r2().send(new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: key, Range: "bytes=0-15" }));
    head = Buffer.from(await object.Body.transformToByteArray());
  } catch (error) {
    if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404) {
      throw mediaError("Uploaded image was not found", 400, "MEDIA_NOT_FOUND");
    }
    throw error;
  }

  if (!detectImageType(head)) {
    await deleteObjectByUrl(value);
    throw mediaError("The file is not a valid image", 400, "INVALID_MEDIA_CONTENT");
  }

  verifiedUploads.add(value);
  if (verifiedUploads.size > 5000) verifiedUploads.clear();
}

export async function putObject(buffer, mimeType, folder = "general") {
  assertImage(mimeType, buffer.length);
  const mime = assertContentMatches(buffer, String(mimeType).toLowerCase());
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
