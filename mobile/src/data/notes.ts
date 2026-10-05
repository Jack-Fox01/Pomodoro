import { loadJSON, saveJSON } from '../storage/storage';

const NOTES_KEY = 'notes:v1';

export async function loadNotes(): Promise<string> {
  return loadJSON<string>(NOTES_KEY, '');
}

export async function saveNotes(notes: string): Promise<void> {
  await saveJSON(NOTES_KEY, notes);
}
