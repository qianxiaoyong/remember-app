import { useSyncWorker } from '../../hooks/use-sync-worker';
import { useCatalogCacheWarmup } from '../../hooks/use-catalog-cache-warmup';

export function ShellSyncHost(): null {
  useSyncWorker();
  useCatalogCacheWarmup();
  return null;
}
