-- CreateEnum
CREATE TYPE "booking_media_category" AS ENUM ('CHECK_IN', 'CHECK_OUT', 'IN_PROGRESS', 'OTHER');

-- AlterTable
ALTER TABLE "booking_media" ADD COLUMN "category" "booking_media_category" NOT NULL DEFAULT 'CHECK_IN';
