import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { loadDayNotes, saveDayNotes } from '../data/dayNotes';
import type { DayNotes } from '../data/dayNotes';
import { loadNotes, saveNotes } from '../data/notes';
import { loadSessions, saveSessions } from '../data/sessions';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../data/settings';
import { loadTodos, saveTodos } from '../data/todos';
import type { ChallengeType, Session, Settings, Todo } from '../domain/types';

type AppDataValue = {
  /** False until everything has been read back from storage. */
  ready: boolean;

  sessions: Session[];
  addSession: (session: Session) => void;

  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  reorderTodos: (from: number, to: number) => void;

  notes: string;
  setNotes: (notes: string) => void;

  dayNotes: DayNotes;
  setDayNote: (date: string, text: string) => void;

  settings: Settings;
  setFocusMinutes: (minutes: number) => void;
  setBreakMinutes: (minutes: number) => void;
  setChallenge: (challenge: ChallengeType) => void;
};

const AppDataContext = createContext<AppDataValue | null>(null);

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [notes, setNotesState] = useState('');
  const [dayNotes, setDayNotesState] = useState<DayNotes>({});
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Read everything once, in parallel, on first mount.
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      const [savedSessions, savedTodos, savedNotes, savedDayNotes, savedSettings] =
        await Promise.all([
          loadSessions(),
          loadTodos(),
          loadNotes(),
          loadDayNotes(),
          loadSettings(),
        ]);

      if (cancelled) return;

      setSessions(savedSessions);
      setTodos(savedTodos);
      setNotesState(savedNotes);
      setDayNotesState(savedDayNotes);
      setSettings(savedSettings);
      setReady(true);
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AppDataValue>(
    () => ({
      ready,

      sessions,
      addSession: (session) => {
        const next = [...sessions, session];
        setSessions(next);
        void saveSessions(next);
      },

      todos,
      addTodo: (text) => {
        const next = [...todos, { id: makeId(), text, done: false }];
        setTodos(next);
        void saveTodos(next);
      },
      toggleTodo: (id) => {
        const next = todos.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        );
        setTodos(next);
        void saveTodos(next);
      },
      removeTodo: (id) => {
        const next = todos.filter((todo) => todo.id !== id);
        setTodos(next);
        void saveTodos(next);
      },
      reorderTodos: (from, to) => {
        if (from === to) return;
        const next = todos.slice();
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        setTodos(next);
        void saveTodos(next);
      },

      notes,
      setNotes: (next) => {
        setNotesState(next);
        void saveNotes(next);
      },

      dayNotes,
      setDayNote: (date, text) => {
        const next = { ...dayNotes, [date]: text };
        setDayNotesState(next);
        void saveDayNotes(next);
      },

      settings,
      setFocusMinutes: (minutes) => {
        const next = { ...settings, focusMinutes: minutes };
        setSettings(next);
        void saveSettings(next);
      },
      setBreakMinutes: (minutes) => {
        const next = { ...settings, breakMinutes: minutes };
        setSettings(next);
        void saveSettings(next);
      },
      setChallenge: (challenge) => {
        const next = { ...settings, challenge };
        setSettings(next);
        void saveSettings(next);
      },
    }),
    [ready, sessions, todos, notes, dayNotes, settings]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside an AppDataProvider');
  return ctx;
}
