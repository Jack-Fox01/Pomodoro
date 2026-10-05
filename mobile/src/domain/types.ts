export type Phase = 'focus' | 'break';

/** 1 = rough … 4 = great. Matches the four faces in the rating modal. */
export type Rating = 1 | 2 | 3 | 4;

export type Session = {
  date: string;
  phase: Phase;
  seconds: number;
  completedAt: number;
  skipped: boolean;
  rating: Rating | null;
};

export type Todo = {
  id: string;
  text: string;
  done: boolean;
};

export type ChallengeType = 'math' | 'tiles' | 'boss' | 'random';

export type Settings = {
  focusMinutes: number;
  breakMinutes: number;
  challenge: ChallengeType;
};
