import type { AdminLexiconDetail } from '@remember/contracts';

export type ImportAction = 'append' | 'replace' | 'skip';

export type ImportCandidateStatus = 'new' | 'conflict' | 'missing' | 'unchanged';

export interface ScannedSurface {
  surfaceForm: string;
  displayForm: string;
}

export interface ImportCandidate<TExisting, TIncoming> {
  surfaceForm: string;
  displayForm: string;
  lemma: AdminLexiconDetail | null;
  existing: TExisting | null;
  incoming: TIncoming | null;
  status: ImportCandidateStatus;
  defaultAction: ImportAction;
}

export interface ImportDecision {
  surfaceForm: string;
  action: ImportAction;
}

export interface LexiconLookupResult {
  surfaceForm: string;
  lemma: AdminLexiconDetail | null;
}
