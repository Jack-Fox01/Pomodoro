import { loadJSON, saveJSON } from '../storage/storage';

const DAY_NOTES_KEY = 'day-notes:v1';

export type DayNotes = Record<string, string>;

export async function loadDayNotes(): Promise<DayNotes> {
  return loadJSON<DayNotes>(DAY_NOTES_KEY, {});
}

export async function saveDayNotes(dayNotes: DayNotes): Promise<void> {
  await saveJSON(DAY_NOTES_KEY, dayNotes);
}
