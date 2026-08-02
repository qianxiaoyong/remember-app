export const SCROLL_BOTTOM_THRESHOLD = 48;

/** 正文无需滚动即可全部可见（含与滚到底相同的阈值）。 */
export function isScrollContentFullyVisible(
  contentHeight: number,
  layoutHeight: number,
  threshold: number = SCROLL_BOTTOM_THRESHOLD,
): boolean {
  if (layoutHeight <= 0 || contentHeight <= 0) {
    return false;
  }
  return contentHeight <= layoutHeight + threshold;
}

/** 滚动偏移已到达（或超过）底部阈值。 */
export function isScrollAtBottom(input: {
  contentHeight: number;
  layoutHeight: number;
  scrollOffsetY: number;
  threshold?: number;
}): boolean {
  const threshold = input.threshold ?? SCROLL_BOTTOM_THRESHOLD;
  if (input.layoutHeight <= 0 || input.contentHeight <= 0) {
    return false;
  }
  return input.contentHeight - input.layoutHeight - input.scrollOffsetY <= threshold;
}
