import { keyOfOffset, todayKey } from './date';

/**
 * Consecutive days ending today (or yesterday — a streak isn't broken
 * until you miss a whole day).
 */
export function computeStreak(dates: string[]): number {
  const days = new Set(dates);
  if (days.size === 0) return 0;

  let cursor = todayKey();
  if (!days.has(cursor)) cursor = keyOfOffset(cursor, -1);

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = keyOfOffset(cursor, -1);
  }
  return streak;
}

/** The longest run of consecutive days ever recorded. */
export function computeBestStreak(dates: string[]): number {
  const days = new Set(dates);
  let best = 0;

  for (const key of days) {
    // Only start counting from the first day of a run.
    if (days.has(keyOfOffset(key, -1))) continue;

    let run = 0;
    let cursor = key;
    while (days.has(cursor)) {
      run += 1;
      cursor = keyOfOffset(cursor, 1);
    }
    if (run > best) best = run;
  }

  return best;
}
