import type { Settings } from '../domain/types';
import { loadJSON, saveJSON } from '../storage/storage';

const SETTINGS_KEY = 'settings:v1';

export const DEFAULT_SETTINGS: Settings = {
  focusMinutes: 25,
  breakMinutes: 5,
  challenge: 'random',
};

/** Merged over the defaults, so settings stored before a field existed still load. */
export async function loadSettings(): Promise<Settings> {
  const saved = await loadJSON<Partial<Settings>>(SETTINGS_KEY, {});
  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await saveJSON(SETTINGS_KEY, settings);
}
