import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";
import { assertStrongPassword } from "../src/utils/passwordPolicy.js";

const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || "");
const name = String(process.env.ADMIN_NAME || "OPTICANA Admin").trim();

if (!email || !password) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required for a production-safe seed.");
}
assertStrongPassword(password, { email, name });

const passwordHash = await bcrypt.hash(password, 12);

// Fresh-install seed: operational/business data remains empty.
// Only the first SUPER_ADMIN account is created so the Admin application is usable.
const user = await prisma.user.upsert({
  where: { email },
  update: { name, passwordHash, role: "SUPER_ADMIN", isActive: true },
  create: { name, email, passwordHash, role: "SUPER_ADMIN", isActive: true },
  select: { id: true, email: true },
});

console.log(`Seeded admin account ${user.email}. Business data remains empty.`);
