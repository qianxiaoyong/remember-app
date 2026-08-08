import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import { getStoryParagraphLengthIssue } from '@remember/contracts';
import { readPackSource, isStorySourceCard, type PackSource } from '@remember/pack-builder/pack-source';
import { runsToPlainText } from '../utils/story-runs-markup.js';
import { getPackBuilderRoot } from './paths.js';

interface CanonicalLesson {
  lessonCode: string;
  paragraphs: string[];
}

function loadCanonical(lessonCode: string): CanonicalLesson {
  const path = join(
    getPackBuilderRoot(),
    'source',
    'primary-1000-stories',
    'canonical',
    `${lessonCode}.paragraphs.json`,
  );
  return JSON.parse(readFileSync(path, 'utf8')) as CanonicalLesson;
}

const primary1000SourceDir = join(getPackBuilderRoot(), 'source', 'primary-1000-stories');
const hasPrimary1000StoriesSource = existsSync(join(primary1000SourceDir, 'meta.json'));

describe.skipIf(!hasPrimary1000StoriesSource)('primary-1000-stories canonical English', () => {
  let source: PackSource;

  beforeAll(() => {
    source = readPackSource(primary1000SourceDir);
  });

  for (const lessonCode of [
    'C1',
    'C2',
    'C3',
    'C4',
    'C5',
    'C6',
    'C7',
    'C8',
    'C9',
    'C10',
    'C11',
    'C12',
    'C13',
    'C14',
    'C15',
    'C16',
    'C17',
    'C18',
    'C19',
    'C20',
    'C21',
    'C22',
    'C23',
    'C24',
    'C25',
    'C26',
    'C27',
    'C28',
    'C29',
    'C30',
    'C31',
    'C32',
    'C33',
    'C34',
    'C35',
    'C36',
    'C37',
    'C38',
    'C39',
    'C40',
  ] as const) {
    it(`${lessonCode} paragraphs match canonical PDF English`, () => {
      const canonical = loadCanonical(lessonCode);
      const card = source.cards.find(
        (item) => isStorySourceCard(item) && item.content.lesson.code === lessonCode,
      );
      if (!card || !isStorySourceCard(card)) {
        throw new Error(`missing story card ${lessonCode}`);
      }

      expect(card.content.story.paragraphs).toHaveLength(canonical.paragraphs.length);

      for (const [index, paragraph] of card.content.story.paragraphs.entries()) {
        const expected = canonical.paragraphs[index];
        expect(expected).toBeDefined();
        expect(runsToPlainText(paragraph.runs)).toBe(expected);
      }
    });
  }

  for (const lessonCode of [
    'C1',
    'C2',
    'C3',
    'C4',
    'C5',
    'C6',
    'C7',
    'C8',
    'C9',
    'C10',
    'C11',
    'C12',
    'C13',
    'C14',
    'C15',
    'C16',
    'C17',
    'C18',
    'C19',
    'C20',
    'C21',
    'C22',
    'C23',
    'C24',
    'C25',
    'C26',
    'C27',
    'C28',
    'C29',
    'C30',
    'C31',
    'C32',
    'C33',
    'C34',
    'C35',
    'C36',
    'C37',
    'C38',
    'C39',
    'C40',
  ] as const) {
    it(`${lessonCode} canonical paragraphs respect segment length limits`, () => {
      const canonical = loadCanonical(lessonCode);
      for (const paragraph of canonical.paragraphs) {
        expect(getStoryParagraphLengthIssue(paragraph)).toBeUndefined();
      }
    });
  }
});
