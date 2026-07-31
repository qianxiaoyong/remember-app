import { useEffect } from 'react';
import { readCatalogDiskCache } from '../data/catalog/catalog-cache-store';
import { warmCatalogCacheFromNetwork } from '../use-cases/fetch-market-catalog';
import { markLibraryNeedsRefresh } from '../shell/library-refresh-signal';

export function useCatalogCacheWarmup(): void {
  useEffect(() => {
    void (async () => {
      await readCatalogDiskCache();
      markLibraryNeedsRefresh();
      await warmCatalogCacheFromNetwork();
      markLibraryNeedsRefresh();
    })();
  }, []);
}
