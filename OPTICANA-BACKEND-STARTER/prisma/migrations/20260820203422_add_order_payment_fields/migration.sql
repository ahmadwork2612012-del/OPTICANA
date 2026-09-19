-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "remainingAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");
