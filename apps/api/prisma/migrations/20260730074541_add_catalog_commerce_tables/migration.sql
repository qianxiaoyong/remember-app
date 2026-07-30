-- CreateTable
CREATE TABLE "packs" (
    "pack_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "display_title" TEXT,
    "primary_category" TEXT NOT NULL,
    "secondary_category" TEXT NOT NULL,
    "version_label" TEXT NOT NULL,
    "content_tags" JSONB NOT NULL,
    "card_count" INTEGER NOT NULL,
    "size_label" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "cover_url" TEXT,
    "cover_badge" TEXT,
    "cover_lines" JSONB,
    "sample_previews" JSONB NOT NULL,
    "intro_media" JSONB,
    "is_bundled_test_pack" BOOLEAN NOT NULL DEFAULT false,
    "current_version_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'published',
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "packs_pkey" PRIMARY KEY ("pack_id")
);

-- CreateTable
CREATE TABLE "pack_versions" (
    "id" UUID NOT NULL,
    "pack_id" TEXT NOT NULL,
    "pack_version" TEXT NOT NULL,
    "cos_object_key" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "key_id" TEXT NOT NULL,
    "manifest_signature" TEXT NOT NULL,
    "protocol_version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "published_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pack_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "pack_id" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "channel" TEXT,
    "source_code" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_events" (
    "id" BIGSERIAL NOT NULL,
    "notification_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "order_id" UUID NOT NULL,
    "processed_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pack_access" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "pack_id" TEXT NOT NULL,
    "order_id" UUID,
    "source" TEXT NOT NULL,
    "granted_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pack_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redemption_codes" (
    "id" UUID NOT NULL,
    "code_hash" TEXT NOT NULL,
    "pack_id" TEXT NOT NULL,
    "max_redemptions" INTEGER NOT NULL,
    "redeemed_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ(6),
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redemption_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redemption_events" (
    "id" UUID NOT NULL,
    "redemption_code_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "pack_id" TEXT NOT NULL,
    "order_id" UUID,
    "redeemed_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "redemption_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pack_versions_pack_id_pack_version_key" ON "pack_versions"("pack_id", "pack_version");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_pack_id_idx" ON "orders"("pack_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_events_notification_id_key" ON "payment_events"("notification_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_events_transaction_id_key" ON "payment_events"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "pack_access_user_id_pack_id_key" ON "pack_access"("user_id", "pack_id");

-- CreateIndex
CREATE UNIQUE INDEX "redemption_codes_code_hash_key" ON "redemption_codes"("code_hash");

-- CreateIndex
CREATE INDEX "redemption_events_user_id_idx" ON "redemption_events"("user_id");

-- AddForeignKey
ALTER TABLE "pack_versions" ADD CONSTRAINT "pack_versions_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "packs"("pack_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "packs"("pack_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_access" ADD CONSTRAINT "pack_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_access" ADD CONSTRAINT "pack_access_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "packs"("pack_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_access" ADD CONSTRAINT "pack_access_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemption_codes" ADD CONSTRAINT "redemption_codes_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "packs"("pack_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemption_events" ADD CONSTRAINT "redemption_events_redemption_code_id_fkey" FOREIGN KEY ("redemption_code_id") REFERENCES "redemption_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemption_events" ADD CONSTRAINT "redemption_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemption_events" ADD CONSTRAINT "redemption_events_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "packs"("pack_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemption_events" ADD CONSTRAINT "redemption_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
