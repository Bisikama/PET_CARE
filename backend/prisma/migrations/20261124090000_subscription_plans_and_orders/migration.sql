-- CreateEnum
CREATE TYPE "subscription_order_status" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "bank_transactions" ADD COLUMN     "subscription_order_id" UUID;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "plan_id" UUID;

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "plan_code" VARCHAR(20) NOT NULL,
    "plan_name" VARCHAR(100) NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "payment_method" NOT NULL,
    "status" "subscription_order_status" NOT NULL DEFAULT 'PENDING',
    "payment_code" VARCHAR(32) NOT NULL,
    "transfer_content" VARCHAR(100),
    "gateway_ref" VARCHAR(255),
    "subscription_id" UUID,
    "paid_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_orders_payment_code_key" ON "subscription_orders"("payment_code");

-- CreateIndex
CREATE INDEX "subscription_orders_user_id_status_idx" ON "subscription_orders"("user_id", "status");

-- CreateIndex
CREATE INDEX "subscription_orders_status_created_at_idx" ON "subscription_orders"("status", "created_at");

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_subscription_order_id_fkey" FOREIGN KEY ("subscription_order_id") REFERENCES "subscription_orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION;


-- Gói mặc định (trước đây hardcode ở frontend). Admin chỉnh sửa / tắt bán trong trang quản trị.
INSERT INTO "subscription_plans" ("code", "name", "description", "price", "duration_days", "benefits", "sort_order")
VALUES
  ('BASIC',   'Gói Cơ Bản',        'Dành cho chủ nuôi có 1-2 thú cưng.',              99000,   30,  ARRAY['Ưu đãi riêng cho hội viên'], 1),
  ('PREMIUM', 'Gói VIP Pro',       'Ưu tiên ghép cặp provider & miễn phí tư vấn y tế.', 249000,  30,  ARRAY['Ưu tiên ghép cặp provider', 'Miễn phí tư vấn y tế'], 2),
  ('YEARLY',  'Gói Tiết Kiệm Năm', 'Tiết kiệm 35% chi phí dịch vụ chăm sóc cả năm.',  1990000, 365, ARRAY['Tiết kiệm 35% so với mua theo tháng'], 3)
ON CONFLICT ("code") DO NOTHING;

-- Gắn các gói đã bán trước đây (nếu mã gói trùng) vào bảng gói
UPDATE "subscriptions" s SET "plan_id" = p."id"
FROM "subscription_plans" p
WHERE s."plan_id" IS NULL AND s."tier_name" = p."code";
