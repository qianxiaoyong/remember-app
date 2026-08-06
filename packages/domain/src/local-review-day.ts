interface LocalDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}

function readLocalDateTimeParts(date: Date, timeZone: string): LocalDateTimeParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
    second: read('second'),
  };
}

function localPartsToUtcMs(parts: LocalDateTimeParts, timeZone: string): number {
  let utcMs = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const actual = readLocalDateTimeParts(new Date(utcMs), timeZone);
    const desiredMs = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    const actualMs = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second,
    );
    const diffMs = desiredMs - actualMs;
    if (diffMs === 0) {
      return utcMs;
    }
    utcMs += diffMs;
  }

  return utcMs;
}

function formatOffset(minutesEastOfUtc: number): string {
  const sign = minutesEastOfUtc >= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(minutesEastOfUtc);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;
  return `${sign}${padTwo(hours)}:${padTwo(minutes)}`;
}

function getTimezoneOffsetMinutes(date: Date, timeZone: string): number {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const localDate = new Date(date.toLocaleString('en-US', { timeZone }));
  return Math.round((localDate.getTime() - utcDate.getTime()) / 60_000);
}

export function formatLocalIsoDateTime(date: Date, timeZone: string): string {
  const parts = readLocalDateTimeParts(date, timeZone);
  const offsetMinutes = getTimezoneOffsetMinutes(date, timeZone);

  return `${String(parts.year)}-${padTwo(parts.month)}-${padTwo(parts.day)}T${padTwo(parts.hour)}:${padTwo(parts.minute)}:${padTwo(parts.second)}.000${formatOffset(offsetMinutes)}`;
}

export function startOfLocalReviewDay(now: Date, timeZone: string): Date {
  const parts = readLocalDateTimeParts(now, timeZone);
  return new Date(
    localPartsToUtcMs(
      {
        year: parts.year,
        month: parts.month,
        day: parts.day,
        hour: 0,
        minute: 0,
        second: 0,
      },
      timeZone,
    ),
  );
}

export function endOfLocalReviewDay(now: Date, timeZone: string): Date {
  const parts = readLocalDateTimeParts(now, timeZone);
  return new Date(
    localPartsToUtcMs(
      {
        year: parts.year,
        month: parts.month,
        day: parts.day,
        hour: 23,
        minute: 59,
        second: 59,
      },
      timeZone,
    ),
  );
}

export function addLocalReviewDays(
  anchor: Date,
  days: number,
  timeZone: string,
): Date {
  const parts = readLocalDateTimeParts(anchor, timeZone);
  const calendarDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));

  return new Date(
    localPartsToUtcMs(
      {
        year: calendarDate.getUTCFullYear(),
        month: calendarDate.getUTCMonth() + 1,
        day: calendarDate.getUTCDate(),
        hour: 0,
        minute: 0,
        second: 0,
      },
      timeZone,
    ),
  );
}

export function nextLocalReviewDayAnchor(now: Date, timeZone: string): string {
  const tomorrowStart = addLocalReviewDays(startOfLocalReviewDay(now, timeZone), 1, timeZone);
  return formatLocalIsoDateTime(tomorrowStart, timeZone);
}

export function formatLocalReviewDate(now: Date, timeZone: string): string {
  const parts = readLocalDateTimeParts(now, timeZone);
  return `${String(parts.year)}-${padTwo(parts.month)}-${padTwo(parts.day)}`;
}
