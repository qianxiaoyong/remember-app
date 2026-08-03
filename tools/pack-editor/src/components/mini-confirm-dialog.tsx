import { useEffect, useRef, type ReactElement } from 'react';

interface MiniConfirmDialogProps {
  open: boolean;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MiniConfirmDialog({
  open,
  message,
  confirmLabel = '确认',
  onConfirm,
  onCancel,
}: MiniConfirmDialogProps): ReactElement | null {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    panelRef.current?.querySelector<HTMLElement>('button')?.focus();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="dialog-overlay dialog-overlay-mini"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        ref={panelRef}
        className="dialog-panel dialog-panel-mini"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="mini-confirm-message"
      >
        <p id="mini-confirm-message" className="dialog-panel-mini-message">
          {message}
        </p>
        <div className="dialog-actions dialog-actions-mini">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
