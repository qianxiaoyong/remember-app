import {
  normalizeSurfaceForm,
  tokenizeEnglishSentence,
  type StoryReadingContent,
} from '@remember/contracts';
import type { PackSourceCard } from '@remember/pack-builder/pack-source';
import { isStorySourceCard } from '../utils/is-story-source-card.js';
import type { ScannedSurface } from './types.js';

function upsertSurface(byForm: Map<string, ScannedSurface>, token: string): void {
  const surfaceForm = normalizeSurfaceForm(token);
  if (!surfaceForm || byForm.has(surfaceForm)) {
    return;
  }
  byForm.set(surfaceForm, { surfaceForm, displayForm: token });
}

export function scanStorySurfaces(content: StoryReadingContent): ScannedSurface[] {
  const byForm = new Map<string, ScannedSurface>();

  for (const paragraph of content.story.paragraphs) {
    for (const run of paragraph.runs) {
      if (run.kind === 'word') {
        upsertSurface(byForm, run.surface);
        continue;
      }
      for (const token of tokenizeEnglishSentence(run.text)) {
        upsertSurface(byForm, token);
      }
    }
  }

  return [...byForm.values()].sort((left, right) =>
    left.surfaceForm.localeCompare(right.surfaceForm),
  );
}

export function scanVocabularyPackSurfaces(cards: PackSourceCard[]): ScannedSurface[] {
  const byForm = new Map<string, ScannedSurface>();

  for (const card of cards) {
    if (isStorySourceCard(card)) {
      continue;
    }
    upsertSurface(byForm, card.content.prompt.headword);
    for (const example of card.content.reveal.examples) {
      for (const token of tokenizeEnglishSentence(example.en)) {
        upsertSurface(byForm, token);
      }
    }
  }

  return [...byForm.values()].sort((left, right) =>
    left.surfaceForm.localeCompare(right.surfaceForm),
  );
}
