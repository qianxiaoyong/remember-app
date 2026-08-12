import { describe, expect, it } from 'vitest';
import { buildMonthGridCells } from './learning-calendar-month-grid';

describe('buildMonthGridCells', () => {
  it('starts weeks on Monday and includes adjacent month dates', () => {
    const cells = buildMonthGridCells(2026, 8);

    expect(cells.length % 7).toBe(0);
    expect(cells[0]?.localDate).toBe('2026-07-27');
    expect(cells.find((cell) => cell.localDate === '2026-08-01')?.isCurrentMonth).toBe(true);
    expect(cells.find((cell) => cell.localDate === '2026-07-31')?.isCurrentMonth).toBe(false);
  });
});
