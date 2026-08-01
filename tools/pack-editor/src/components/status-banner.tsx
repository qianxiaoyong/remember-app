import type { ReactElement, ReactNode } from 'react';

type StatusBannerVariant = 'success' | 'warning' | 'error';

interface StatusBannerProps {
  variant: StatusBannerVariant;
  title: string;
  children?: ReactNode;
  onDismiss?: () => void;
}

export function StatusBanner({
  variant,
  title,
  children,
  onDismiss,
}: StatusBannerProps): ReactElement {
  return (
    <div className={`status-banner status-banner-${variant}`} role="status">
      <div className="status-banner-body">
        <div className="status-banner-title">{title}</div>
        {children}
      </div>
      {onDismiss && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDismiss}>
          关闭
        </button>
      )}
    </div>
  );
}
