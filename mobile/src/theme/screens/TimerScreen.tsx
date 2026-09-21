import { useEffect, useState } from "react";
import {Button, StyleSheet, Text, View} from 'react-native';
import { useAppTheme } from "../ThemeContext";


const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

type Phase = 'focus' | 'break';

export function TimerScreen() {
    const{ colors } = useAppTheme();

    const [phase, setPhase] = useState<Phase>('focus');
    const [remaining, setRemaining] = useState(FOCUS_SECONDS);
    const [running, setRunning] = useState(false);

    // tick once per second
  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setRemaining((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [running]);

  // when 0, swap phases and reload click
  useEffect(() => {
    if (remaining > 0) return;

    if (phase === 'focus') {
        setPhase('break');
        setRemaining(BREAK_SECONDS);
    } else {
        setPhase('focus');
        setRemaining(FOCUS_SECONDS);    
    }
  }, [remaining, phase]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const accent = phase === 'focus' ? colors.focus : colors.breakColor;
  
  function reset() {
    setRunning(false);
    setPhase('focus');
    setRemaining(FOCUS_SECONDS);
  }

return (
    <View style={styles.container}>
      <Text style={[styles.phaseLabel, { color: colors.inkSoft }]}>
        {phase === 'focus' ? 'FOCUS' : 'BREAK'}
      </Text>

      <Text style={[styles.time, { color: accent }]}>{display}</Text>

      <View style={styles.buttonRow}>
        <Button
          title={running ? 'Pause' : 'Start'}
          onPress={() => setRunning((prev) => !prev)}
        />
        <Button title="Reset" onPress={reset} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 24 },
  phaseLabel: { fontSize: 16, fontWeight: '600', letterSpacing: 4 },
  time: { fontSize: 72, fontWeight: '700', fontVariant: ['tabular-nums'] },
  buttonRow: { flexDirection: 'row', gap: 16 },
});
