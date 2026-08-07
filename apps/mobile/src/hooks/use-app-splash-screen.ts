import { useEffect, useState } from 'react';
import { useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { waitForAppContentReady } from '../shell/app-content-ready';
import { waitForSplashOverlayReady } from '../shell/splash-overlay-ready';

/** 首屏就绪后额外 hold，让用户感到过渡自然。 */
export const SPLASH_MIN_HOLD_AFTER_CONTENT_MS = 800;

function waitMs(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

async function waitForNextFrames(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

/**
 * 启动 splash 时序：
 * 1. JS overlay 图片解码并就绪（与原生 splash 同图 splash-full.png，用于无缝 handoff）
 * 2. 立刻 hide 原生 splash（避免双层叠影）
 * 3. 等首屏 layout + hold
 * 4. 撤掉 overlay
 */
export function useAppSplashScreen(): boolean {
  const navigationState = useRootNavigationState();
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const navigationKey = navigationState.key;
    if (!navigationKey) {
      return;
    }

    const abortController = new AbortController();
    const { signal } = abortController;

    void (async () => {
      await waitForSplashOverlayReady();
      await waitForNextFrames();
      await SplashScreen.hideAsync().catch(() => {
        // 原生层可能已不可见
      });
      await waitForAppContentReady();
      await waitMs(SPLASH_MIN_HOLD_AFTER_CONTENT_MS);
      await waitForNextFrames();

      if (!signal.aborted) {
        setSplashVisible(false);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [navigationState.key]);

  return splashVisible;
}
