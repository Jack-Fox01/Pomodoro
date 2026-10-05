import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { playSound } from '../audio/sounds';
import { useAppTheme } from '../theme/ThemeContext';

type ChallengeModalProps = {
  title: string;
  hint: string;
  onCancel: () => void;
  children: ReactNode;
};

/**
 * The chrome around a skip challenge. It knows nothing about which game it
 * is hosting — that is what `children` is for.
 */
export function ChallengeModal({ title, hint, onCancel, children }: ChallengeModalProps) {
  const { colors, retro } = useAppTheme();

  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel}>
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
          <Text style={[styles.hint, { color: colors.inkSoft }]}>{hint}</Text>

          {children}

          <Pressable
            onPress={() => {
              playSound('click');
              onCancel();
            }}
            style={styles.cancel}
          >
            <Text style={[styles.cancelLabel, { color: colors.inkSoft }]}>
              Cancel — keep working
            </Text>
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
    backgroundColor: 'rgba(20, 30, 26, 0.5)',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    padding: 24,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 18,
  },
  cancel: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelLabel: {
    fontSize: 13,
  },
});
