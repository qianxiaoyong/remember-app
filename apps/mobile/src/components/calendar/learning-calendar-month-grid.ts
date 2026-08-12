export interface MonthGridCell {
  key: string;
  localDate: string;
  day: number;
  isCurrentMonth: boolean;
}

export function buildMonthGridCells(year: number, month: number): MonthGridCell[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const leadingPads = (firstWeekday + 6) % 7;

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();

  const cells: MonthGridCell[] = [];

  for (let index = leadingPads - 1; index >= 0; index -= 1) {
    const day = daysInPrevMonth - index;
    cells.push(
      createMonthGridCell({ year: prevYear, month: prevMonth, day, isCurrentMonth: false }),
    );
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(createMonthGridCell({ year, month, day, isCurrentMonth: true }));
  }

  let nextDay = 1;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  while (cells.length % 7 !== 0) {
    cells.push(
      createMonthGridCell({
        year: nextYear,
        month: nextMonth,
        day: nextDay,
        isCurrentMonth: false,
      }),
    );
    nextDay += 1;
  }

  return cells;
}

function createMonthGridCell(input: {
  year: number;
  month: number;
  day: number;
  isCurrentMonth: boolean;
}): MonthGridCell {
  const monthStr = String(input.month).padStart(2, '0');
  const dayStr = String(input.day).padStart(2, '0');
  const localDate = `${String(input.year)}-${monthStr}-${dayStr}`;
  return {
    key: localDate,
    localDate,
    day: input.day,
    isCurrentMonth: input.isCurrentMonth,
  };
}
