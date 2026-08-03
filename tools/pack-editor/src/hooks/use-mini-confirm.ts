import { useCallback, useState, createElement, type ReactElement } from 'react';
import { MiniConfirmDialog } from '../components/mini-confirm-dialog.js';

interface MiniConfirmRequest {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function useMiniConfirm(): {
  askConfirm: (request: MiniConfirmRequest) => void;
  miniConfirmDialog: ReactElement | null;
} {
  const [pending, setPending] = useState<MiniConfirmRequest | null>(null);

  const askConfirm = useCallback((request: MiniConfirmRequest) => {
    setPending(request);
  }, []);

  const miniConfirmDialog =
    pending === null
      ? null
      : createElement(MiniConfirmDialog, {
          open: true,
          message: pending.message,
          confirmLabel: pending.confirmLabel ?? '确认',
          onConfirm: () => {
            pending.onConfirm();
            setPending(null);
          },
          onCancel: () => {
            setPending(null);
          },
        });

  return { askConfirm, miniConfirmDialog };
}
