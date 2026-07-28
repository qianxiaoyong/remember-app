import { normalizeSurfaceForm } from '@remember/contracts';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import {
  findLexiconEntry,
  type LexiconLookupResult,
} from '../data/repositories/lexicon-entry-repository';

export function lookupLexiconToken(input: {
  packId: string;
  token: string;
}): LexiconLookupResult | null {
  const surfaceForm = normalizeSurfaceForm(input.token);
  if (!surfaceForm) {
    return null;
  }

  const installedPack = getInstalledPack(input.packId);
  if (!installedPack) {
    throw new Error(`pack not installed: ${input.packId}`);
  }

  return findLexiconEntry(installedPack.sqlitePath, surfaceForm);
}
