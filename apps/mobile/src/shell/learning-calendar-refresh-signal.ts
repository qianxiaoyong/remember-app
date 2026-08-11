let learningCalendarNeedsRefresh = false;

export function markLearningCalendarNeedsRefresh(): void {
  learningCalendarNeedsRefresh = true;
}

export function consumeLearningCalendarNeedsRefresh(): boolean {
  if (!learningCalendarNeedsRefresh) {
    return false;
  }
  learningCalendarNeedsRefresh = false;
  return true;
}

export function resetLearningCalendarRefreshSignalForTests(): void {
  learningCalendarNeedsRefresh = false;
}
