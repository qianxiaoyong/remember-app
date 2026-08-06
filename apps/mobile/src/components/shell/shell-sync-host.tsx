import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { useSyncWorker } from '../../hooks/use-sync-worker';
import { useCatalogCacheWarmup } from '../../hooks/use-catalog-cache-warmup';
import { useBundledPackUpgrade } from '../../hooks/use-bundled-pack-upgrade';
import { useSessionRefresh } from '../../hooks/use-session-refresh';

function ShellSyncEffects(): null {
  useSessionRefresh();
  useSyncWorker();
  useCatalogCacheWarmup();
  useBundledPackUpgrade();
  return null;
}

export function ShellSyncHost(): ReactElement | null {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, []);

  if (!ready) {
    return null;
  }

  return <ShellSyncEffects />;
}
