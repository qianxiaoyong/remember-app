let overlayReady = false;
const listeners = new Set<() => void>();

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

export function waitForSplashOverlayReady(): Promise<void> {
  if (overlayReady) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    listeners.add(resolve);
  });
}

export function resetSplashOverlayReadyForTests(): void {
  overlayReady = false;
  listeners.clear();
}
