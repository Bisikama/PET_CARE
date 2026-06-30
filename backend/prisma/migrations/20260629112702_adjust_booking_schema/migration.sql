/*
  Warnings:

  - You are about to drop the column `booking_id` on the `booking_checklist_items` table. All the data in the column will be lost.
  - You are about to drop the column `booking_date` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `pet_id` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `provider_service_id` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `booking_service_id` to the `booking_checklist_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimated_end_at` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimated_start_at` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requested_date` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requested_slot_id` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_duration_minutes` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "working_mode" AS ENUM ('FULL_TIME', 'PART_TIME');

-- DropForeignKey
ALTER TABLE "booking_checklist_items" DROP CONSTRAINT "booking_checklist_items_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_pet_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_provider_service_id_fkey";

-- DropIndex
DROP INDEX "idx_bookings_booking_date";

-- DropIndex
DROP INDEX "idx_bookings_schedule_conflict";

-- AlterTable
ALTER TABLE "booking_checklist_items" DROP COLUMN "booking_id",
ADD COLUMN     "booking_service_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "booking_date",
DROP COLUMN "end_time",
DROP COLUMN "pet_id",
DROP COLUMN "provider_service_id",
DROP COLUMN "start_time",
ADD COLUMN     "buffer_minutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "estimated_end_at" TIMESTAMP(6) NOT NULL,
ADD COLUMN     "estimated_start_at" TIMESTAMP(6) NOT NULL,
ADD COLUMN     "requested_date" DATE NOT NULL,
ADD COLUMN     "requested_slot_id" UUID NOT NULL,
ADD COLUMN     "service_duration_minutes" INTEGER NOT NULL,
ADD COLUMN     "travel_duration_minutes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "time_slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "slot_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_working_days" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider_id" UUID NOT NULL,
    "work_date" DATE NOT NULL,
    "working_mode" "working_mode" NOT NULL DEFAULT 'FULL_TIME',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_working_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_working_slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "working_day_id" UUID NOT NULL,
    "slot_id" UUID NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_working_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_pets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "pet_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_pet_id" UUID NOT NULL,
    "provider_service_id" UUID NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_working_days_provider_id_idx" ON "provider_working_days"("provider_id");

-- CreateIndex
CREATE INDEX "provider_working_days_work_date_idx" ON "provider_working_days"("work_date");

-- CreateIndex
CREATE UNIQUE INDEX "provider_working_days_provider_id_work_date_key" ON "provider_working_days"("provider_id", "work_date");

-- CreateIndex
CREATE UNIQUE INDEX "provider_working_slots_working_day_id_slot_id_key" ON "provider_working_slots"("working_day_id", "slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_pets_booking_id_pet_id_key" ON "booking_pets"("booking_id", "pet_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_services_booking_pet_id_provider_service_id_key" ON "booking_services"("booking_pet_id", "provider_service_id");

-- CreateIndex
CREATE INDEX "idx_bookings_requested_date" ON "bookings"("requested_date");

-- CreateIndex
CREATE INDEX "idx_bookings_schedule_conflict" ON "bookings"("provider_id", "requested_date", "estimated_start_at", "estimated_end_at") WHERE (status = ANY (ARRAY['ACCEPTED'::booking_status, 'IN_PROGRESS'::booking_status, 'PENDING_PROVIDER_ACCEPTANCE'::booking_status, 'AWAITING_CUSTOMER_CONFIRMATION'::booking_status]));

-- AddForeignKey
ALTER TABLE "booking_checklist_items" ADD CONSTRAINT "booking_checklist_items_booking_service_id_fkey" FOREIGN KEY ("booking_service_id") REFERENCES "booking_services"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_requested_slot_id_fkey" FOREIGN KEY ("requested_slot_id") REFERENCES "time_slots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "provider_working_days" ADD CONSTRAINT "provider_working_days_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_working_slots" ADD CONSTRAINT "provider_working_slots_working_day_id_fkey" FOREIGN KEY ("working_day_id") REFERENCES "provider_working_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_working_slots" ADD CONSTRAINT "provider_working_slots_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "time_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_pets" ADD CONSTRAINT "booking_pets_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_pets" ADD CONSTRAINT "booking_pets_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_services" ADD CONSTRAINT "booking_services_booking_pet_id_fkey" FOREIGN KEY ("booking_pet_id") REFERENCES "booking_pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_services" ADD CONSTRAINT "booking_services_provider_service_id_fkey" FOREIGN KEY ("provider_service_id") REFERENCES "provider_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
