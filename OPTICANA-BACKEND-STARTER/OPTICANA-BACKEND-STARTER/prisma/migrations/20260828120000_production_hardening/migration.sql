
-- Production hardening: repair parts, media, notifications, audit logs.
ALTER TYPE "RepairStatus" ADD VALUE IF NOT EXISTS 'RECEIVED';
ALTER TYPE "RepairStatus" ADD VALUE IF NOT EXISTS 'DIAGNOSING';
ALTER TYPE "RepairStatus" ADD VALUE IF NOT EXISTS 'WAITING';
ALTER TYPE "RepairStatus" ADD VALUE IF NOT EXISTS 'DELIVERED';

CREATE TABLE "RepairPart" (
  "id" TEXT NOT NULL,
  "repairId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RepairPart_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Media" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "mimeType" TEXT,
  "size" INTEGER NOT NULL DEFAULT 0,
  "folder" TEXT NOT NULL DEFAULT 'general',
  "entityType" TEXT,
  "entityId" TEXT,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "uploadedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'info',
  "entityType" TEXT,
  "entityId" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'normal',
  "read" BOOLEAN NOT NULL DEFAULT false,
  "readAt" TIMESTAMP(3),
  "source" TEXT NOT NULL DEFAULT 'system',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "beforeJson" JSONB,
  "afterJson" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RepairPart_repairId_idx" ON "RepairPart"("repairId");
CREATE INDEX "RepairPart_productId_idx" ON "RepairPart"("productId");
CREATE INDEX "Media_folder_idx" ON "Media"("folder");
CREATE INDEX "Media_entityType_entityId_idx" ON "Media"("entityType", "entityId");
CREATE INDEX "Media_uploadedById_createdAt_idx" ON "Media"("uploadedById", "createdAt");
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");
CREATE INDEX "Notification_source_createdAt_idx" ON "Notification"("source", "createdAt");
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

ALTER TABLE "RepairPart"
  ADD CONSTRAINT "RepairPart_repairId_fkey"
  FOREIGN KEY ("repairId") REFERENCES "Repair"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RepairPart"
  ADD CONSTRAINT "RepairPart_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Media"
  ADD CONSTRAINT "Media_uploadedById_fkey"
  FOREIGN KEY ("uploadedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TYPE "InventoryMovementType" ADD VALUE IF NOT EXISTS 'REPAIR';
