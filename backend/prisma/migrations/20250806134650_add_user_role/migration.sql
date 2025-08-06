-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."InstitutionRole" NOT NULL DEFAULT 'STUDENT';
