-- CreateEnum
CREATE TYPE "bank_transaction_status" AS ENUM ('MATCHED', 'REFUNDED_TO_WALLET', 'UNMATCHED', 'IGNORED');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN "promotion_code" VARCHAR(50);

-- CreateTable
CREATE TABLE "bank_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" VARCHAR(20) NOT NULL DEFAULT 'SEPAY',
    "external_id" VARCHAR(64) NOT NULL,
    "gateway" VARCHAR(100),
    "account_number" VARCHAR(50),
    "transaction_date" TIMESTAMP(6),
    "transfer_type" VARCHAR(10) NOT NULL,
    "transfer_amount" DECIMAL(14,2) NOT NULL,
    "content" TEXT,
    "code" VARCHAR(64),
    "reference_code" VARCHAR(100),
    "status" "bank_transaction_status" NOT NULL,
    "note" TEXT,
    "payment_id" UUID,
    "raw_payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_transactions_provider_external_id_key" ON "bank_transactions"("provider", "external_id");

-- CreateIndex
CREATE INDEX "bank_transactions_status_idx" ON "bank_transactions"("status");

-- CreateIndex
CREATE INDEX "bank_transactions_code_idx" ON "bank_transactions"("code");

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
