import assert from "node:assert/strict";
import test from "node:test";

import { comparePassword, hashPassword } from "../src/utils/password.js";
import { createOrderSchema } from "../src/validators/order.validator.js";
import { createProductSchema } from "../src/validators/product.validator.js";
import { assertRoleAssignment } from "../src/services/auth.service.js";
import { changeStock } from "../src/services/inventory.service.js";
import { rateLimit } from "../src/middleware/rateLimit.js";
import { getClientIp } from "../src/utils/clientIp.js";
import { submitReviewSchema } from "../src/validators/review.validator.js";
import { applyDefaults, markSavedByManager } from "../src/config/storeDefaults.js";
import { assertStrongPassword } from "../src/utils/passwordPolicy.js";
import { detectImageType } from "../src/services/storage.service.js";
import { readSessionCookie } from "../src/utils/sessionCookie.js";

test("authentication passwords are salted and verify only their original value", async () => {
  const hash = await hashPassword("A-strong-password-2026");
  assert.notEqual(hash, "A-strong-password-2026");
  assert.equal(await comparePassword("A-strong-password-2026", hash), true);
  assert.equal(await comparePassword("incorrect-password", hash), false);
});

test("role escalation is reserved for SUPER_ADMIN", () => {
  assert.equal(assertRoleAssignment("ADMIN", "STAFF"), "STAFF");
  assert.throws(() => assertRoleAssignment("ADMIN", "ADMIN"), { code: "SUPER_ADMIN_REQUIRED" });
  assert.equal(assertRoleAssignment("SUPER_ADMIN", "ADMIN"), "ADMIN");
});

test("product and order validators reject unsafe inventory inputs", () => {
  assert.equal(createProductSchema.safeParse({ sku: "A-1", name: "Frame", slug: "frame", price: 100, initialStock: -1 }).success, false);
  assert.equal(createProductSchema.safeParse({ sku: "A-1", name: "Frame", slug: "frame", price: 100, images: [{ url: "javascript:alert(1)" }] }).success, false);
  assert.equal(createOrderSchema.safeParse({ items: [{ productId: "p1", quantity: 0 }] }).success, false);
  assert.equal(createOrderSchema.safeParse({ customer: { name: "Customer", phone: "01000000000" }, items: [{ productId: "p1", quantity: 1 }], discount: 0 }).success, true);
});

function inventoryTx(stock) {
  const product = { id: "p1", name: "Frame", stock, reorderLevel: 1 };
  const movements = [];
  return {
    product: {
      findUnique: async () => ({ ...product }),
      updateMany: async ({ where, data }) => {
        if (product.stock < where.stock.gte) return { count: 0 };
        product.stock -= data.stock.decrement;
        return { count: 1 };
      },
      update: async ({ data }) => {
        product.stock += data.stock.increment;
        return { ...product };
      },
    },
    inventoryMovement: { create: async ({ data }) => { movements.push(data); return { id: String(movements.length), ...data, product: { name: product.name, sku: "A-1" } }; } },
    notification: { create: async () => ({}) },
    currentStock: () => product.stock,
    movements,
  };
}

test("inventory decrement is atomic and cannot oversell", async () => {
  const tx = inventoryTx(2);
  await changeStock({ tx, productId: "p1", quantity: -2, type: "SALE" });
  assert.equal(tx.currentStock(), 0);
  await assert.rejects(
    () => changeStock({ tx, productId: "p1", quantity: -1, type: "SALE" }),
    { code: "INSUFFICIENT_STOCK" },
  );
  assert.equal(tx.currentStock(), 0);
  assert.equal(tx.movements.length, 1);
});

test("rate limit rejects excessive requests from the same client", () => {
  const middleware = rateLimit({ windowMs: 60_000, max: 1 });
  const req = { ip: "test-rate-limit", baseUrl: "/api/auth", path: "/login" };
  let nextCalls = 0;
  const next = () => { nextCalls += 1; };
  const res = { set: () => res, status: () => res, json: (body) => { res.body = body; return res; } };
  middleware(req, res, next);
  middleware(req, res, next);
  assert.equal(nextCalls, 1);
  assert.equal(res.body.error.code, "RATE_LIMITED");
});

