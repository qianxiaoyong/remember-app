import type { SQLiteDatabase } from 'expo-sqlite';
import { openUserDatabase } from '../user-db/open-user-database';

export interface SavedLexiconItemRow {
  packId: string;
  surfaceForm: string;
  savedAt: string;
}

export function listSavedLexiconItems(
  db: SQLiteDatabase = openUserDatabase(),
): SavedLexiconItemRow[] {
  return db.getAllSync<SavedLexiconItemRow>(
    `SELECT packId, surfaceForm, savedAt
     FROM saved_lexicon_items
     ORDER BY savedAt DESC`,
  );
}

export function isLexiconItemSaved(
  packId: string,
  surfaceForm: string,
  db: SQLiteDatabase = openUserDatabase(),
): boolean {
  const row = db.getFirstSync<{ packId: string }>(
    'SELECT packId FROM saved_lexicon_items WHERE packId = ? AND surfaceForm = ?',
    [packId, surfaceForm],
  );
  return row !== null;
}

export function saveLexiconItem(
  input: { packId: string; surfaceForm: string; savedAt: string },
  db: SQLiteDatabase = openUserDatabase(),
): void {
  db.runSync(
    `INSERT INTO saved_lexicon_items (packId, surfaceForm, savedAt)
     VALUES (?, ?, ?)
     ON CONFLICT(packId, surfaceForm) DO UPDATE SET savedAt = excluded.savedAt`,
    [input.packId, input.surfaceForm, input.savedAt],
  );
}

export function removeSavedLexiconItem(
  packId: string,
  surfaceForm: string,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  db.runSync('DELETE FROM saved_lexicon_items WHERE packId = ? AND surfaceForm = ?', [
    packId,
    surfaceForm,
  ]);
}
