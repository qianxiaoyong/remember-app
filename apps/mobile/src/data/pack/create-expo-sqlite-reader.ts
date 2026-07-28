import type { PackSqliteReader } from '@remember/contracts';
import type { SQLiteDatabase } from 'expo-sqlite';

export function createExpoSqliteReader(db: SQLiteDatabase): PackSqliteReader {
  return {
    listTables(): string[] {
      return db
        .getAllSync<{ name: string }>(
          "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
        )
        .map((row) => row.name);
    },
    readTableInfo(tableName: string) {
      return db
        .getAllSync<{ name: string; type: string; notnull: number; pk: number }>(
          `PRAGMA table_info(${tableName})`,
        )
        .map((row) => ({
          name: row.name,
          type: row.type,
          notnull: row.notnull,
          pk: row.pk,
        }));
    },
    countRows(tableName: string): number {
      return (
        db.getFirstSync<{ count: number }>(`SELECT COUNT(*) AS count FROM ${tableName}`)?.count ?? 0
      );
    },
    readAllCards() {
      return db.getAllSync<{
        knowledgeId: string;
        cardType: string;
        sortOrder: number;
        content: string;
      }>('SELECT knowledgeId, cardType, sortOrder, content FROM cards ORDER BY sortOrder');
    },
    readAllLexiconEntries() {
      return db.getAllSync<{
        surfaceForm: string;
        displayForm: string;
        definitions: string;
        ipa: string | null;
        formNote: string | null;
        audioUrl: string | null;
      }>(
        'SELECT surfaceForm, displayForm, definitions, ipa, formNote, audioUrl FROM lexicon_entries ORDER BY surfaceForm',
      );
    },
  };
}
