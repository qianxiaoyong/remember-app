import type { ReactElement } from 'react';
import type { ValidationIssue } from '../api/local-api-client.js';
import { StatusBanner } from '../components/status-banner.js';

interface ValidationIssuesBannerProps {
  issues: ValidationIssue[] | null;
  onDismiss: () => void;
}

export function ValidationIssuesBanner({
  issues,
  onDismiss,
}: ValidationIssuesBannerProps): ReactElement | null {
  if (issues === null) {
    return null;
  }

  return (
    <StatusBanner
      variant={issues.length === 0 ? 'success' : 'warning'}
      title={issues.length === 0 ? '校验通过' : `校验发现 ${String(issues.length)} 个问题`}
      onDismiss={onDismiss}
    >
      {issues.length > 0 && (
        <ul className="status-issue-list">
          {issues.map((issue, index) => (
            <li key={`${issue.path}-${String(index)}`}>
              {issue.sortOrder !== undefined ? `#${String(issue.sortOrder)} ` : ''}
              {issue.path}: {issue.message}
            </li>
          ))}
        </ul>
      )}
    </StatusBanner>
  );
}

interface BuildResultBannerProps {
  message: string | null;
  outputPath: string | null;
  copyHint: string | null;
  onDismiss: () => void;
  onCopyPath: () => void;
}

export function BuildResultBanner({
  message,
  outputPath,
  copyHint,
  onDismiss,
  onCopyPath,
}: BuildResultBannerProps): ReactElement | null {
  if (!message) {
    return null;
  }

  return (
    <StatusBanner variant={outputPath ? 'success' : 'error'} title={message} onDismiss={onDismiss}>
      {outputPath && (
        <div style={{ marginTop: 'var(--space-2)' }}>
          <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{outputPath}</code>
          <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCopyPath}>
              复制路径
            </button>
            {copyHint && <span style={{ fontSize: '12px' }}>{copyHint}</span>}
          </div>
        </div>
      )}
    </StatusBanner>
  );
}
