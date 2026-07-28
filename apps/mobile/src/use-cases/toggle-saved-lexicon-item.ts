import { openUserDatabase } from '../data/user-db/open-user-database';
import {
  isLexiconItemSaved,
  listSavedLexiconItems,
  removeSavedLexiconItem,
  saveLexiconItem,
  type SavedLexiconItemRow,
} from '../data/repositories/saved-lexicon-repository';

export function listSavedLexiconItemsUseCase(): SavedLexiconItemRow[] {
  return listSavedLexiconItems();
}

export function isLexiconItemSavedUseCase(packId: string, surfaceForm: string): boolean {
  return isLexiconItemSaved(packId, surfaceForm);
}

export function toggleSavedLexiconItem(input: {
  packId: string;
  surfaceForm: string;
  now?: Date;
}): boolean {
  const now = input.now ?? new Date();
  const db = openUserDatabase();
  const saved = isLexiconItemSaved(input.packId, input.surfaceForm, db);
  if (saved) {
    removeSavedLexiconItem(input.packId, input.surfaceForm, db);
    return false;
  }
  saveLexiconItem(
    { packId: input.packId, surfaceForm: input.surfaceForm, savedAt: now.toISOString() },
    db,
  );
  return true;
}
