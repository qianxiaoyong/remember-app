import { describe, expect, it } from 'vitest';
import { MIGRATIONS, USER_DB_TABLE_NAMES, USER_DB_VERSION } from './user-db-schema';

describe('user-db-schema', () => {
  it('当前版本为 3 且包含迁移 SQL', () => {
    expect(USER_DB_VERSION).toBe(3);
    expect(MIGRATIONS[1]?.length).toBeGreaterThan(0);
    expect(MIGRATIONS[2]?.length).toBeGreaterThan(0);
    expect(MIGRATIONS[3]?.length).toBeGreaterThan(0);
  });

  it('version 3 创建 story_reading_bookmarks', () => {
    const sql = MIGRATIONS[3]?.join('\n') ?? '';
    expect(sql).toContain('CREATE TABLE story_reading_bookmarks');
  });

  it('version 2 创建 saved_lexicon_items', () => {
    const sql = MIGRATIONS[2]?.join('\n') ?? '';
    expect(sql).toContain('CREATE TABLE saved_lexicon_items');
  });

  it('五张基础表均在 version 1 迁移中创建', () => {
    const sql = MIGRATIONS[1]?.join('\n') ?? '';
    const baseTables = USER_DB_TABLE_NAMES.filter(
      (name) => name !== 'saved_lexicon_items' && name !== 'story_reading_bookmarks',
    );
    for (const tableName of baseTables) {
      expect(sql).toContain(`CREATE TABLE ${tableName}`);
    }
  });
});
