export const PACK_SQLITE_TABLES = ['cards', 'lexicon_entries', 'lexicon_forms'] as const;

export const PACK_CARDS_COLUMNS = [
  { name: 'knowledgeId', type: 'TEXT', notNull: true, pk: true },
  { name: 'cardType', type: 'TEXT', notNull: true, pk: false },
  { name: 'sortOrder', type: 'INTEGER', notNull: true, pk: false },
  { name: 'content', type: 'TEXT', notNull: true, pk: false },
] as const;

export const PACK_LEXICON_ENTRIES_COLUMNS = [
  { name: 'surfaceForm', type: 'TEXT', notNull: true, pk: true },
  { name: 'displayForm', type: 'TEXT', notNull: true, pk: false },
  { name: 'definitions', type: 'TEXT', notNull: true, pk: false },
  { name: 'ipa', type: 'TEXT', notNull: false, pk: false },
  { name: 'formNote', type: 'TEXT', notNull: false, pk: false },
  { name: 'audioUrl', type: 'TEXT', notNull: false, pk: false },
] as const;

export const PACK_LEXICON_FORMS_COLUMNS = [
  { name: 'aliasForm', type: 'TEXT', notNull: true, pk: true },
  { name: 'surfaceForm', type: 'TEXT', notNull: true, pk: false },
] as const;

export interface SqliteColumnInfo {
  name: string;
  type: string;
  notnull: number;
  pk: number;
}

export function columnsMatchExpected(
  actual: SqliteColumnInfo[],
  expected: readonly { name: string; type: string; notNull: boolean; pk: boolean }[],
): boolean {
  if (actual.length !== expected.length) {
    return false;
  }

  for (let index = 0; index < expected.length; index += 1) {
    const exp = expected[index];
    const col = actual[index];
    if (!exp || !col) {
      return false;
    }
    if (col.name !== exp.name || col.type !== exp.type) {
      return false;
    }
    if (Boolean(col.notnull) !== exp.notNull) {
      return false;
    }
    if (Boolean(col.pk) !== exp.pk) {
      return false;
    }
  }

  return true;
}

export const CREATE_PACK_SQLITE_SQL = `
CREATE TABLE cards (
  knowledgeId TEXT NOT NULL PRIMARY KEY,
  cardType TEXT NOT NULL,
  sortOrder INTEGER NOT NULL UNIQUE,
  content TEXT NOT NULL
);
CREATE INDEX idx_cards_sort_order ON cards (sortOrder);

CREATE TABLE lexicon_entries (
  surfaceForm TEXT NOT NULL PRIMARY KEY,
  displayForm TEXT NOT NULL,
  definitions TEXT NOT NULL,
  ipa TEXT,
  formNote TEXT,
  audioUrl TEXT
);

CREATE TABLE lexicon_forms (
  aliasForm TEXT NOT NULL PRIMARY KEY,
  surfaceForm TEXT NOT NULL,
  FOREIGN KEY (surfaceForm) REFERENCES lexicon_entries (surfaceForm)
);
`.trim();
