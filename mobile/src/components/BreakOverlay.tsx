import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'; //API?
import { formatClock } from '../domain/time';
import { useAppTheme } from '../theme/ThemeContext';

type BreakOverlayProps = {
  visible: boolean;
  secondsLeft: number;
  onEndBreak: () => void;
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 28,
    backgroundColor: '#101c18',
  },
  icon: { fontSize: 38, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '700', color: '#eaf5f0' },
  clock: { fontSize: 68, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: -2 },
  body: { maxWidth: 300, textAlign: 'center', fontSize: 15, lineHeight: 22, color: '#b9cfc7' },
  sub: { marginTop: 6, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: '#7f9b91' },
  primary: { marginTop: 18, paddingVertical: 15, paddingHorizontal: 28, borderRadius: 14, alignItems: 'center' },
  primaryPressed: { opacity: 0.8 },
  primaryLabel: { fontSize: 16, fontWeight: '600', color: '#08231a' },
  secondaryLabel: { fontSize: 14, color: '#7f9b91' },
});

export function BreakOverlay({ visible, secondsLeft, onEndBreak }: BreakOverlayProps) {
  const { colors } = useAppTheme();
  const [confirming, setConfirming] = useState(false);

  // Always reopen on the countdown step.
  useEffect(() => {
    if (visible) setConfirming(false);
  }, [visible]);

  return (

    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => setConfirming(true)}
    >
        <View style={styles.backdrop}>
            {!confirming && (
              <>
              <Text style={styles.icon}>🔒</Text>
              <Text style={styles.title}>Break time</Text>
              <Text style={[styles.clock, {color: colors.breakColor}]}>{formatClock(secondsLeft)}</Text>
              <Text style={styles.body}>Step away from your phone and rest. 🌱</Text>
              <Pressable
              onPress={() => setConfirming(true)} 
              style={({ pressed }) => [
              styles.primary,
              {backgroundColor: colors.breakColor},
              pressed && styles.primaryPressed
              ]}>
                <Text style={styles.primaryLabel}>Stop the timer</Text>
              </Pressable>

              <Text style={styles.sub}> or wait until the timer ends on it own.</Text>
              </>
            )}

            {confirming &&(
                <>
                <Text style={styles.body}>End your break early?</Text>

                <Pressable onPress={onEndBreak}
                style={({pressed}) => [
                  styles.primary,
                  {backgroundColor: colors.breakColor},
                  pressed && styles.primaryPressed,
                ]}
                >
                  <Text style={styles.primaryLabel}>Yes, end break</Text>
                </Pressable>

                <Pressable
                  onPress={() => setConfirming(false)}
                    style={({ pressed }) => [
                   styles.primary,
                    pressed && styles.primaryPressed,
              ]}
            >
              <Text style={styles.secondaryLabel}>No, keep breaking</Text>
            </Pressable>
                </>
            )}
        </View>
    </Modal>
  );
}