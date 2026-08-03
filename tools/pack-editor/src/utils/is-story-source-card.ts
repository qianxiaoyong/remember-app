import type { PackSourceCard, PackSourceStoryCard } from '@remember/pack-builder/pack-source';

export function isStorySourceCard(card: PackSourceCard): card is PackSourceStoryCard {
  return 'cardType' in card;
}

export type { PackSourceCard, PackSourceStoryCard };
