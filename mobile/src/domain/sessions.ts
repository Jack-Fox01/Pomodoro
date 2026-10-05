import type { Session } from './types';

/** Sessions bucketed by their date key. */
export function groupByDate(sessions: Session[]): Record<string, Session[]> {
  const map: Record<string, Session[]> = {};
  for (const session of sessions) {
    const bucket = map[session.date];
    if (bucket) bucket.push(session);
    else map[session.date] = [session];
  }
  return map;
}

/** Every day that has at least one session. */
export function sessionDates(sessions: Session[]): string[] {
  return [...new Set(sessions.map((s) => s.date))];
}

/** Oldest first, so the day detail reads chronologically. */
export function byTimeAscending(a: Session, b: Session): number {
  return a.completedAt - b.completedAt;
}
