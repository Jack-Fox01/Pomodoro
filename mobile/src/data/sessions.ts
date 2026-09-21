import type { Session } from "../domain/types";
import { loadJSON, saveJSON } from "../storage/storage";

const SESSIONS_KEY = 'sessions:v1';

export async function loadSessions(): Promise<Session[]> {
    return loadJSON<Session[]>(SESSIONS_KEY, []);
}

export async function addSession(session: Session): Promise<void> {
    const sessions = await loadSessions();
    await saveJSON(SESSIONS_KEY, [...sessions, session]);
}