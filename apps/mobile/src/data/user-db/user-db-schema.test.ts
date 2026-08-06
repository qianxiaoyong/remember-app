import { describe, expect, it } from 'vitest';
import { MIGRATIONS, USER_DB_TABLE_NAMES, USER_DB_VERSION } from './user-db-schema';

describe('user-db-schema', () => {
  it('当前版本为 4 且包含迁移 SQL', () => {
    expect(USER_DB_VERSION).toBe(4);
    expect(MIGRATIONS[1]?.length).toBeGreaterThan(0);
    expect(MIGRATIONS[2]?.length).toBeGreaterThan(0);
    expect(MIGRATIONS[3]?.length).toBeGreaterThan(0);
    expect(MIGRATIONS[4]?.length).toBeGreaterThan(0);
  });

  it('version 4 扩展 learning_states 并创建复习池相关表', () => {
    const sql = MIGRATIONS[4]?.join('\n') ?? '';
    expect(sql).toContain('ALTER TABLE learning_states ADD COLUMN inReviewPool');
    expect(sql).toContain('CREATE TABLE pack_browse_bookmarks');
    expect(sql).toContain('CREATE TABLE user_preferences');
    expect(sql).toContain('CREATE TABLE review_daily_stats');
    expect(sql).toContain("VALUES ('dailyReviewLimit', '20'");
    expect(sql).toContain("VALUES ('packOpenPosition', 'bookmark'");
  });

  it('version 3 创建 story_reading_bookmarks', () => {
    const sql = MIGRATIONS[3]?.join('\n') ?? '';
    expect(sql).toContain('CREATE TABLE story_reading_bookmarks');
  });

  it('version 2 创建 saved_lexicon_items', () => {
    const sql = MIGRATIONS[2]?.join('\n') ?? '';
    expect(sql).toContain('CREATE TABLE saved_lexicon_items');
  });

  it('基础表在 version 1 迁移中创建', () => {
    const sql = MIGRATIONS[1]?.join('\n') ?? '';
    const baseTables = USER_DB_TABLE_NAMES.filter(
      (name) =>
        name !== 'saved_lexicon_items' &&
        name !== 'story_reading_bookmarks' &&
        name !== 'pack_browse_bookmarks' &&
        name !== 'user_preferences' &&
        name !== 'review_daily_stats',
    );
    for (const tableName of baseTables) {
      expect(sql).toContain(`CREATE TABLE ${tableName}`);
    }
  });
});
