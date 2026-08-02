import { CARD_TYPE_STORY_READING } from '@remember/contracts';
import { listPackCardDetails } from '../data/pack/pack-card-details';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import type { LibraryPresentation } from '../learning/card-types/types';
import { resolveCardTypeDefinition } from '../learning/card-types/registry';

export function resolvePackLibraryPresentation(packId: string): LibraryPresentation {
  const installedPack = getInstalledPack(packId);
  if (!installedPack) {
    return 'study';
  }

  const cardDetails = listPackCardDetails(installedPack.sqlitePath);
  if (cardDetails.length === 0) {
    return 'study';
  }

  const presentations = new Set<LibraryPresentation>();
  for (const card of cardDetails) {
    const definition = resolveCardTypeDefinition(card.cardType);
    presentations.add(definition?.libraryPresentation ?? 'study');
  }

  if (presentations.size === 1) {
    return presentations.values().next().value ?? 'study';
  }

  if (cardDetails.some((card) => card.cardType === CARD_TYPE_STORY_READING)) {
    return 'reader';
  }

  return 'study';
}
