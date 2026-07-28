import {
  columnsMatchExpected,
  PACK_CARDS_COLUMNS,
  PACK_LEXICON_ENTRIES_COLUMNS,
  PACK_LEXICON_FORMS_COLUMNS,
  PACK_SQLITE_TABLES,
  type SqliteColumnInfo,
} from './sqlite-schema.js';
import { PackVerificationError } from './errors.js';

export interface PackSqliteReader {
  listTables(): string[];
  readTableInfo(tableName: string): SqliteColumnInfo[];
  countRows(tableName: string): number;
  readAllCards(): {
    knowledgeId: string;
    cardType: string;
    sortOrder: number;
    content: string;
  }[];
  readAllLexiconEntries(): {
    surfaceForm: string;
    displayForm: string;
    definitions: string;
    ipa: string | null;
    formNote: string | null;
    audioUrl: string | null;
  }[];
}

export function verifyPackSqliteStructure(reader: PackSqliteReader): void {
  const tables = new Set(reader.listTables());
  for (const tableName of PACK_SQLITE_TABLES) {
    if (!tables.has(tableName)) {
      throw new PackVerificationError('PACK_SCHEMA_INVALID', `missing table: ${tableName}`);
    }
  }

  const unexpected = [...tables].filter(
    (name) => !PACK_SQLITE_TABLES.includes(name as (typeof PACK_SQLITE_TABLES)[number]),
  );
  if (unexpected.length > 0) {
    throw new PackVerificationError(
      'PACK_SCHEMA_INVALID',
      `unexpected tables: ${unexpected.join(', ')}`,
    );
  }

  if (!columnsMatchExpected(reader.readTableInfo('cards'), PACK_CARDS_COLUMNS)) {
    throw new PackVerificationError('PACK_SCHEMA_INVALID', 'cards columns mismatch');
  }
  if (
    !columnsMatchExpected(reader.readTableInfo('lexicon_entries'), PACK_LEXICON_ENTRIES_COLUMNS)
  ) {
    throw new PackVerificationError('PACK_SCHEMA_INVALID', 'lexicon_entries columns mismatch');
  }
  if (!columnsMatchExpected(reader.readTableInfo('lexicon_forms'), PACK_LEXICON_FORMS_COLUMNS)) {
    throw new PackVerificationError('PACK_SCHEMA_INVALID', 'lexicon_forms columns mismatch');
  }

  if (reader.countRows('cards') < 1) {
    throw new PackVerificationError('PACK_SCHEMA_INVALID', 'cards table is empty');
  }
  if (reader.countRows('lexicon_entries') < 1) {
    throw new PackVerificationError('PACK_SCHEMA_INVALID', 'lexicon_entries table is empty');
  }
}

export function readPackSqliteContent(reader: PackSqliteReader): {
  cards: ReturnType<PackSqliteReader['readAllCards']>;
  lexiconEntries: ReturnType<PackSqliteReader['readAllLexiconEntries']>;
} {
  verifyPackSqliteStructure(reader);
  return {
    cards: reader.readAllCards(),
    lexiconEntries: reader.readAllLexiconEntries(),
  };
}
