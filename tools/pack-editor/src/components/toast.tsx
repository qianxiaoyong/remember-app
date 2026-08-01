import type { ReactElement } from 'react';

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps): ReactElement {
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
