import type { ReactElement } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps): ReactElement {
  return (
    <div className="empty-state">
      <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
        {title}
      </p>
      {description && <p>{description}</p>}
    </div>
  );
}
