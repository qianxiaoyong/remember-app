import type { AdminLexiconDetail, LexiconEntry } from '@remember/contracts';
import type { ScannedSurface } from './types.js';
import type { PackLexiconAdapter } from './detect-conflicts.js';
import {
  pickDefinitionZhList,
  pickMorphologyNote,
  resolveLemmaDisplayForm,
} from './map-central-lemma.js';

function lexiconContentKey(entry: LexiconEntry): string {
  return JSON.stringify({
    displayForm: entry.displayForm.trim(),
    definitions: entry.definitions,
    ipa: entry.ipa?.trim() ?? '',
    formNote: entry.formNote?.trim() ?? '',
    audioUrl: entry.audioUrl ?? '',
  });
}

export function mapLemmaToLexiconEntry(
  lemma: AdminLexiconDetail,
  scanned: ScannedSurface,
): LexiconEntry {
  const definitions = pickDefinitionZhList(lemma);
  const displayForm = resolveLemmaDisplayForm(lemma, scanned.surfaceForm, scanned.displayForm);
  const formNote = pickMorphologyNote(lemma);
  const ipa = lemma.ipa?.trim();

  const entry: LexiconEntry = {
    surfaceForm: scanned.surfaceForm,
    displayForm,
    definitions:
      definitions.length > 0
        ? definitions
        : [{ text: lemma.headword, ...(lemma.pos ? { pos: lemma.pos } : {}) }],
  };

  if (ipa) {
    entry.ipa = ipa;
  }
  if (formNote) {
    entry.formNote = formNote;
  }

  return entry;
}

export const vocabularyLexiconAdapter: PackLexiconAdapter<LexiconEntry, LexiconEntry> = {
  findExisting(surfaceForm, existingItems) {
    return existingItems.find((entry) => entry.surfaceForm === surfaceForm) ?? null;
  },
  mapIncoming(lemma, scanned) {
    return mapLemmaToLexiconEntry(lemma, scanned);
  },
  entriesEqual(existing, incoming) {
    return lexiconContentKey(existing) === lexiconContentKey(incoming);
  },
  getEntryKey(entry) {
    return entry.surfaceForm;
  },
};
