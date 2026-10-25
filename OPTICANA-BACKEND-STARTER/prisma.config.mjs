import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma Client generation does not need a live database. Use a local-only
// placeholder when DATABASE_URL is absent (for example in Vercel Preview),
// while always preferring the configured database URL for real migrations.
const datasourceUrl =
  process.env.DATABASE_URL ||
  "postgresql://build:build@127.0.0.1:5432/opticana_build";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: datasourceUrl,
  },
});
