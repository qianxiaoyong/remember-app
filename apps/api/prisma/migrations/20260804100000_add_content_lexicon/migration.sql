-- CreateTable
CREATE TABLE "content_import_batches" (
    "id" UUID NOT NULL,
    "source_name" TEXT NOT NULL,
    "file_version" TEXT NOT NULL,
    "file_sha256" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "inserted_count" INTEGER NOT NULL DEFAULT 0,
    "skipped_count" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(6),
    "error_message" TEXT,

    CONSTRAINT "content_import_batches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_lemmas" (
    "id" UUID NOT NULL,
    "lemma_key" TEXT NOT NULL,
    "headword" TEXT NOT NULL,
    "ipa" TEXT,
    "pos" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source" TEXT NOT NULL,
    "difficulty_level" INTEGER,
    "cefr_level" TEXT,
    "frequency_bnc" INTEGER,
    "frequency_frq" INTEGER,
    "collins_star" INTEGER,
    "oxford_core" BOOLEAN,
    "import_batch_id" UUID,
    "published_at" TIMESTAMPTZ(6),
    "published_by_admin_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "content_lemmas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_lemma_fragments" (
    "id" UUID NOT NULL,
    "lemma_id" UUID NOT NULL,
    "fragment_type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "content_lemma_fragments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_lemma_forms" (
    "form_key" TEXT NOT NULL,
    "lemma_id" UUID NOT NULL,
    "form_type" TEXT NOT NULL,
    "display_form" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_lemma_forms_pkey" PRIMARY KEY ("form_key")
);

CREATE TABLE "content_tags" (
    "id" UUID NOT NULL,
    "tag_key" TEXT NOT NULL,
    "label_zh" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_lemma_tag_links" (
    "lemma_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_lemma_tag_links_pkey" PRIMARY KEY ("lemma_id","tag_id")
);

CREATE TABLE "content_lemma_assets" (
    "id" UUID NOT NULL,
    "lemma_id" UUID NOT NULL,
    "asset_kind" TEXT NOT NULL,
    "storage_kind" TEXT NOT NULL,
    "path_or_key" TEXT NOT NULL,
    "sha256" TEXT,
    "duration_ms" INTEGER,
    "mime_type" TEXT,
    "voice_id" TEXT,
    "tts_text" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_lemma_assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "content_import_batches_file_sha256_key" ON "content_import_batches"("file_sha256");
CREATE UNIQUE INDEX "content_lemmas_lemma_key_key" ON "content_lemmas"("lemma_key");
CREATE INDEX "content_lemmas_status_idx" ON "content_lemmas"("status");
CREATE INDEX "content_lemmas_headword_idx" ON "content_lemmas"("headword");
CREATE INDEX "content_lemma_fragments_lemma_id_fragment_type_idx" ON "content_lemma_fragments"("lemma_id", "fragment_type");
CREATE INDEX "content_lemma_forms_lemma_id_idx" ON "content_lemma_forms"("lemma_id");
CREATE UNIQUE INDEX "content_tags_tag_key_key" ON "content_tags"("tag_key");
CREATE INDEX "content_lemma_assets_lemma_id_asset_kind_idx" ON "content_lemma_assets"("lemma_id", "asset_kind");

ALTER TABLE "content_lemmas" ADD CONSTRAINT "content_lemmas_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "content_import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "content_lemmas" ADD CONSTRAINT "content_lemmas_published_by_admin_id_fkey" FOREIGN KEY ("published_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "content_lemma_fragments" ADD CONSTRAINT "content_lemma_fragments_lemma_id_fkey" FOREIGN KEY ("lemma_id") REFERENCES "content_lemmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_lemma_forms" ADD CONSTRAINT "content_lemma_forms_lemma_id_fkey" FOREIGN KEY ("lemma_id") REFERENCES "content_lemmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_lemma_tag_links" ADD CONSTRAINT "content_lemma_tag_links_lemma_id_fkey" FOREIGN KEY ("lemma_id") REFERENCES "content_lemmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_lemma_tag_links" ADD CONSTRAINT "content_lemma_tag_links_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "content_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_lemma_assets" ADD CONSTRAINT "content_lemma_assets_lemma_id_fkey" FOREIGN KEY ("lemma_id") REFERENCES "content_lemmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
