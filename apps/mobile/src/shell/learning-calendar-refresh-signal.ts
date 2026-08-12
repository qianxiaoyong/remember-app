const listeners = new Set<() => void>();
let learningCalendarNeedsRefresh = false;

/** inspect 改词时仅标记 dirty，避免栈下「记录」页同步重绘闪屏。 */
export function markLearningCalendarNeedsRefresh(): void {
  learningCalendarNeedsRefresh = true;
}

/** 退出 inspect 或 Records 获得 focus 时刷新一次。 */
export function flushLearningCalendarNeedsRefresh(): void {
  if (!learningCalendarNeedsRefresh) {
    return;
  }
  learningCalendarNeedsRefresh = false;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeLearningCalendarRefresh(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetLearningCalendarRefreshSignalForTests(): void {
  learningCalendarNeedsRefresh = false;
  listeners.clear();
}
