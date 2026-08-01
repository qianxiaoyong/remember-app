import type { ReactElement } from 'react';

interface LoadingStateProps {
  rows?: number;
}

export function LoadingState({ rows = 5 }: LoadingStateProps): ReactElement {
  return (
    <div className="loading-state" aria-busy="true" aria-label="加载中">
      <div className="loading-skeleton card-panel">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="skeleton-row" />
        ))}
      </div>
    </div>
  );
}
