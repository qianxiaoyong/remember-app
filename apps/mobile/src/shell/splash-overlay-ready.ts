let overlayReady = false;
const listeners = new Set<() => void>();

/** overlay 图片加载失败或异常时，避免启动链永久等待。 */
export const SPLASH_OVERLAY_READY_TIMEOUT_MS = 5_000;

export function markSplashOverlayReady(): void {
  if (overlayReady) {
    return;
  }
  overlayReady = true;
  for (const listener of listeners) {
    listener();
  }
  listeners.clear();
}

export function waitForSplashOverlayReady(
  timeoutMs = SPLASH_OVERLAY_READY_TIMEOUT_MS,
): Promise<void> {
  if (overlayReady) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const onReady = (): void => {
      clearTimeout(timeoutId);
      resolve();
    };
    const timeoutId = setTimeout(() => {
      listeners.delete(onReady);
      markSplashOverlayReady();
      resolve();
    }, timeoutMs);
    listeners.add(onReady);
  });
}

export function resetSplashOverlayReadyForTests(): void {
  overlayReady = false;
  listeners.clear();
}
