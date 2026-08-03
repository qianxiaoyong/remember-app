import type { PackSourceStoryCard } from '@remember/pack-builder/pack-source';

export function suggestNextLessonCode(existingCodes: string[]): string {
  const numbers = existingCodes
    .map((code) => /^C(\d+)$/i.exec(code.trim())?.[1])
    .filter((value): value is string => value !== undefined)
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value));

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `C${String(next)}`;
}

export function createStoryCardTemplate(input: {
  sortOrder: number;
  lessonCode: string;
}): PackSourceStoryCard {
  const lessonCode = input.lessonCode.trim();

  return {
    cardType: 'story_reading',
    sortOrder: input.sortOrder,
    content: {
      lesson: {
        code: lessonCode,
        titleEn: 'New Lesson',
        titleZh: '新课',
        coverImage: 'assets/images/placeholder.png',
        primaryAudio: 'assets/audio/placeholder.mp3',
      },
      story: {
        paragraphs: [
          {
            runs: [{ kind: 'text', text: 'Paragraph one.' }],
            audioStartMs: 0,
            audioEndMs: 5000,
          },
        ],
      },
      sidebar: [],
    },
  };
}
