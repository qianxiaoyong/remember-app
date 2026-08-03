import type { StoryRun, StorySidebarEntry, StoryTextRun, StoryTier } from '@remember/contracts';

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
    return [{ kind: 'text', text: markedText }];
  }

  return mergeAdjacentTextRuns(runs);
}

export function buildPreviewSegments(runs: StoryRun[]): StoryPreviewSegment[] {
  return runs.map((run) => {
    if (isTextRun(run)) {
      return { kind: 'text', text: run.text };
    }
    return {
      kind: 'word',
      text: run.surface,
      tier: run.tier,
      vocabId: run.vocabId,
    };
  });
}

export function wrapSelectionAsWordToken(input: {
  selectedText: string;
  vocabId: string;
  sidebar: StorySidebarEntry[];
}): string {
  const surface = input.selectedText.trim();
  const entry = input.sidebar.find((item) => item.vocabId === input.vocabId);
  if (entry?.headword === surface) {
    return `[[${input.vocabId}]]`;
  }
  return `[[${surface}|${input.vocabId}]]`;
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
