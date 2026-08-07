let reviewPoolVersion = 0;
const listeners = new Set<() => void>();

export function markReviewPoolChanged(): void {
  reviewPoolVersion += 1;
  for (const listener of listeners) {
    listener();
  }
}

export function getReviewPoolVersion(): number {
  return reviewPoolVersion;
}

export function subscribeReviewPoolChanged(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetReviewPoolChangedSignalForTests(): void {
  reviewPoolVersion = 0;
  listeners.clear();
}
