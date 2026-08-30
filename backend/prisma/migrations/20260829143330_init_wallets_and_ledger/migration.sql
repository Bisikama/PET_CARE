-- CreateEnum
CREATE TYPE "wallet_status" AS ENUM ('ACTIVE', 'LOCKED');

-- CreateEnum
CREATE TYPE "wallet_transaction_type" AS ENUM ('CREDIT', 'DEBIT', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'PAYOUT');

-- AlterEnum
ALTER TYPE "payment_method" ADD VALUE 'WALLET';

-- CreateTable
CREATE TABLE "wallets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pending_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "wallet_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wallet_id" UUID NOT NULL,
    "type" "wallet_transaction_type" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "balance_after" DECIMAL(12,2) NOT NULL,
    "booking_id" UUID,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "idx_wallet_transactions_wallet_id" ON "wallet_transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "idx_wallet_transactions_booking_id" ON "wallet_transactions"("booking_id");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
