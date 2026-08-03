import { useEffect } from 'react';
import { upgradePrimaryBundledPacksIfNeeded } from '../use-cases/install-bundled-test-pack';

export function useBundledPackUpgrade(): void {
  useEffect(() => {
    void upgradePrimaryBundledPacksIfNeeded().catch(() => {
      // 启动静默升级失败不阻断 UI；用户仍可从市场手动安装
    });
  }, []);
}
