export interface StorySourceCardShape {
  cardType: 'story_reading';
  sortOrder: number;
  content: {
    lesson: {
      code: string;
      titleEn: string;
    };
  };
}

export interface VocabularySourceCardShape {
  kind: 'word' | 'phrase';
  sortOrder: number;
  content: {
    prompt: {
      headword: string;
    };
  };
}

export type PackSourceCardShape = StorySourceCardShape | VocabularySourceCardShape;

export function isStorySourceCard(card: PackSourceCardShape): card is StorySourceCardShape {
  return 'cardType' in card;
}
