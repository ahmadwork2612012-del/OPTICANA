ALTER TABLE "Product"
ADD COLUMN "customFields" JSONB NOT NULL DEFAULT '[]'::jsonb;
