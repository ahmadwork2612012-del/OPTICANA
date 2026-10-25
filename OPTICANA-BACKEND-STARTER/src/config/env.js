import "dotenv/config";
import { z } from "zod";

// Values pasted into a hosting dashboard often keep the quotes from a .env
// line or a trailing space/newline. For keys used to sign requests (R2) one
// extra character breaks every signature, so strip them.
const pastedValue = z.preprocess(
  (value) =>
    typeof value === "string"
      ? value.trim().replace(/^(["'])(.*)\1$/s, "$2").trim()
      : value,
  z.string().optional()
);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  CORS_ORIGIN: z.string().default("http://localhost:5173,http://localhost:5174"),
  MEDIA_STORAGE_DIR: z.string().default("./uploads"),
  MEDIA_BASE_URL: z.string().default("/uploads"),
  // Cloudflare R2 (S3-compatible). When all are set, media is stored in R2
  // instead of the local disk, which is read-only on Vercel.
  R2_ACCOUNT_ID: pastedValue,
  R2_ACCESS_KEY_ID: pastedValue,
  R2_SECRET_ACCESS_KEY: pastedValue,
  R2_BUCKET: pastedValue,
  R2_PUBLIC_BASE_URL: pastedValue.refine(
    (value) => !value || /^https?:\/\/[^\s"']+$/.test(value),
    "R2_PUBLIC_BASE_URL must be a URL"
  ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
