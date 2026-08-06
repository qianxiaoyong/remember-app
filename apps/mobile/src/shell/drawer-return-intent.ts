let drawerReturnPending = false;

export function markDrawerReturnPending(): void {
  drawerReturnPending = true;
}

export function consumeDrawerReturnPending(): boolean {
  if (!drawerReturnPending) {
    return false;
  }
  drawerReturnPending = false;
  return true;
}

export function clearDrawerReturnPending(): void {
  drawerReturnPending = false;
}

export function resetDrawerReturnIntentForTests(): void {
  drawerReturnPending = false;
}
