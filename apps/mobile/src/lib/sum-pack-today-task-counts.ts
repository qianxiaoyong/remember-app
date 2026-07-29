/** 看板待复习 = 各资料包行「今日待复习」数量之和。 */
export function sumPackTodayTaskCounts(counts: readonly number[]): number {
  let total = 0;
  for (const count of counts) {
    total += count;
  }
  return total;
}
