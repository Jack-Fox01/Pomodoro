import type { Rating, Session } from './types';

export const RATING_OPTIONS: { value: Rating; emoji: string }[] = [
  { value: 1, emoji: '😞' },
  { value: 2, emoji: '😐' },
  { value: 3, emoji: '🙂' },
  { value: 4, emoji: '🤩' },
];

const FACES = ['😞', '😐', '🙂', '🤩'];

const COLORS = {
  none: '#b9b3aa',
  1: '#e8553f',
  2: '#e8a13f',
  3: '#a3c94f',
  4: '#2f9e7f',
} as const;

export function ratingEmoji(rating: Rating | null): string {
  return rating === null ? '·' : FACES[rating - 1];
}

export function ratingColor(rating: Rating | null): string {
  return rating === null ? COLORS.none : COLORS[rating];
}

/** Mean rating of the rated sessions in the list, or null if none are rated. */
export function averageRating(sessions: Session[]): number | null {
  const rated = sessions.filter((s) => s.rating !== null);
  if (rated.length === 0) return null;

  const total = rated.reduce((sum, s) => sum + (s.rating as number), 0);
  return total / rated.length;
}

export function averageRatingEmoji(sessions: Session[]): string {
  const avg = averageRating(sessions);
  return avg === null ? '·' : ratingEmoji(Math.round(avg) as Rating);
}

export function averageRatingColor(sessions: Session[]): string {
  const avg = averageRating(sessions);
  return avg === null ? COLORS.none : ratingColor(Math.round(avg) as Rating);
}
