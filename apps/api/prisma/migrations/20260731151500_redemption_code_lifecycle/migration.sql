-- AlterTable
ALTER TABLE "redemption_codes" ADD COLUMN "note" TEXT;
ALTER TABLE "redemption_codes" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);
ALTER TABLE "redemption_codes" ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
