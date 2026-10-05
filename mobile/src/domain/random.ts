/** Random integer from min to max, inclusive. */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** A NEW array with the items shuffled (Fisher–Yates). Never mutates the input. */
export function shuffle<T>(items: T[]): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickOne<T>(items: T[]): T {
  return items[randInt(0, items.length - 1)];
}
