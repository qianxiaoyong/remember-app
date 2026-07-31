import { useEffect } from 'react';
import { readCatalogDiskCache } from '../data/catalog/catalog-cache-store';
import { readCatalogTaxonomyDiskCache } from '../data/catalog/catalog-taxonomy-store';
import { warmCatalogCacheFromNetwork } from '../use-cases/fetch-market-catalog';
import { markLibraryNeedsRefresh } from '../shell/library-refresh-signal';

export function useCatalogCacheWarmup(): void {
  useEffect(() => {
    void (async () => {
      await readCatalogDiskCache();
      await readCatalogTaxonomyDiskCache();
      markLibraryNeedsRefresh();
      await warmCatalogCacheFromNetwork();
      markLibraryNeedsRefresh();
    })();
  }, []);
}
