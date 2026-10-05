const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** A date as 'YYYY-MM-DD' in LOCAL time. */
export function toKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toKey(new Date());
}

/** Midnight on the day a key refers to. */
export function parseKey(key: string): Date {
  return new Date(`${key}T00:00:00`);
}

/** The key `deltaDays` away from `key`. Handles month and year boundaries. */
export function keyOfOffset(key: string, deltaDays: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + deltaDays);
  return toKey(d);
}

export function formatMonthTitle(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

/** e.g. 'Saturday 14 February' */
export function formatLongDate(key: string): string {
  const d = parseKey(key);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** A timestamp as 24-hour 'HH:MM'. */
export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export type CalendarCell = { day: number; key: string } | null;

/** A month laid out for a 7-column grid: leading blanks, days, trailing blanks. */
export function monthCells(year: number, month: number): CalendarCell[] {
  const lead = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, key: toKey(new Date(year, month, day)) });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}
