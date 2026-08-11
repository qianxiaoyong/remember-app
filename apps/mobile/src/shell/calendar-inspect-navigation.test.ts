import { describe, expect, it, vi } from 'vitest';
import { buildLearningCalendarHref, exitCalendarInspect } from './calendar-inspect-navigation';

describe('calendar inspect navigation', () => {
  it('buildLearningCalendarHref 带上 localDate', () => {
    expect(buildLearningCalendarHref('2026-08-11')).toBe('/learning-calendar?localDate=2026-08-11');
  });

  it('exitCalendarInspect 使用 back 弹出检查页', () => {
    const router = { back: vi.fn() };
    exitCalendarInspect(router);
    expect(router.back).toHaveBeenCalledOnce();
  });
});
