-- Store an explicit due date for customer credit sales.
ALTER TABLE "Order" ADD COLUMN "dueDate" TIMESTAMP(3);
CREATE INDEX "Order_dueDate_idx" ON "Order"("dueDate");
