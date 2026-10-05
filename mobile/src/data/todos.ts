import type { Todo } from '../domain/types';
import { loadJSON, saveJSON } from '../storage/storage';

const TODOS_KEY = 'todos:v1';

export async function loadTodos(): Promise<Todo[]> {
  return loadJSON<Todo[]>(TODOS_KEY, []);
}

export async function saveTodos(todos: Todo[]): Promise<void> {
  await saveJSON(TODOS_KEY, todos);
}
