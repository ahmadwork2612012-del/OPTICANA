import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "./src/lib/prisma.js";
import { assertStrongPassword } from "./src/utils/passwordPolicy.js";

const email = String(process.env.ADMIN_EMAIL || "admin@opticana.local").trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || "");
const name = String(process.env.ADMIN_NAME || "OPTICANA Admin").trim();

if (!password) {
  throw new Error("Set ADMIN_PASSWORD before running seed-admin.js");
}
assertStrongPassword(password, { email, name });

const passwordHash = await bcrypt.hash(password, 12);
const user = await prisma.user.upsert({
  where: { email },
  update: { name, passwordHash, role: "SUPER_ADMIN", isActive: true },
  create: { name, email, passwordHash, role: "SUPER_ADMIN", isActive: true },
  select: { id: true, email: true },
});

console.log(`Admin ready: ${user.email}`);
await prisma.$disconnect();
