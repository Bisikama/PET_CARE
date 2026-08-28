/*
  Warnings:

  - You are about to drop the column `base_location` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `service_area` on the `provider_profiles` table. All the data in the column will be lost.
  - Made the column `latitude` on table `customer_addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `longitude` on table `customer_addresses` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "address_type" AS ENUM ('HOME', 'WORK', 'OTHER');

-- AlterTable
ALTER TABLE "customer_addresses" ADD COLUMN     "address_type" "address_type" DEFAULT 'OTHER',
ADD COLUMN     "formatted_address" TEXT,
ADD COLUMN     "place_id" VARCHAR(255),
ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL;

-- AlterTable
ALTER TABLE "provider_profiles" DROP COLUMN "base_location",
DROP COLUMN "service_area",
ADD COLUMN     "base_address_line" TEXT,
ADD COLUMN     "base_city" VARCHAR(100),
ADD COLUMN     "base_district" VARCHAR(100),
ADD COLUMN     "base_formatted" TEXT,
ADD COLUMN     "base_latitude" DECIMAL(10,7),
ADD COLUMN     "base_longitude" DECIMAL(10,7),
ADD COLUMN     "base_ward" VARCHAR(100),
ADD COLUMN     "service_radius_km" INTEGER DEFAULT 5;

-- CreateTable
CREATE TABLE "pet_photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pet_id" UUID NOT NULL,
    "photo_url" TEXT NOT NULL,
    "is_primary" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pet_photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pet_photos" ADD CONSTRAINT "pet_photos_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
