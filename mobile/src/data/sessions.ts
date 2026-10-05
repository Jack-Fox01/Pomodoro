import type { Session } from '../domain/types';
import { loadJSON, saveJSON } from '../storage/storage';

const SESSIONS_KEY = 'sessions:v1';

/** Every session ever recorded, oldest first. */
export async function loadSessions(): Promise<Session[]> {
  const raw = await loadJSON<Session[]>(SESSIONS_KEY, []);
  // Records written before `rating` existed come back without it.
  return raw.map((session) => ({ ...session, rating: session.rating ?? null }));
}

export async function saveSessions(sessions: Session[]): Promise<void> {
  await saveJSON(SESSIONS_KEY, sessions);
}
