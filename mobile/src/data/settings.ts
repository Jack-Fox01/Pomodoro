import type { Settings } from '../domain/types';
import { loadJSON, saveJSON } from '../storage/storage';

const SETTINGS_KEY = 'settings:v1';

export const DEFAULT_SETTINGS: Settings = {
  focusMinutes: 25,
  breakMinutes: 5,
  challenge: 'random',
};

export async function loadSettings(): Promise<Settings> {
  return loadJSON<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export async function saveSettings(settings: Settings): Promise<void> {
  await saveJSON(SETTINGS_KEY, settings);
}
