import { useSyncWorker } from '../../hooks/use-sync-worker';
import { useCatalogCacheWarmup } from '../../hooks/use-catalog-cache-warmup';
import { useBundledPackUpgrade } from '../../hooks/use-bundled-pack-upgrade';

export function ShellSyncHost(): null {
  useSyncWorker();
  useCatalogCacheWarmup();
  useBundledPackUpgrade();
  return null;
}
