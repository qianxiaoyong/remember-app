let contentReady = false;
const listeners = new Set<() => void>();

export function markAppContentReady(): void {
  if (contentReady) {
    return;
  }
  contentReady = true;
  for (const listener of listeners) {
    listener();
  }
  listeners.clear();
}

export function waitForAppContentReady(): Promise<void> {
  if (contentReady) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    listeners.add(resolve);
  });
}

export function resetAppContentReadyForTests(): void {
  contentReady = false;
  listeners.clear();
}
