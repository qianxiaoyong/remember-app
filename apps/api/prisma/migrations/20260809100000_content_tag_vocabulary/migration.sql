CREATE TABLE "content_tag_vocabulary" (
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_tag_vocabulary_pkey" PRIMARY KEY ("label")
);

INSERT INTO "content_tag_vocabulary" ("label", "sort_order", "created_at")
SELECT DISTINCT trim(both from value), 0, CURRENT_TIMESTAMP
FROM "packs",
LATERAL jsonb_array_elements_text("content_tags"::jsonb) AS value
WHERE jsonb_typeof("content_tags"::jsonb) = 'array'
  AND trim(both from value) <> ''
ON CONFLICT ("label") DO NOTHING;
