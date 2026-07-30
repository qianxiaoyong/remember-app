import { useSyncWorker } from '../../hooks/use-sync-worker';

export function ShellSyncHost(): null {
  useSyncWorker();
  return null;
}
