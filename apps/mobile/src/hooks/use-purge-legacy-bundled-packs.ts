import { useEffect } from 'react';
import { purgeLegacyBundledTestPacks } from '../use-cases/purge-legacy-bundled-test-packs';

export function usePurgeLegacyBundledPacks(): void {
  useEffect(() => {
    void purgeLegacyBundledTestPacks().catch(() => {
      // 清理失败不阻断 UI
    });
  }, []);
}
