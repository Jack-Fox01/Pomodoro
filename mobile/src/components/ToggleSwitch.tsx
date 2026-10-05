import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme/ThemeContext';

type ToggleSwitchProps = {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
};

export function ToggleSwitch({ label, value, onChange }: ToggleSwitchProps) {
  const { colors } = useAppTheme();
  const slide = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(slide, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [value, slide]);

  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.inkSoft }]}>{label}</Text>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        onPress={() => {
          onChange(!value);
        }}
        style={[
          styles.track,
          {
            backgroundColor: value ? colors.focus : colors.chipBg,
            borderRadius: 999,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.knob,
            { transform: [{ translateX }], borderRadius: 999 },
          ]}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
  },
  track: {
    width: 46,
    height: 26,
    justifyContent: 'center',
  },
  knob: {
    width: 20,
    height: 20,
    marginLeft: 3,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});
