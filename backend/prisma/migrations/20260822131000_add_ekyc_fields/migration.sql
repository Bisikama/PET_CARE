-- AlterTable
ALTER TABLE "provider_profiles" ADD COLUMN     "dob" DATE,
ADD COLUMN     "face_match_score" DECIMAL(5,2),
ADD COLUMN     "full_name_on_id" VARCHAR(100),
ADD COLUMN     "id_number" VARCHAR(50),
ADD COLUMN     "issue_date" DATE,
ADD COLUMN     "kyc_provider" VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "provider_profiles_id_number_key" ON "provider_profiles"("id_number");
