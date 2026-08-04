-- DropContentLexicon: revert PR #13 central content lexicon (content_* tables)

DROP TABLE IF EXISTS "content_lemma_assets" CASCADE;
DROP TABLE IF EXISTS "content_lemma_tag_links" CASCADE;
DROP TABLE IF EXISTS "content_lemma_forms" CASCADE;
DROP TABLE IF EXISTS "content_lemma_fragments" CASCADE;
DROP TABLE IF EXISTS "content_lemmas" CASCADE;
DROP TABLE IF EXISTS "content_tags" CASCADE;
DROP TABLE IF EXISTS "content_import_batches" CASCADE;

DELETE FROM "_prisma_migrations"
WHERE migration_name = '20260804100000_add_content_lexicon';
