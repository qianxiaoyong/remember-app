import { AppState } from 'react-native';
import { useEffect } from 'react';
import { countSyncOutboxItems } from '../data/repositories/sync-outbox-repository';
import { readSessionToken } from '../data/session/session-store';
import { uploadPendingSyncOutbox } from '../use-cases/sync/upload-pending-sync-outbox';

const OUTBOX_RETRY_INTERVAL_MS = 15_000;

export function useSyncWorker(): void {
  useEffect(() => {
    const tryUpload = (): void => {
      void readSessionToken().then((token) => {
        if (!token) {
          return;
        }
        void uploadPendingSyncOutbox(token);
      });
    };

    tryUpload();

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        tryUpload();
      }
    });

    const retryTimer = setInterval(() => {
      if (countSyncOutboxItems() > 0) {
        tryUpload();
      }
    }, OUTBOX_RETRY_INTERVAL_MS);

    return () => {
      appStateSubscription.remove();
      clearInterval(retryTimer);
    };
  }, []);
}

export function triggerBackgroundSyncUpload(): void {
  void readSessionToken().then((token) => {
    if (!token) {
      return;
    }
    void uploadPendingSyncOutbox(token);
  });
}
