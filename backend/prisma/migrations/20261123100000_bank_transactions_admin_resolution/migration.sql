-- AlterEnum
ALTER TYPE "bank_transaction_status" ADD VALUE 'RESOLVED_MANUALLY';

-- AlterTable
ALTER TABLE "bank_transactions" ADD COLUMN "resolved_by" UUID,
ADD COLUMN "resolved_at" TIMESTAMP(6);

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
