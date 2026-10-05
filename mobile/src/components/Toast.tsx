import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '../theme/ThemeContext';

type ToastProps = {
  message: string;
  duration?: number;
  onHide: () => void;
};

/** A single line that fades in near the top, waits, then fades out. */
export function Toast({ message, duration = 2600, onHide }: ToastProps) {
  const { colors, retro } = useAppTheme();
  const fade = useRef(new Animated.Value(0)).current;

  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;

    Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
      hideTimer = setTimeout(() => {
        Animated.timing(fade, { toValue: 0, duration: 250, useNativeDriver: true }).start(() =>
          onHideRef.current()
        );
      }, duration);
    });

    return () => clearTimeout(hideTimer);
  }, [fade, duration]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          opacity: fade,
          backgroundColor: colors.card,
          borderColor: colors.line,
          borderRadius: retro ? 2 : 999,
          borderWidth: retro ? 2 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.ink }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 58,
    left: 24,
    right: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
