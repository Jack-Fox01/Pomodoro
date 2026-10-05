import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '../theme/ThemeContext';

type StepperProps = {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
};

/** A settings row: label on the left, − [input] unit + on the right. */
export function Stepper({
  label,
  hint,
  value,
  min,
  max,
  unit = 'min',
  onChange,
}: StepperProps) {
  const { colors, retro } = useAppTheme();
  const [text, setText] = useState(String(value));

  // Sync when the value changes from outside the field (+/−, presets).
  useEffect(() => {
    setText(String(value));
  }, [value]);

  function commit(raw: string) {
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setText(String(value));
      return;
    }
    const clamped = Math.max(min, Math.min(max, parsed));
    setText(String(clamped));
    onChange(clamped);
  }

  function step(delta: number) {
    onChange(Math.max(min, Math.min(max, value + delta)));
  }

  const controlRadius = retro ? 2 : 10;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.settingBg,
          borderColor: colors.line,
          borderRadius: retro ? 2 : 16,
          borderWidth: retro ? 2 : 1,
        },
      ]}
    >
      <View style={styles.labels}>
        <Text style={[styles.label, { color: colors.ink }]}>{label}</Text>
        <Text style={[styles.hint, { color: colors.inkSoft }]}>{hint}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityLabel={`Decrease ${label}`}
          onPress={() => step(-1)}
          style={[styles.button, { backgroundColor: colors.chipBg, borderRadius: controlRadius }]}
        >
          <Text style={[styles.buttonLabel, { color: colors.ink }]}>−</Text>
        </Pressable>

        <TextInput
          value={text}
          onChangeText={setText}
          onEndEditing={() => commit(text)}
          onBlur={() => commit(text)}
          keyboardType="number-pad"
          maxLength={3}
          style={[
            styles.input,
            {
              color: colors.ink,
              backgroundColor: colors.card,
              borderColor: colors.line,
              borderRadius: controlRadius,
            },
          ]}
        />

        <Text style={[styles.unit, { color: colors.inkSoft }]}>{unit}</Text>

        <Pressable
          accessibilityLabel={`Increase ${label}`}
          onPress={() => step(1)}
          style={[styles.button, { backgroundColor: colors.chipBg, borderRadius: controlRadius }]}
        >
          <Text style={[styles.buttonLabel, { color: colors.ink }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  labels: {
    flex: 1,
    gap: 2,
    paddingRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  input: {
    width: 52,
    paddingVertical: 7,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 12,
  },
});
