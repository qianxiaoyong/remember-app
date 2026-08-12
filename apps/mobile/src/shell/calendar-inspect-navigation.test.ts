import { describe, expect, it, vi } from 'vitest';
import {
  markLearningCalendarNeedsRefresh,
  resetLearningCalendarRefreshSignalForTests,
  subscribeLearningCalendarRefresh,
} from './learning-calendar-refresh-signal';
import { buildLearningCalendarHref, exitCalendarInspect } from './calendar-inspect-navigation';

describe('calendar inspect navigation', () => {
  it('buildLearningCalendarHref 带上 localDate', () => {
    expect(buildLearningCalendarHref('2026-08-11')).toBe('/record?localDate=2026-08-11');
  });

  it('exitCalendarInspect 使用 back 弹出检查页', () => {
    const router = { back: vi.fn() };
    exitCalendarInspect(router);
    expect(router.back).toHaveBeenCalledOnce();
  });

  it('exitCalendarInspect 会 flush 日历刷新', () => {
    let flushed = 0;
    const unsubscribe = subscribeLearningCalendarRefresh(() => {
      flushed += 1;
    });
    markLearningCalendarNeedsRefresh();

    exitCalendarInspect({ back: vi.fn() });
    expect(flushed).toBe(1);

    unsubscribe();
    resetLearningCalendarRefreshSignalForTests();
  });
});
