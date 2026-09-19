import assert from "node:assert/strict";
import test from "node:test";

import { comparePassword, hashPassword } from "../src/utils/password.js";
import { createOrderSchema } from "../src/validators/order.validator.js";
import { createProductSchema } from "../src/validators/product.validator.js";
import { assertRoleAssignment } from "../src/services/auth.service.js";
import { changeStock } from "../src/services/inventory.service.js";
import { rateLimit } from "../src/middleware/rateLimit.js";

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
