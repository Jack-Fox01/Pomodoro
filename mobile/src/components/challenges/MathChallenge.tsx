import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { genMathQuestion } from '../../domain/math';
import { useAppTheme } from '../../theme/ThemeContext';

const NEEDED = 3;

type MathChallengeProps = {
  onComplete: () => void;
};

export function MathChallenge({ onComplete }: MathChallengeProps) {
  const { colors, retro } = useAppTheme();
  // No parentheses: React calls the generator once, lazily, for the first render.
  const [question, setQuestion] = useState(genMathQuestion);
  const [correct, setCorrect] = useState(0);

  function answer(choice: number) {
    if (choice === question.answer) {
      const next = correct + 1;
      if (next >= NEEDED) {
        onComplete();
        return;
      }
      setCorrect(next);
    }
    // Wrong answers deal a new question but never cost progress.
    setQuestion(genMathQuestion());
  }

  return (
    <View>
      <View style={styles.progress}>
        {Array.from({ length: NEEDED }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index < correct ? colors.breakColor : colors.chipBg },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.question, { color: colors.ink }]}>{question.text}</Text>

      <View style={styles.answers}>
        {question.choices.map((choice) => (
          <Pressable
            key={choice}
            onPress={() => answer(choice)}
            style={({ pressed }) => [
              styles.answer,
              { backgroundColor: colors.chipBg, borderRadius: retro ? 2 : 12 },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.answerLabel, { color: colors.ink }]}>{choice}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  question: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
    fontVariant: ['tabular-nums'],
  },
  answers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  answer: {
    width: '47%',
    paddingVertical: 14,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  answerLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
});
