import type { LexiconEntry, StoryReadingContent, StorySidebarEntry } from '@remember/contracts';
import type { PackSourceCard } from '@remember/pack-builder/pack-source';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import {
  loadPackLexicon,
  lookupSurfacesInCentralLexicon,
  savePackLexicon,
} from '../../api/lexicon-api-client.js';
import { applyImportPlan } from '../../lexicon-workbench/apply-import-plan.js';
import {
  buildImportCandidates,
  buildIncomingBySurface,
  countCandidatesByStatus,
  resolveImportActions,
} from '../../lexicon-workbench/detect-conflicts.js';
import {
  scanStorySurfaces,
  scanVocabularyPackSurfaces,
} from '../../lexicon-workbench/scan-surfaces.js';
import { storySidebarAdapter } from '../../lexicon-workbench/story-sidebar-adapter.js';
import { vocabularyLexiconAdapter } from '../../lexicon-workbench/vocabulary-lexicon-adapter.js';
import type { ImportAction } from '../../lexicon-workbench/types.js';
import { ImportCandidateTable } from './import-candidate-table.js';

type WorkbenchPhase = 'loading' | 'ready' | 'applying' | 'error';

interface StoryLexiconWorkbenchDialogProps {
  mode: 'story';
  open: boolean;
  onClose: () => void;
  content: StoryReadingContent;
  onApply: (sidebar: StorySidebarEntry[]) => void;
}

interface VocabularyLexiconWorkbenchDialogProps {
  mode: 'vocabulary';
  open: boolean;
  onClose: () => void;
  packId: string;
  cards: PackSourceCard[];
  onApplied?: () => void;
}

export type LexiconWorkbenchDialogProps =
  StoryLexiconWorkbenchDialogProps | VocabularyLexiconWorkbenchDialogProps;

export function LexiconWorkbenchDialog(props: LexiconWorkbenchDialogProps): ReactElement | null {
  if (props.mode === 'story') {
    return <StoryLexiconWorkbenchDialog {...props} />;
  }
  return <VocabularyLexiconWorkbenchDialog {...props} />;
}

interface WorkbenchShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  phase: WorkbenchPhase;
  errorMessage: string | null;
  counts: ReturnType<typeof countCandidatesByStatus> | null;
  candidateCount: number;
  onApply: () => void;
  children: ReactElement | null;
}

