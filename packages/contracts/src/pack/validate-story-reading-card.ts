import { PackVerificationError } from './errors.js';
import { CARD_TYPE_STORY_READING } from './constants.js';
import { knowledgeIdMatchesLessonCode } from './knowledge-id.js';
import { assertAllowedPackPath } from './paths.js';
import {
  parseStoryReadingContentJson,
  type StoryParagraph,
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

export interface StoryReadingValidateContext {
  primaryAudioDurationMs?: number;
}

export function validateStoryReadingCard(
  packId: string,
  card: PackCardRecord,
  manifestPaths: ReadonlySet<string>,
  context?: StoryReadingValidateContext,
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
  validateParagraphTimeline(
    content.story.paragraphs,
    card.knowledgeId,
    context?.primaryAudioDurationMs,
  );
  validateParagraphTranslations(content.story.paragraphs, card.knowledgeId);

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

function validateParagraphTimeline(
  paragraphs: StoryParagraph[],
  knowledgeId: string,
  primaryAudioDurationMs?: number,
): void {
  const hasAnyTimeline = paragraphs.some(
    (paragraph) => paragraph.audioStartMs !== undefined || paragraph.audioEndMs !== undefined,
  );
  if (!hasAnyTimeline) {
    return;
  }

  let previousEndMs = 0;
  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    if (paragraph === undefined) {
      continue;
    }
    if (paragraph.audioStartMs === undefined || paragraph.audioEndMs === undefined) {
      throw new PackVerificationError(
        'PACK_CONTENT_INVALID',
        `paragraph ${String(index)} missing audio timeline (${knowledgeId})`,
      );
    }

    if (index > 0 && paragraph.audioStartMs < previousEndMs) {
      throw new PackVerificationError(
        'PACK_CONTENT_INVALID',
        `paragraph ${String(index)} audioStartMs overlaps previous segment (${knowledgeId})`,
      );
    }

    previousEndMs = paragraph.audioEndMs;
  }

  if (primaryAudioDurationMs !== undefined && previousEndMs > primaryAudioDurationMs) {
    throw new PackVerificationError(
      'PACK_CONTENT_INVALID',
      `last paragraph audioEndMs exceeds primary audio duration (${knowledgeId})`,
    );
  }
}

function validateParagraphTranslations(
  paragraphs: StoryParagraph[],
  knowledgeId: string,
): void {
  const hasAnyTranslation = paragraphs.some(
    (paragraph) => paragraph.translationZh !== undefined,
  );
  if (!hasAnyTranslation) {
    return;
  }

  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    if (paragraph === undefined) {
      continue;
    }
    if (paragraph.translationZh === undefined) {
      throw new PackVerificationError(
        'PACK_CONTENT_INVALID',
        `paragraph ${String(index)} missing translationZh (${knowledgeId})`,
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
