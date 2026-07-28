import { parseLexiconDefinitionsJson, type LexiconEntry } from '@remember/contracts';
import { openDatabaseSync } from 'expo-sqlite';

export interface LexiconLookupResult {
  surfaceForm: string;
  displayForm: string;
  definitions: LexiconEntry['definitions'];
  ipa: string | null;
  formNote: string | null;
  audioUrl: string | null;
}

export function findLexiconEntry(
  sqlitePath: string,
  surfaceForm: string,
): LexiconLookupResult | null {
  const db = openDatabaseSync(sqlitePath);
  db.execSync('PRAGMA query_only = ON');
  const row = db.getFirstSync<{
    surfaceForm: string;
    displayForm: string;
    definitions: string;
    ipa: string | null;
    formNote: string | null;
    audioUrl: string | null;
  }>(
    `SELECT surfaceForm, displayForm, definitions, ipa, formNote, audioUrl
     FROM lexicon_entries
     WHERE surfaceForm = ?`,
    [surfaceForm],
  );
  db.closeSync();

  if (!row) {
    return null;
  }

  return {
    surfaceForm: row.surfaceForm,
    displayForm: row.displayForm,
    definitions: parseLexiconDefinitionsJson(row.definitions),
    ipa: row.ipa,
    formNote: row.formNote,
    audioUrl: row.audioUrl,
  };
}
