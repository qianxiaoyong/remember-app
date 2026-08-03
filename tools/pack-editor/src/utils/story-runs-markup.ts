import type {
  StoryRun,
  StorySidebarEntry,
  StoryTextRun,
  StoryTier,
  StoryWordRun,
} from '@remember/contracts';
import { findLostWordAnchors, StoryRunsSyncError } from './story-word-anchors.js';

export { StoryRunsSyncError } from './story-word-anchors.js';

const WORD_TOKEN_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export interface StoryPreviewSegment {
  kind: 'text' | 'word';
  text: string;
  tier?: StoryTier;
  vocabId?: string;
}

function sidebarById(sidebar: StorySidebarEntry[]): Map<string, StorySidebarEntry> {
  return new Map(sidebar.map((entry) => [entry.vocabId, entry]));
}

function isTextRun(run: StoryRun): run is StoryTextRun {
  return run.kind === 'text';
}

function runPlainLength(run: StoryRun): number {
  return isTextRun(run) ? run.text.length : run.surface.length;
}

function runTextPiece(run: StoryRun): string {
  return isTextRun(run) ? run.text : run.surface;
}

function needsSpaceBetweenRuns(left: StoryRun, right: StoryRun): boolean {
  const leftText = runTextPiece(left);
  const rightText = runTextPiece(right);
  if (!leftText || !rightText) {
    return false;
  }
  const leftEnd = leftText.at(-1) ?? '';
  const rightStart = rightText.at(0) ?? '';
  if (/\s/.test(leftEnd) || /\s/.test(rightStart)) {
    return false;
  }
  if (/^[.,!?;:)\]'"]/.test(rightText)) {
    return false;
  }
  const lastChar = leftText.at(-1) ?? '';
  if (
    lastChar === '(' ||
    lastChar === "'" ||
    lastChar === '"' ||
    lastChar === '[' ||
    lastChar === '{'
  ) {
    return false;
  }
  if (!isTextRun(left) && !isTextRun(right)) {
    return true;
  }
  return /[a-zA-Z0-9]$/.test(leftText) && /^[a-zA-Z0-9]/.test(rightText);
}

export function runsToPlainText(runs: StoryRun[]): string {
  let result = '';
  for (let index = 0; index < runs.length; index += 1) {
    const run = runs[index];
    if (run === undefined) {
      continue;
    }
    const piece = runTextPiece(run);
    const previous = index > 0 ? runs[index - 1] : undefined;
    if (previous !== undefined && needsSpaceBetweenRuns(previous, run)) {
      result += ' ';
    }
    result += piece;
  }
  return result;
}

export function collectVocabIdsFromRuns(runs: StoryRun[]): string[] {
  const ids: string[] = [];
  for (const run of runs) {
    if (!isTextRun(run) && !ids.includes(run.vocabId)) {
      ids.push(run.vocabId);
    }
  }
  return ids;
}

export function runsToMarkedText(runs: StoryRun[], sidebar: StorySidebarEntry[]): string {
  const lookup = sidebarById(sidebar);
  return runs
    .map((run) => {
      if (isTextRun(run)) {
        return run.text;
      }
      const entry = lookup.get(run.vocabId);
      if (entry?.headword === run.surface) {
        return `[[${run.vocabId}]]`;
      }
      return `[[${run.surface}|${run.vocabId}]]`;
    })
    .join('');
}

export function markedTextToRuns(markedText: string, sidebar: StorySidebarEntry[]): StoryRun[] {
  const lookup = sidebarById(sidebar);
  const runs: StoryRun[] = [];
  let lastIndex = 0;

  for (const match of markedText.matchAll(WORD_TOKEN_PATTERN)) {
    const matchIndex = match.index;
    const plain = markedText.slice(lastIndex, matchIndex);
    if (plain) {
      appendTextRun(runs, plain);
    }

    const partA = match[1]?.trim() ?? '';
    const partB = match[2]?.trim();
    if (partB) {
      appendWordRun(runs, { surface: partA, vocabId: partB, lookup });
    } else {
      appendWordRunFromVocabId(runs, partA, lookup);
    }
    lastIndex = matchIndex + match[0].length;
  }

  const tail = markedText.slice(lastIndex);
  if (tail) {
    appendTextRun(runs, tail);
  }

  if (runs.length === 0) {
    return [{ kind: 'text', text: markedText || ' ' }];
  }

  return mergeAdjacentTextRuns(runs);
}

