-- CreateTable
CREATE TABLE "catalog_primary_nodes" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "catalog_primary_nodes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "catalog_secondary_nodes" (
    "id" UUID NOT NULL,
    "primary_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "catalog_secondary_nodes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "catalog_version_nodes" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "catalog_version_nodes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "catalog_primary_nodes_slug_key" ON "catalog_primary_nodes"("slug");
CREATE UNIQUE INDEX "catalog_version_nodes_slug_key" ON "catalog_version_nodes"("slug");
CREATE UNIQUE INDEX "catalog_secondary_nodes_primary_id_slug_key" ON "catalog_secondary_nodes"("primary_id", "slug");

ALTER TABLE "catalog_secondary_nodes" ADD CONSTRAINT "catalog_secondary_nodes_primary_id_fkey" FOREIGN KEY ("primary_id") REFERENCES "catalog_primary_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "packs" ADD COLUMN "primary_node_id" UUID,
ADD COLUMN "secondary_node_id" UUID,
ADD COLUMN "version_node_id" UUID;

ALTER TABLE "packs" ADD CONSTRAINT "packs_primary_node_id_fkey" FOREIGN KEY ("primary_node_id") REFERENCES "catalog_primary_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packs" ADD CONSTRAINT "packs_secondary_node_id_fkey" FOREIGN KEY ("secondary_node_id") REFERENCES "catalog_secondary_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packs" ADD CONSTRAINT "packs_version_node_id_fkey" FOREIGN KEY ("version_node_id") REFERENCES "catalog_version_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed primary nodes (stable UUIDs)
INSERT INTO "catalog_primary_nodes" ("id", "slug", "label", "sort_order", "status", "updated_at") VALUES
  ('a1000001-0000-4000-8000-000000000001', 'primary', '小学英语', 1, 'active', CURRENT_TIMESTAMP),
  ('a1000001-0000-4000-8000-000000000002', 'junior', '初中英语', 2, 'active', CURRENT_TIMESTAMP),
  ('a1000001-0000-4000-8000-000000000003', 'senior', '高中英语', 3, 'active', CURRENT_TIMESTAMP),
  ('a1000001-0000-4000-8000-000000000004', 'postgraduate', '考研英语', 4, 'active', CURRENT_TIMESTAMP);

-- Seed version nodes
INSERT INTO "catalog_version_nodes" ("id", "slug", "label", "sort_order", "status", "updated_at") VALUES
  ('b2000001-0000-4000-8000-000000000001', 'pep', '人教版', 1, 'active', CURRENT_TIMESTAMP),
  ('b2000001-0000-4000-8000-000000000002', 'nse', '外研版', 2, 'active', CURRENT_TIMESTAMP),
  ('b2000001-0000-4000-8000-000000000003', 'yl', '译林版', 3, 'active', CURRENT_TIMESTAMP);

-- Seed secondary nodes: primary (grades 1-6)
INSERT INTO "catalog_secondary_nodes" ("id", "primary_id", "slug", "label", "sort_order", "status", "updated_at") VALUES
  ('c3000001-0000-4000-8000-000000000101', 'a1000001-0000-4000-8000-000000000001', 'grade1', '一年级', 1, 'active', CURRENT_TIMESTAMP),
  ('c3000001-0000-4000-8000-000000000102', 'a1000001-0000-4000-8000-000000000001', 'grade2', '二年级', 2, 'active', CURRENT_TIMESTAMP),
  ('c3000001-0000-4000-8000-000000000103', 'a1000001-0000-4000-8000-000000000001', 'grade3', '三年级', 3, 'active', CURRENT_TIMESTAMP),
  ('c3000001-0000-4000-8000-000000000104', 'a1000001-0000-4000-8000-000000000001', 'grade4', '四年级', 4, 'active', CURRENT_TIMESTAMP),
  ('c3000001-0000-4000-8000-000000000105', 'a1000001-0000-4000-8000-000000000001', 'grade5', '五年级', 5, 'active', CURRENT_TIMESTAMP),
  ('c3000001-0000-4000-8000-000000000106', 'a1000001-0000-4000-8000-000000000001', 'grade6', '六年级', 6, 'active', CURRENT_TIMESTAMP);

-- junior (grades 7-9)
INSERT INTO "catalog_secondary_nodes" ("id", "primary_id", "slug", "label", "sort_order", "status", "updated_at") VALUES
  ('c3000001-0000-4000-8000-000000000201', 'a1000001-0000-4000-8000-000000000002', 'grade7', '七年级', 1, 'active', CURRENT_TIMESTAMP),
  ('c3000001-0000-4000-8000-000000000202', 'a1000001-0000-4000-8000-000000000002', 'grade8', '八年级', 2, 'active', CURRENT_TIMESTAMP),
  ('c3000001-0000-4000-8000-000000000203', 'a1000001-0000-4000-8000-000000000002', 'grade9', '九年级', 3, 'active', CURRENT_TIMESTAMP);

-- senior
INSERT INTO "catalog_secondary_nodes" ("id", "primary_id", "slug", "label", "sort_order", "status", "updated_at") VALUES
  ('c3000001-0000-4000-8000-000000000301', 'a1000001-0000-4000-8000-000000000003', 'grade10', '高一', 1, 'active', CURRENT_TIMESTAMP),
  ('c3000001-0000-4000-8000-000000000302', 'a1000001-0000-4000-8000-000000000003', 'grade11', '高二', 2, 'active', CURRENT_TIMESTAMP),
  ('c3000001-0000-4000-8000-000000000303', 'a1000001-0000-4000-8000-000000000003', 'grade12', '高三', 3, 'active', CURRENT_TIMESTAMP);

-- postgraduate
INSERT INTO "catalog_secondary_nodes" ("id", "primary_id", "slug", "label", "sort_order", "status", "updated_at") VALUES
  ('c3000001-0000-4000-8000-000000000401', 'a1000001-0000-4000-8000-000000000004', 'postgraduate-en', '考研英语', 1, 'active', CURRENT_TIMESTAMP);

-- Backfill pack FKs from legacy string columns
UPDATE "packs" p
SET "primary_node_id" = pn."id"
FROM "catalog_primary_nodes" pn
WHERE pn."slug" = p."primary_category";

UPDATE "packs" p
SET "secondary_node_id" = sn."id"
FROM "catalog_secondary_nodes" sn
INNER JOIN "catalog_primary_nodes" pn ON pn."id" = sn."primary_id"
WHERE pn."slug" = p."primary_category"
  AND sn."label" = p."secondary_category";

UPDATE "packs" p
SET "version_node_id" = vn."id"
FROM "catalog_version_nodes" vn
WHERE vn."label" = p."version_label";
