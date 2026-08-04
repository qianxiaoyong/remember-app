import type {
  ImportAction,
  ImportCandidate,
  ImportCandidateStatus,
  ImportDecision,
  LexiconLookupResult,
  ScannedSurface,
} from './types.js';

export interface PackLexiconAdapter<TExisting, TIncoming> {
  findExisting(surfaceForm: string, existingItems: TExisting[]): TExisting | null;
  mapIncoming(
    lemma: NonNullable<ImportCandidate<TExisting, TIncoming>['lemma']>,
    scanned: ScannedSurface,
    existing: TExisting | null,
  ): TIncoming;
  entriesEqual(existing: TExisting, incoming: TIncoming): boolean;
  getEntryKey(existing: TExisting): string;
}

export interface BuildImportCandidatesInput<TExisting, TIncoming> {
  adapter: PackLexiconAdapter<TExisting, TIncoming>;
  scannedSurfaces: ScannedSurface[];
  existingItems: TExisting[];
  lookups: LexiconLookupResult[];
}

export function buildImportCandidates<TExisting, TIncoming>(
  input: BuildImportCandidatesInput<TExisting, TIncoming>,
): ImportCandidate<TExisting, TIncoming>[] {
  const { adapter, scannedSurfaces, existingItems, lookups } = input;
  const lookupByForm = new Map(lookups.map((item) => [item.surfaceForm, item.lemma]));

  return scannedSurfaces.map((scanned) => {
    const lemma = lookupByForm.get(scanned.surfaceForm) ?? null;
    const existing = adapter.findExisting(scanned.surfaceForm, existingItems);

    if (!lemma) {
      return {
        surfaceForm: scanned.surfaceForm,
        displayForm: scanned.displayForm,
        lemma: null,
        existing,
        incoming: null,
        status: 'missing',
        defaultAction: 'skip',
      };
    }

    const incoming = adapter.mapIncoming(lemma, scanned, existing);
    if (!existing) {
      return {
        surfaceForm: scanned.surfaceForm,
        displayForm: scanned.displayForm,
        lemma,
        existing: null,
        incoming,
        status: 'new',
        defaultAction: 'append',
      };
    }

    if (adapter.entriesEqual(existing, incoming)) {
      return {
        surfaceForm: scanned.surfaceForm,
        displayForm: scanned.displayForm,
        lemma,
        existing,
        incoming,
        status: 'unchanged',
        defaultAction: 'skip',
      };
    }

    return {
      surfaceForm: scanned.surfaceForm,
      displayForm: scanned.displayForm,
      lemma,
      existing,
      incoming,
      status: 'conflict',
      defaultAction: 'skip',
    };
  });
}

export function resolveImportActions<TExisting, TIncoming>(
  candidates: ImportCandidate<TExisting, TIncoming>[],
  overrides: Partial<Record<string, ImportAction>> = {},
): ImportDecision[] {
  return candidates.map((candidate) => {
    const override = overrides[candidate.surfaceForm];
    if (override) {
      return { surfaceForm: candidate.surfaceForm, action: override };
    }
    return { surfaceForm: candidate.surfaceForm, action: candidate.defaultAction };
  });
}

export function buildIncomingBySurface<TIncoming>(
  candidates: ImportCandidate<unknown, TIncoming>[],
): Map<string, TIncoming> {
  const map = new Map<string, TIncoming>();
  for (const candidate of candidates) {
    if (candidate.incoming) {
      map.set(candidate.surfaceForm, candidate.incoming);
    }
  }
  return map;
}

export function countCandidatesByStatus<TExisting, TIncoming>(
  candidates: ImportCandidate<TExisting, TIncoming>[],
): Record<ImportCandidateStatus, number> {
  return candidates.reduce(
    (counts, candidate) => {
      counts[candidate.status] += 1;
      return counts;
    },
    { new: 0, conflict: 0, missing: 0, unchanged: 0 },
  );
}