export function syncRunsToPlainText(
  oldRuns: StoryRun[],
  newPlain: string,
  sidebar: StorySidebarEntry[],
): StoryRun[] {
  const wordRuns = oldRuns.filter((run): run is StoryWordRun => !isTextRun(run));
  if (wordRuns.length === 0) {
    return [{ kind: 'text', text: newPlain || ' ' }];
  }

  const lost = findLostWordAnchors(wordRuns, newPlain);
  if (lost.length > 0) {
    throw new StoryRunsSyncError(lost);
  }

  return rebuildRunsFromWordAnchors(wordRuns, newPlain, sidebar);
}

function rebuildRunsFromWordAnchors(
  wordRuns: StoryWordRun[],
  plain: string,
  sidebar: StorySidebarEntry[],
): StoryRun[] {
  let cursor = 0;
  const result: StoryRun[] = [];
  for (const word of wordRuns) {
    const idx = plain.indexOf(word.surface, cursor);
    if (idx === -1) {
      throw new StoryRunsSyncError([word]);
    }
    if (idx > cursor) {
      appendTextRun(result, plain.slice(cursor, idx));
    }
    const entry = sidebar.find((item) => item.vocabId === word.vocabId);
    result.push({
      kind: 'word',
      surface: word.surface,
      vocabId: word.vocabId,
      glossZh: entry?.definitionZh ?? word.glossZh,
      tier: entry?.tier ?? word.tier,
    });
    cursor = idx + word.surface.length;
  }
  if (cursor < plain.length) {
    appendTextRun(result, plain.slice(cursor));
  }

  if (result.length === 0) {
    return [{ kind: 'text', text: plain || ' ' }];
  }
  return mergeAdjacentTextRuns(result);
}

export function applyWordMarkAtSelection(input: {
  runs: StoryRun[];
  selectionStart: number;
  selectionEnd: number;
  vocabId: string;
  sidebar: StorySidebarEntry[];
}): StoryRun[] {
  const plain = runsToPlainText(input.runs);
  const selected = plain.slice(input.selectionStart, input.selectionEnd);
  if (!selected.trim()) {
    return input.runs;
  }

  const before = sliceRunsByPlainRange(input.runs, 0, input.selectionStart);
  const after = sliceRunsByPlainRange(input.runs, input.selectionEnd, plain.length);
  const entry = input.sidebar.find((item) => item.vocabId === input.vocabId);
  const wordRun: StoryWordRun = {
    kind: 'word',
    surface: selected,
    vocabId: input.vocabId,
    glossZh: entry?.definitionZh ?? selected,
    tier: entry?.tier ?? 'high',
  };
  return mergeAdjacentTextRuns([...before, wordRun, ...after]);
}

export function unmarkVocabInRuns(runs: StoryRun[], vocabId: string): StoryRun[] {
  const result: StoryRun[] = [];
  for (const run of runs) {
    if (!isTextRun(run) && run.vocabId === vocabId) {
      appendTextRun(result, run.surface);
      continue;
    }
    result.push(run);
  }
  return mergeAdjacentTextRuns(result);
}

export function buildPreviewSegments(runs: StoryRun[]): StoryPreviewSegment[] {
  const segments: StoryPreviewSegment[] = [];
  for (let index = 0; index < runs.length; index += 1) {
    const run = runs[index];
    if (run === undefined) {
      continue;
    }
    const previous = index > 0 ? runs[index - 1] : undefined;
    if (previous !== undefined && needsSpaceBetweenRuns(previous, run)) {
      segments.push({ kind: 'text', text: ' ' });
    }
    if (isTextRun(run)) {
      segments.push({ kind: 'text', text: run.text });
      continue;
    }
    segments.push({
      kind: 'word',
      text: run.surface,
      tier: run.tier,
      vocabId: run.vocabId,
    });
  }
  return segments;
}

