import type { StoryParagraph, StoryReadingContent, StoryWordRun } from '@remember/contracts';
import type { PackSourceStoryCard } from '@remember/pack-builder/pack-source';

export interface StoryContentIssue {
  path: string;
  message: string;
}

export function collectStoryContentIssues(
  content: StoryReadingContent,
  options?: { primaryAudioDurationMs?: number },
): StoryContentIssue[] {
  const issues: StoryContentIssue[] = [];
  issues.push(...collectSidebarIssues(content));
  issues.push(...collectTimelineIssues(content.story.paragraphs, options?.primaryAudioDurationMs));
  issues.push(...collectTranslationIssues(content.story.paragraphs));
  return issues;
}

function collectSidebarIssues(content: StoryReadingContent): StoryContentIssue[] {
  const issues: StoryContentIssue[] = [];
  const sidebarById = new Map(content.sidebar.map((entry) => [entry.vocabId, entry]));
  const referencedVocabIds = new Set<string>();

  for (const [paragraphIndex, paragraph] of content.story.paragraphs.entries()) {
    for (const [runIndex, run] of paragraph.runs.entries()) {
      if (run.kind !== 'word') {
        continue;
      }
      const wordRun: StoryWordRun = run;
      const sidebarEntry = sidebarById.get(wordRun.vocabId);
      if (!sidebarEntry) {
        issues.push({
          path: `story.paragraphs[${String(paragraphIndex)}].runs[${String(runIndex)}].vocabId`,
          message: `word run vocabId missing from sidebar: ${wordRun.vocabId}`,
        });
        continue;
      }
      if (sidebarEntry.tier !== wordRun.tier) {
        issues.push({
          path: `story.paragraphs[${String(paragraphIndex)}].runs[${String(runIndex)}].tier`,
          message: `tier mismatch for vocabId ${wordRun.vocabId}`,
        });
      }
      referencedVocabIds.add(wordRun.vocabId);
    }
  }

  for (const [index, entry] of content.sidebar.entries()) {
    if (!referencedVocabIds.has(entry.vocabId)) {
      issues.push({
        path: `sidebar[${String(index)}].vocabId`,
        message: `orphan sidebar vocabId: ${entry.vocabId}`,
      });
    }
  }

  return issues;
}

function collectTimelineIssues(
  paragraphs: StoryParagraph[],
  primaryAudioDurationMs?: number,
): StoryContentIssue[] {
  const issues: StoryContentIssue[] = [];
  let previousEndMs = 0;
  let seenStarted = false;
  let seenGapAfterStart = false;

  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    if (paragraph === undefined) {
      continue;
    }

    const hasStart = paragraph.audioStartMs !== undefined;
    const hasEnd = paragraph.audioEndMs !== undefined;

    if (!hasStart && !hasEnd) {
      if (seenStarted) {
        seenGapAfterStart = true;
      }
      continue;
    }

    if (hasStart !== hasEnd) {
      issues.push({
        path: `story.paragraphs[${String(index)}]`,
        message: 'paragraph timeline must set both start and end together',
      });
      continue;
    }

    if (seenGapAfterStart) {
      issues.push({
        path: `story.paragraphs[${String(index)}].audioStartMs`,
        message: 'segment starts must be marked in order from segment 1',
      });
    }

    if (seenStarted && index > 0) {
      const previousParagraph = paragraphs[index - 1];
      if (previousParagraph?.audioStartMs === undefined) {
        issues.push({
          path: `story.paragraphs[${String(index)}].audioStartMs`,
          message: 'segment starts must be marked in order from segment 1',
        });
      }
    }

    seenStarted = true;

    if (paragraph.audioStartMs === undefined || paragraph.audioEndMs === undefined) {
      continue;
    }

    if (index > 0 && paragraph.audioStartMs < previousEndMs) {
      issues.push({
        path: `story.paragraphs[${String(index)}].audioStartMs`,
        message: 'audioStartMs overlaps previous segment',
      });
    }

    if (paragraph.audioEndMs <= paragraph.audioStartMs) {
      issues.push({
        path: `story.paragraphs[${String(index)}].audioEndMs`,
        message: 'audioEndMs must be greater than audioStartMs',
      });
    }

    previousEndMs = paragraph.audioEndMs;
  }

  if (primaryAudioDurationMs !== undefined && previousEndMs > primaryAudioDurationMs) {
    issues.push({
      path: `story.paragraphs[${String(paragraphs.length - 1)}].audioEndMs`,
      message: 'last paragraph audioEndMs exceeds primary audio duration',
    });
  }

  return issues;
}

function collectTranslationIssues(paragraphs: StoryParagraph[]): StoryContentIssue[] {
  const issues: StoryContentIssue[] = [];
  const hasAnyTranslation = paragraphs.some((paragraph) => paragraph.translationZh !== undefined);
  if (!hasAnyTranslation) {
    return issues;
  }

  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    if (paragraph === undefined) {
      continue;
    }
    if (paragraph.translationZh === undefined) {
      issues.push({
        path: `story.paragraphs[${String(index)}].translationZh`,
        message: 'paragraph missing translationZh',
      });
    }
  }

  return issues;
}

export function collectStoryCardIssues(
  card: PackSourceStoryCard,
  options?: { primaryAudioDurationMs?: number },
): StoryContentIssue[] {
  return collectStoryContentIssues(card.content, options);
}
