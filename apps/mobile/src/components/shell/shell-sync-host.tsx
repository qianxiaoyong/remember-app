import { useSyncWorker } from '../../hooks/use-sync-worker';
import { useCatalogCacheWarmup } from '../../hooks/use-catalog-cache-warmup';
import { useBundledPackUpgrade } from '../../hooks/use-bundled-pack-upgrade';
import { useSessionRefresh } from '../../hooks/use-session-refresh';

export function ShellSyncHost(): null {
  useSessionRefresh();
  useSyncWorker();
  useCatalogCacheWarmup();
  useBundledPackUpgrade();
  return null;
}
