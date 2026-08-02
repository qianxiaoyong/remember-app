import { describe, expect, it } from 'vitest';
import {
  isScrollAtBottom,
  isScrollContentFullyVisible,
  SCROLL_BOTTOM_THRESHOLD,
} from './scroll-reach-bottom.js';

describe('scroll-reach-bottom', () => {
  it('正文矮于视口时视为已到底', () => {
    expect(isScrollContentFullyVisible(400, 800, SCROLL_BOTTOM_THRESHOLD)).toBe(true);
    expect(isScrollContentFullyVisible(800, 800, SCROLL_BOTTOM_THRESHOLD)).toBe(true);
    expect(isScrollContentFullyVisible(848, 800, SCROLL_BOTTOM_THRESHOLD)).toBe(true);
  });

  it('正文高于视口时需滚动才到底', () => {
    expect(isScrollContentFullyVisible(900, 800, SCROLL_BOTTOM_THRESHOLD)).toBe(false);
    expect(isScrollAtBottom({ contentHeight: 900, layoutHeight: 800, scrollOffsetY: 52 })).toBe(
      true,
    );
    expect(isScrollAtBottom({ contentHeight: 900, layoutHeight: 800, scrollOffsetY: 0 })).toBe(
      false,
    );
  });
});