function WorkbenchShell({
  open,
  onClose,
  title,
  subtitle,
  phase,
  errorMessage,
  counts,
  candidateCount,
  onApply,
  children,
}: WorkbenchShellProps): ReactElement | null {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && phase !== 'applying') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    panelRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, phase]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="dialog-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && phase !== 'applying') {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className="dialog-panel dialog-panel-wide lexicon-workbench-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lexicon-workbench-title"
        tabIndex={-1}
      >
        <div className="lexicon-workbench-header">
          <div>
            <h2 id="lexicon-workbench-title">{title}</h2>
            <p className="field-helper">{subtitle}</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={phase === 'applying'}
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        {phase === 'loading' && <p className="field-helper">正在扫描并查询中心词库…</p>}

        {phase === 'error' && errorMessage && (
          <p className="status-banner status-banner-error">{errorMessage}</p>
        )}

        {phase !== 'loading' && counts && (
          <div className="lexicon-workbench-summary">
            <span>可追加 {String(counts.new)}</span>
            <span>冲突 {String(counts.conflict)}</span>
            <span>库中无 {String(counts.missing)}</span>
            <span>已一致 {String(counts.unchanged)}</span>
          </div>
        )}

        {phase !== 'loading' && candidateCount === 0 && (
          <p className="field-helper">未扫描到英文词形。</p>
        )}

        {children}

        <div className="dialog-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={phase === 'applying'}
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={
              phase === 'loading' ||
              phase === 'error' ||
              candidateCount === 0 ||
              phase === 'applying'
            }
            onClick={onApply}
          >
            {phase === 'applying' ? '应用中…' : '应用到包'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StoryLexiconWorkbenchDialog({
  open,
  onClose,
  content,
  onApply,
}: StoryLexiconWorkbenchDialogProps): ReactElement | null {
  const [phase, setPhase] = useState<WorkbenchPhase>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionOverrides, setActionOverrides] = useState<Partial<Record<string, ImportAction>>>({});
  const [candidates, setCandidates] = useState<
    ReturnType<typeof buildImportCandidates<StorySidebarEntry, StorySidebarEntry>>
  >([]);

  const reload = useCallback(async (): Promise<void> => {
    const scanned = scanStorySurfaces(content);
    const lookups = await lookupSurfacesInCentralLexicon(scanned.map((item) => item.surfaceForm));
    setCandidates(
      buildImportCandidates({
        adapter: storySidebarAdapter,
        scannedSurfaces: scanned,
        existingItems: content.sidebar,
        lookups,
      }),
    );
  }, [content]);

  useEffect(() => {
    if (!open) {
      setActionOverrides({});
      setErrorMessage(null);
      return undefined;
    }
    setPhase('loading');
    void reload().then(
      () => {
        setPhase('ready');
      },
      (error: unknown) => {
        setPhase('error');
        setErrorMessage(error instanceof Error ? error.message : String(error));
      },
    );
    return undefined;
  }, [open, reload]);

  const counts = useMemo(() => countCandidatesByStatus(candidates), [candidates]);

  function handleApply(): void {
    setPhase('applying');
    try {
      const decisions = resolveImportActions(candidates, actionOverrides);
      const nextSidebar = applyImportPlan({
        adapter: storySidebarAdapter,
        existingItems: content.sidebar,
        incomingBySurface: buildIncomingBySurface(candidates),
        decisions,
      });
      onApply(nextSidebar);
      onClose();
    } catch (error: unknown) {
      setPhase('error');
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <WorkbenchShell
      open={open}
      onClose={onClose}
      title="中心词库补词"
      subtitle="扫描本课段落用词，从中心词库补全 sidebar[]"
      phase={phase}
      errorMessage={errorMessage}
      counts={phase === 'loading' ? null : counts}
      candidateCount={candidates.length}
      onApply={handleApply}
    >
      {phase !== 'loading' && candidates.length > 0 ? (
        <ImportCandidateTable
          candidates={candidates}
          actionOverrides={actionOverrides}
          onActionChange={(surfaceForm, action) => {
            setActionOverrides((current) => ({ ...current, [surfaceForm]: action }));
          }}
          renderExisting={(candidate) => {
            const entry = candidate.existing;
            if (!entry) {
              return '—';
            }
            return `${entry.headword} · ${entry.definitionZh}`;
          }}
          renderIncoming={(candidate) => {
            const entry = candidate.incoming;
            if (!entry) {
              return '—';
            }
            return `${entry.headword} · ${entry.definitionZh}`;
          }}
        />
      ) : null}
    </WorkbenchShell>
  );
}

function VocabularyLexiconWorkbenchDialog({
  open,
  onClose,
  packId,
  cards,
  onApplied,
}: VocabularyLexiconWorkbenchDialogProps): ReactElement | null {
  const [phase, setPhase] = useState<WorkbenchPhase>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionOverrides, setActionOverrides] = useState<Partial<Record<string, ImportAction>>>({});
  const [candidates, setCandidates] = useState<
    ReturnType<typeof buildImportCandidates<LexiconEntry, LexiconEntry>>
  >([]);
  const [lexicon, setLexicon] = useState<LexiconEntry[]>([]);

  const reload = useCallback(async (): Promise<void> => {
    const entries = await loadPackLexicon(packId);
    setLexicon(entries);
    const scanned = scanVocabularyPackSurfaces(cards);
    const lookups = await lookupSurfacesInCentralLexicon(scanned.map((item) => item.surfaceForm));
    setCandidates(
      buildImportCandidates({
        adapter: vocabularyLexiconAdapter,
        scannedSurfaces: scanned,
        existingItems: entries,
        lookups,
      }),
    );
  }, [packId, cards]);

  useEffect(() => {
    if (!open) {
      setActionOverrides({});
      setErrorMessage(null);
      return undefined;
    }
    setPhase('loading');
    void reload().then(
      () => {
        setPhase('ready');
      },
      (error: unknown) => {
        setPhase('error');
        setErrorMessage(error instanceof Error ? error.message : String(error));
      },
    );
    return undefined;
  }, [open, reload]);

  const counts = useMemo(() => countCandidatesByStatus(candidates), [candidates]);

  async function handleApply(): Promise<void> {
    setPhase('applying');
    try {
      const decisions = resolveImportActions(candidates, actionOverrides);
      const nextLexicon = applyImportPlan({
        adapter: vocabularyLexiconAdapter,
        existingItems: lexicon,
        incomingBySurface: buildIncomingBySurface(candidates),
        decisions,
      });
      await savePackLexicon(packId, nextLexicon);
      onApplied?.();
      onClose();
    } catch (error: unknown) {
      setPhase('error');
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <WorkbenchShell
      open={open}
      onClose={onClose}
      title="中心词库补词"
      subtitle="扫描全包例句用词，补全 lexicon.json"
      phase={phase}
      errorMessage={errorMessage}
      counts={phase === 'loading' ? null : counts}
      candidateCount={candidates.length}
      onApply={() => {
        void handleApply();
      }}
    >
      {phase !== 'loading' && candidates.length > 0 ? (
        <ImportCandidateTable
          candidates={candidates}
          actionOverrides={actionOverrides}
          onActionChange={(surfaceForm, action) => {
            setActionOverrides((current) => ({ ...current, [surfaceForm]: action }));
          }}
          renderExisting={(candidate) => {
            const entry = candidate.existing;
            if (!entry) {
              return '—';
            }
            return `${entry.displayForm} · ${entry.definitions[0]?.text ?? ''}`;
          }}
          renderIncoming={(candidate) => {
            const entry = candidate.incoming;
            if (!entry) {
              return '—';
            }
            return `${entry.displayForm} · ${entry.definitions[0]?.text ?? ''}`;
          }}
        />
      ) : null}
    </WorkbenchShell>
  );
}
