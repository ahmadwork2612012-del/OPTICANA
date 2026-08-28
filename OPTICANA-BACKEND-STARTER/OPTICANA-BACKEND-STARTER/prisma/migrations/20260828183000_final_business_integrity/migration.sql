ALTER TABLE "OrderItem"
ADD COLUMN "costPrice" DECIMAL(12,2) NOT NULL DEFAULT 0;

UPDATE "OrderItem" oi
SET "costPrice" = COALESCE(
  (
    SELECT pi."purchasePrice"
    FROM "PurchaseItem" pi
    INNER JOIN "Purchase" pu ON pu."id" = pi."purchaseId"
    INNER JOIN "Order" o ON o."id" = oi."orderId"
    WHERE pi."productId" = oi."productId"
      AND pu."status" = 'RECEIVED'
      AND pu."createdAt" <= o."createdAt"
    ORDER BY pu."createdAt" DESC
    LIMIT 1
  ),
  (SELECT p."purchasePrice" FROM "Product" p WHERE p."id" = oi."productId"),
  0
)
WHERE oi."costPrice" = 0;

ALTER TABLE "Repair"
ADD COLUMN "itemType" TEXT,
ADD COLUMN "problem" TEXT,
ADD COLUMN "diagnosis" TEXT,
ADD COLUMN "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "dueDate" TIMESTAMP(3);

CREATE INDEX "Repair_dueDate_idx" ON "Repair"("dueDate");
CREATE INDEX "Repair_receivedDate_idx" ON "Repair"("receivedDate");
