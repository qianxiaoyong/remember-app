import type {
  ImportAction,
  ImportCandidate,
  ImportCandidateStatus,
} from '../../lexicon-workbench/types.js';
import type { ReactElement } from 'react';

const STATUS_LABELS: Record<ImportCandidateStatus, string> = {
  new: '可追加',
  conflict: '冲突',
  missing: '库中无',
  unchanged: '已一致',
} as const;

interface ImportCandidateTableProps<TExisting, TIncoming> {
  candidates: ImportCandidate<TExisting, TIncoming>[];
  actionOverrides: Partial<Record<string, ImportAction>>;
  onActionChange: (surfaceForm: string, action: ImportAction) => void;
  renderExisting: (candidate: ImportCandidate<TExisting, TIncoming>) => string;
  renderIncoming: (candidate: ImportCandidate<TExisting, TIncoming>) => string;
}

export function ImportCandidateTable<TExisting, TIncoming>({
  candidates,
  actionOverrides,
  onActionChange,
  renderExisting,
  renderIncoming,
}: ImportCandidateTableProps<TExisting, TIncoming>): ReactElement {
  return (
    <div className="data-table-wrap lexicon-workbench-table-wrap">
      <table className="data-table data-table-compact">
        <thead>
          <tr>
            <th>词形</th>
            <th>状态</th>
            <th>包内现有</th>
            <th>中心词库</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => {
            const action = actionOverrides[candidate.surfaceForm] ?? candidate.defaultAction;
            const canChoose = candidate.status === 'new' || candidate.status === 'conflict';
            return (
              <tr key={candidate.surfaceForm}>
                <td>
                  <strong>{candidate.displayForm}</strong>
                  <div className="field-helper">{candidate.surfaceForm}</div>
                </td>
                <td>
                  <span
                    className={`lexicon-workbench-status lexicon-workbench-status-${candidate.status}`}
                  >
                    {STATUS_LABELS[candidate.status]}
                  </span>
                </td>
                <td className="lexicon-workbench-preview-cell">
                  {candidate.existing ? renderExisting(candidate) : '—'}
                </td>
                <td className="lexicon-workbench-preview-cell">
                  {candidate.incoming ? renderIncoming(candidate) : '—'}
                </td>
                <td>
                  {canChoose ? (
                    <select
                      className="select input-sm"
                      value={action}
                      onChange={(event) => {
                        onActionChange(candidate.surfaceForm, event.target.value as ImportAction);
                      }}
                    >
                      {candidate.status === 'new' ? (
                        <>
                          <option value="append">追加</option>
                          <option value="skip">跳过</option>
                        </>
                      ) : (
                        <>
                          <option value="replace">替换</option>
                          <option value="skip">跳过</option>
                        </>
                      )}
                    </select>
                  ) : (
                    <span className="field-helper">跳过</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
