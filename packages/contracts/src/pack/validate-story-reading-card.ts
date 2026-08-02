import { PackVerificationError } from './errors.js';
import { CARD_TYPE_STORY_READING } from './constants.js';
import { knowledgeIdMatchesLessonCode } from './knowledge-id.js';
import { assertAllowedPackPath } from './paths.js';
import {
  parseStoryReadingContentJson,
  type StoryReadingContent,
  type StorySidebarEntry,
  type StoryWordRun,
} from './story-reading-content.js';
import type { PackCardRecord } from './verify-content.js';

export interface StoryPackCardRow {
  knowledgeId: string;
  cardType: typeof CARD_TYPE_STORY_READING;
  sortOrder: number;
  content: StoryReadingContent;
}

export function validateStoryReadingCard(
  packId: string,
  card: PackCardRecord,
  manifestPaths: ReadonlySet<string>,
): StoryPackCardRow {
  let content: StoryReadingContent;
  try {
    content = parseStoryReadingContentJson(card.content);
  } catch {
    throw new PackVerificationError(
      'PACK_CONTENT_INVALID',
      `invalid card content: ${card.knowledgeId}`,
    );
  }

  if (
    !knowledgeIdMatchesLessonCode({
      knowledgeId: card.knowledgeId,
      packId,
      lessonCode: content.lesson.code,
    })
  ) {
    throw new PackVerificationError(
      'PACK_CONTENT_INVALID',
      `knowledgeId does not match lesson code: ${card.knowledgeId}`,
    );
  }

  assertAssetReferenced(manifestPaths, content.lesson.coverImage, card.knowledgeId);
  assertAssetReferenced(manifestPaths, content.lesson.primaryAudio, card.knowledgeId);

  validateRunsSidebarConsistency(content, card.knowledgeId);

  return {
    knowledgeId: card.knowledgeId,
    cardType: CARD_TYPE_STORY_READING,
    sortOrder: card.sortOrder,
    content,
  };
}

function validateRunsSidebarConsistency(content: StoryReadingContent, knowledgeId: string): void {
  const sidebarById = new Map<string, StorySidebarEntry>();
  for (const entry of content.sidebar) {
    if (sidebarById.has(entry.vocabId)) {
      throw new PackVerificationError(
        'PACK_CONTENT_INVALID',
        `duplicate sidebar vocabId: ${entry.vocabId} (${knowledgeId})`,
      );
    }
    sidebarById.set(entry.vocabId, entry);
  }

  const referencedVocabIds = new Set<string>();

  for (const paragraph of content.story.paragraphs) {
    for (const run of paragraph.runs) {
      if (run.kind !== 'word') {
        continue;
      }
      const wordRun: StoryWordRun = run;
      const sidebarEntry = sidebarById.get(wordRun.vocabId);
      if (!sidebarEntry) {
        throw new PackVerificationError(
          'PACK_CONTENT_INVALID',
          `word run vocabId missing from sidebar: ${wordRun.vocabId} (${knowledgeId})`,
        );
      }
      if (sidebarEntry.tier !== wordRun.tier) {
        throw new PackVerificationError(
          'PACK_CONTENT_INVALID',
          `tier mismatch for vocabId ${wordRun.vocabId} (${knowledgeId})`,
        );
      }
      referencedVocabIds.add(wordRun.vocabId);
    }
  }

  for (const entry of content.sidebar) {
    if (!referencedVocabIds.has(entry.vocabId)) {
      throw new PackVerificationError(
        'PACK_CONTENT_INVALID',
        `orphan sidebar vocabId: ${entry.vocabId} (${knowledgeId})`,
      );
    }
  }
}

function assertAssetReferenced(
  manifestPaths: ReadonlySet<string>,
  assetPath: string,
  context: string,
): void {
  try {
    assertAllowedPackPath(assetPath);
  } catch {
    throw new PackVerificationError(
      'PACK_CONTENT_INVALID',
      `illegal asset path on ${context}: ${assetPath}`,
    );
  }

  if (!manifestPaths.has(assetPath)) {
    throw new PackVerificationError(
      'PACK_CONTENT_INVALID',
      `asset not listed in manifest: ${assetPath} (${context})`,
    );
  }
}
