import { PrismaClient } from "@prisma/client";

const globalForPrisma =
  globalThis;

const prisma =
  globalForPrisma.__opticanaPrisma ||
  new PrismaClient();

if (
  process.env.NODE_ENV !==
  "production"
) {
  globalForPrisma.__opticanaPrisma =
    prisma;
}

export default prisma;
