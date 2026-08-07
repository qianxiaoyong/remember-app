-- AlterTable
ALTER TABLE "learning_states" ADD COLUMN "in_review_pool" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "learning_states" ADD COLUMN "box_level" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "learning_states" ADD COLUMN "first_added_from_pack_id" TEXT NOT NULL DEFAULT '';
ALTER TABLE "learning_states" ADD COLUMN "last_seen_in_pack_id" TEXT;
ALTER TABLE "learning_states" ADD COLUMN "consecutive_level3_passes" INTEGER NOT NULL DEFAULT 0;

-- Backfill first_added_from_pack_id from legacy pack_id
UPDATE "learning_states" SET "first_added_from_pack_id" = "pack_id" WHERE "first_added_from_pack_id" = '';

-- Backfill in_review_pool from legacy SM-2 fields
UPDATE "learning_states"
SET "in_review_pool" = true
WHERE "repetitions" > 0 OR "interval_days" > 0;
