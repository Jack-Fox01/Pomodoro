import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { pickQuote } from '../domain/quotes';
import { RATING_OPTIONS } from '../domain/rating';
import type { Rating } from '../domain/types';
import { useAppTheme } from '../theme/ThemeContext';

type RatingModalProps = {
  title: string;
  onPick: (rating: Rating) => void;
  onSkip: () => void;
};

export function RatingModal({ title, onPick, onSkip }: RatingModalProps) {
  const { colors, retro } = useAppTheme();
  // Lazy initialiser: one fresh quote per opening, not one per render.
  const [quote] = useState(pickQuote);

  return (
    <Modal transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.line,
              borderWidth: retro ? 2 : 1,
              borderRadius: retro ? 2 : 22,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
          <Text style={[styles.quote, { color: colors.focusDeep }]}>{quote}</Text>

          <View style={styles.options}>
            {RATING_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => onPick(option.value)}
                style={[
                  styles.option,
                  { backgroundColor: colors.chipBg, borderRadius: retro ? 2 : 16 },
                ]}
              >
                <Text style={styles.emoji}>{option.emoji}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={onSkip} style={styles.skip}>
            <Text style={[styles.skipLabel, { color: colors.inkSoft }]}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(20, 30, 26, 0.55)',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  option: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 34,
    lineHeight: 40,
  },
  skip: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  skipLabel: {
    fontSize: 13,
  },
});
