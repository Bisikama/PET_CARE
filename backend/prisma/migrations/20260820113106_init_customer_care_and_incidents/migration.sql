-- CreateEnum
CREATE TYPE "incident_type" AS ENUM ('PET_INJURY', 'PET_HEALTH_EMERGENCY', 'PET_ESCAPED_OR_LOST', 'AGGRESSIVE_PET_INCIDENT', 'PROVIDER_SAFETY_INCIDENT', 'PROPERTY_DAMAGE', 'SUSPICIOUS_OR_UNSAFE_BEHAVIOR', 'PROVIDER_NO_SHOW_SERIOUS', 'CUSTOMER_UNSAFE_LOCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "incident_status" AS ENUM ('DRAFT', 'OPEN', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'RESOLVED', 'DISMISSED', 'ESCALATED');

-- AlterEnum
ALTER TYPE "booking_status" ADD VALUE 'INCIDENT_REPORTED';

-- CreateTable
CREATE TABLE "incidents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "reporter_id" UUID NOT NULL,
    "type" "incident_type" NOT NULL,
    "status" "incident_status" NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL,
    "admin_id" UUID,
    "resolution_note" TEXT,
    "resolved_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_evidences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "incident_id" UUID NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "uploaded_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_evidences_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_evidences" ADD CONSTRAINT "incident_evidences_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
