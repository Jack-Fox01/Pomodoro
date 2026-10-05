import { randInt, shuffle } from './random';

export type MathQuestion = {
  text: string;
  answer: number;
  choices: number[];
};

const OPERATORS = ['+', '−', '×'] as const;

export function genMathQuestion(): MathQuestion {
  const op = OPERATORS[randInt(0, OPERATORS.length - 1)];

  let a: number;
  let b: number;
  let answer: number;

  if (op === '+') {
    a = randInt(2, 20);
    b = randInt(2, 20);
    answer = a + b;
  } else if (op === '−') {
    a = randInt(5, 30);
    // Upper bound keeps the answer positive.
    b = randInt(1, a - 1);
    answer = a - b;
  } else {
    a = randInt(2, 12);
    b = randInt(2, 12);
    answer = a * b;
  }

  // A Set gives us uniqueness for free.
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const candidate = answer + randInt(-9, 9);
    if (candidate >= 0 && candidate !== answer) options.add(candidate);
  }

  return {
    text: `${a} ${op} ${b} = ?`,
    answer,
    choices: shuffle([...options]),
  };
}
