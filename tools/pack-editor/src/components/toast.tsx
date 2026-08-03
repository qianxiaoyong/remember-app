import type { ReactElement } from 'react';

interface ToastProps {
  message: string;
  variant?: 'default' | 'mini';
}

export function Toast({ message, variant = 'default' }: ToastProps): ReactElement {
  return (
    <div
      className={variant === 'mini' ? 'toast toast-mini' : 'toast'}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
