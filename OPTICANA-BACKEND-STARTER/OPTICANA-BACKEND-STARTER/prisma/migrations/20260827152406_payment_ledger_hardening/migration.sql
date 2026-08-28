-- AlterEnum
ALTER TYPE "PaymentType" ADD VALUE 'REPAIR_PAYMENT';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "repairId" TEXT,
ADD COLUMN     "reversedPaymentId" TEXT;

-- CreateIndex
CREATE INDEX "Payment_repairId_idx" ON "Payment"("repairId");

-- CreateIndex
CREATE INDEX "Payment_createdById_createdAt_idx" ON "Payment"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_reversedPaymentId_idx" ON "Payment"("reversedPaymentId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_repairId_fkey" FOREIGN KEY ("repairId") REFERENCES "Repair"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reversedPaymentId_fkey" FOREIGN KEY ("reversedPaymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
