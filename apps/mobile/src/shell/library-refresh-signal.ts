let libraryNeedsRefresh = false;

export function markLibraryNeedsRefresh(): void {
  libraryNeedsRefresh = true;
}

export function consumeLibraryNeedsRefresh(): boolean {
  if (!libraryNeedsRefresh) {
    return false;
  }
  libraryNeedsRefresh = false;
  return true;
}

export function resetLibraryRefreshSignalForTests(): void {
  libraryNeedsRefresh = false;
}
