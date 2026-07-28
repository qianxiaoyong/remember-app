import { describe, expect, it } from 'vitest';
import { MIGRATIONS, USER_DB_TABLE_NAMES, USER_DB_VERSION } from './user-db-schema';

describe('user-db-schema', () => {
  it('当前版本为 1 且包含迁移 SQL', () => {
    expect(USER_DB_VERSION).toBe(1);
    expect(MIGRATIONS[1]?.length).toBeGreaterThan(0);
  });

  it('五张表均在 version 1 迁移中创建', () => {
    const sql = MIGRATIONS[1]?.join('\n') ?? '';
    for (const tableName of USER_DB_TABLE_NAMES) {
      expect(sql).toContain(`CREATE TABLE ${tableName}`);
    }
  });
});
