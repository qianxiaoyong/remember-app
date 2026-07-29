/** 与资料包行「今日待复习」一致：优先 session 队列，否则 SM-2 到期数。 */
export function resolveTodayTaskCount(input: {
  pendingSessionCount: number;
  sm2DueCount: number;
}): number {
  if (input.pendingSessionCount > 0) {
    return input.pendingSessionCount;
  }
  return input.sm2DueCount;
}
