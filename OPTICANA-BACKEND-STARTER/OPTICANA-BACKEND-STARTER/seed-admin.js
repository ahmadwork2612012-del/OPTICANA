import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./src/utils/password.js";

const prisma = new PrismaClient();

async function seed() {
  const hashedPassword = await hashPassword("123456");
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@opticana.com" },
    update: { password: hashedPassword },
    create: {
      email: "admin@opticana.com",
      name: "Main Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user ready:", admin.email);
}

seed()
  .catch((err) => console.error("❌ Error seeding admin:", err))
  .finally(() => prisma.$disconnect());
