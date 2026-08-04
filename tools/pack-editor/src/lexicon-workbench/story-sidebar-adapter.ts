import type {
  AdminLexiconDetail,
  StoryReadingContent,
  StorySidebarEntry,
} from '@remember/contracts';
import { normalizeSurfaceForm } from '@remember/contracts';
import type { ScannedSurface } from './types.js';
import type { PackLexiconAdapter } from './detect-conflicts.js';
import {
  pickPrimaryDefinitionZh,
  pickPrimaryPos,
  resolveLemmaDisplayForm,
} from './map-central-lemma.js';

const PLACEHOLDER_IPA = '—';
const PLACEHOLDER_POS = '—';

function normalizeHeadword(value: string): string {
  return value.trim().toLowerCase();
}

function sidebarContentKey(entry: Pick<StorySidebarEntry, 'definitionZh' | 'ipa' | 'pos'>): string {
  return JSON.stringify({
    definitionZh: entry.definitionZh.trim(),
    ipa: entry.ipa.trim(),
    pos: entry.pos.trim(),
  });
}

export function findStorySidebarBySurface(
  sidebar: StorySidebarEntry[],
  surfaceForm: string,
): StorySidebarEntry | null {
  const normalizedSurface = normalizeSurfaceForm(surfaceForm) ?? surfaceForm;
  for (const entry of sidebar) {
    if (normalizeHeadword(entry.vocabId) === normalizedSurface) {
      return entry;
    }
    if (normalizeHeadword(entry.headword) === normalizedSurface) {
      return entry;
    }
  }
  return null;
}

export function mapLemmaToStorySidebar(
  lemma: AdminLexiconDetail,
  scanned: ScannedSurface,
  existing: StorySidebarEntry | null,
): StorySidebarEntry {
  const definitionZh = pickPrimaryDefinitionZh(lemma);
  const pos = pickPrimaryPos(lemma) ?? PLACEHOLDER_POS;
  const ipa = lemma.ipa?.trim() ?? PLACEHOLDER_IPA;
  const headword = resolveLemmaDisplayForm(lemma, scanned.surfaceForm, scanned.displayForm);
  const vocabId = existing?.vocabId ?? lemma.lemmaKey;

  return {
    vocabId,
    headword,
    ipa,
    pos,
    definitionZh,
    tier: existing?.tier ?? 'normal',
  };
}

export const storySidebarAdapter: PackLexiconAdapter<StorySidebarEntry, StorySidebarEntry> = {
  findExisting(surfaceForm, existingItems) {
    return findStorySidebarBySurface(existingItems, surfaceForm);
  },
  mapIncoming(lemma, scanned, existing) {
    return mapLemmaToStorySidebar(lemma, scanned, existing);
  },
  entriesEqual(existing, incoming) {
    return sidebarContentKey(existing) === sidebarContentKey(incoming);
  },
  getEntryKey(entry) {
    return normalizeHeadword(entry.vocabId);
  },
};

export function applyStoryImportPlan(
  content: StoryReadingContent,
  sidebar: StorySidebarEntry[],
): StoryReadingContent {
  return {
    ...content,
    sidebar,
  };
}