test("client IP trusts CF-Connecting-IP only from Cloudflare addresses", () => {
  const fromCloudflare = { headers: { "cf-connecting-ip": "203.0.113.7" }, socket: { remoteAddress: "::ffff:172.70.1.1" } };
  assert.equal(getClientIp(fromCloudflare), "203.0.113.7");

  const spoofed = { headers: { "cf-connecting-ip": "203.0.113.7" }, socket: { remoteAddress: "198.51.100.9" } };
  assert.equal(getClientIp(spoofed), "198.51.100.9");
});

test("login attempts are also limited per account across IPs", () => {
  const middleware = rateLimit({ windowMs: 60_000, max: 2, keyBy: (req) => req.body.email });
  let nextCalls = 0;
  const next = () => { nextCalls += 1; };
  const res = { set: () => res, status: () => res, json: (body) => { res.body = body; return res; } };
  for (const ip of ["198.51.100.1", "198.51.100.2", "198.51.100.3"]) {
    middleware({ headers: {}, socket: { remoteAddress: ip }, body: { email: "admin@test" }, baseUrl: "/api/auth", path: "/login-per-account" }, res, next);
  }
  assert.equal(nextCalls, 2);
  assert.equal(res.body.error.code, "RATE_LIMITED");
});

test("public orders and reviews reject oversized input", () => {
  const item = { productId: "p1", quantity: 1 };
  assert.equal(createOrderSchema.safeParse({ items: Array(51).fill(item) }).success, false);
  assert.equal(createOrderSchema.safeParse({ items: [{ productId: "p1", quantity: 101 }] }).success, false);
  assert.equal(createOrderSchema.safeParse({ items: [item], notes: "x".repeat(1001) }).success, false);
  assert.equal(submitReviewSchema.safeParse({ productId: "p1", rating: 5, comment: "x".repeat(1001) }).success, false);
  assert.equal(submitReviewSchema.safeParse({ productId: "p1", rating: 5, comment: "ممتاز" }).success, true);
});

test("store defaults fill unsaved fields but respect fields a manager cleared", () => {
  const defaults = { whatsapp: "201000000000", tiktok: "https://tiktok.example" };
  assert.deepEqual(applyDefaults(undefined, defaults), defaults);
  // Saved blank by the old dashboard (never through the new flow): defaults apply.
  assert.equal(applyDefaults({ tiktok: "" }, defaults).tiktok, "https://tiktok.example");
  // Cleared by a manager: stays cleared, and the marker is not exposed.
  const saved = markSavedByManager("business", { tiktok: "" }, { business: defaults });
  const result = applyDefaults(saved, defaults);
  assert.equal(result.tiktok, "");
  assert.equal(result.whatsapp, "201000000000");
  assert.equal("_savedByManager" in result, false);
});

test("staff passwords need length, letters and numbers, and no account details", () => {
  assert.throws(() => assertStrongPassword("short1"), { code: "WEAK_PASSWORD" });
  assert.throws(() => assertStrongPassword("onlyletterspassword"), { code: "WEAK_PASSWORD" });
  assert.throws(() => assertStrongPassword("1234567890"), { code: "WEAK_PASSWORD" });
  assert.throws(() => assertStrongPassword("password123"), { code: "WEAK_PASSWORD" });
  assert.throws(() => assertStrongPassword("maryam2026xyz", { email: "maryam@opticana.com" }), { code: "WEAK_PASSWORD" });
  assert.equal(assertStrongPassword("Glasses-Store-2026"), "Glasses-Store-2026");
  assert.equal(assertStrongPassword("نظارات2026أوبتيكانا"), "نظارات2026أوبتيكانا");
});

test("uploaded images are recognised by their content, not their declared type", () => {
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
  assert.equal(detectImageType(png), "image/png");
  assert.equal(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
  assert.equal(detectImageType(Buffer.from("GIF89a....")), "image/gif");
  assert.equal(detectImageType(Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP")])), "image/webp");
  assert.equal(detectImageType(Buffer.from("<svg onload=alert(1)>")), null);
  assert.equal(detectImageType(Buffer.from("<html><script></script>")), null);
});

test("session cookie is read from the Cookie header", () => {
  assert.equal(readSessionCookie({ headers: { cookie: "a=1; opticana_session=abc.def.ghi; b=2" } }), "abc.def.ghi");
  assert.equal(readSessionCookie({ headers: { cookie: "other=1" } }), null);
  assert.equal(readSessionCookie({ headers: {} }), null);
});