function plainContributionLength(runs: StoryRun[], index: number): number {
  const run = runs[index];
  if (run === undefined) {
    return 0;
  }
  let length = runTextPiece(run).length;
  const previous = index > 0 ? runs[index - 1] : undefined;
  if (previous !== undefined && needsSpaceBetweenRuns(previous, run)) {
    length += 1;
  }
  return length;
}

function plainOffsetBeforeRun(runs: StoryRun[], index: number): number {
  let offset = 0;
  for (let runIndex = 0; runIndex < index; runIndex += 1) {
    offset += plainContributionLength(runs, runIndex);
  }
  return offset;
}

function sliceRunsByPlainRange(runs: StoryRun[], rangeStart: number, rangeEnd: number): StoryRun[] {
  const result: StoryRun[] = [];
  for (let index = 0; index < runs.length; index += 1) {
    const run = runs[index];
    if (run === undefined) {
      continue;
    }
    const runStart = plainOffsetBeforeRun(runs, index);
    const runEnd = runStart + plainContributionLength(runs, index);

    if (runEnd <= rangeStart || runStart >= rangeEnd) {
      continue;
    }

    const previous = index > 0 ? runs[index - 1] : undefined;
    const hasLeadingSpace = previous !== undefined && needsSpaceBetweenRuns(previous, run);
    const contentStart = runStart + (hasLeadingSpace ? 1 : 0);
    const contentLength = runPlainLength(run);
    const effectiveRangeStart = Math.max(rangeStart, contentStart);
    const effectiveRangeEnd = Math.min(rangeEnd, contentStart + contentLength);

    if (effectiveRangeStart >= effectiveRangeEnd) {
      continue;
    }

    const sliceStart = effectiveRangeStart - contentStart;
    const sliceEnd = effectiveRangeEnd - contentStart;

    if (isTextRun(run)) {
      const text = run.text.slice(sliceStart, sliceEnd);
      if (text) {
        appendTextRun(result, text);
      }
      continue;
    }

    if (sliceStart === 0 && sliceEnd === contentLength) {
      result.push({ ...run });
    } else {
      appendTextRun(result, run.surface.slice(sliceStart, sliceEnd));
    }
  }
  return mergeAdjacentTextRuns(result);
}

function appendTextRun(runs: StoryRun[], text: string): void {
  if (!text) {
    return;
  }
  const last = runs.at(-1);
  if (last !== undefined && isTextRun(last)) {
    last.text += text;
    return;
  }
  runs.push({ kind: 'text', text });
}

function appendWordRun(
  runs: StoryRun[],
  input: {
    surface: string;
    vocabId: string;
    lookup: Map<string, StorySidebarEntry>;
  },
): void {
  const entry = input.lookup.get(input.vocabId);
  runs.push({
    kind: 'word',
    surface: input.surface,
    vocabId: input.vocabId,
    glossZh: entry?.definitionZh ?? input.surface,
    tier: entry?.tier ?? 'high',
  });
}

function appendWordRunFromVocabId(
  runs: StoryRun[],
  vocabId: string,
  lookup: Map<string, StorySidebarEntry>,
): void {
  const entry = lookup.get(vocabId);
  runs.push({
    kind: 'word',
    surface: entry?.headword ?? vocabId,
    vocabId,
    glossZh: entry?.definitionZh ?? vocabId,
    tier: entry?.tier ?? 'high',
  });
}

function mergeAdjacentTextRuns(runs: StoryRun[]): StoryRun[] {
  const merged: StoryRun[] = [];
  for (const run of runs) {
    if (isTextRun(run)) {
      const last = merged.at(-1);
      if (last !== undefined && isTextRun(last)) {
        last.text += run.text;
        continue;
      }
    }
    merged.push(run);
  }
  return merged;
}
