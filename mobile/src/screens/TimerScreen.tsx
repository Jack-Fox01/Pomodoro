import { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAppTheme } from '../theme/ThemeContext';

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

const RING_SIZE = 260;
const RING_STROKE = 16;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const TICK_MS = 200;

type Phase = 'focus' | 'break';

export function TimerScreen() {
  const { colors } = useAppTheme();

  const [phase, setPhase] = useState<Phase>('focus');
  const [remaining, setRemaining] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);

  // Wall-clock deadline (ms since epoch). A ref, not state: it is never rendered.
  const deadlineRef = useRef(0);

  // Tick often, but always RECOMPUTE from the clock — never count ticks.
  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setRemaining(left);
    }, TICK_MS);

    return () => clearInterval(id);
  }, [running]);

  // Zero → swap phase, reload the clock, re-arm the deadline so it keeps running.
  useEffect(() => {
    if (remaining > 0) return;

    const nextPhase: Phase = phase === 'focus' ? 'break' : 'focus';
    const nextSeconds = nextPhase === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;

    setPhase(nextPhase);
    setRemaining(nextSeconds);
    deadlineRef.current = Date.now() + nextSeconds * 1000;
  }, [remaining, phase]);

  function toggleRunning() {
    if (running) {
      setRunning(false);
    } else {
      deadlineRef.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  }

  function reset() {
    setRunning(false);
    setPhase('focus');
    setRemaining(FOCUS_SECONDS);
  }

  // Derived — not state.
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const total = phase === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
  const progress = remaining / total;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  const accent = phase === 'focus' ? colors.focus : colors.breakColor;

  return (
    <View style={styles.container}>
      <Text style={[styles.phaseLabel, { color: colors.inkSoft }]}>
        {phase === 'focus' ? 'FOCUS' : 'BREAK'}
      </Text>

      <View style={styles.ringWrap}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={colors.ringTrack}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={accent}
            strokeWidth={RING_STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </Svg>

        <View style={styles.ringCenter}>
          <Text style={[styles.time, { color: accent }]}>{display}</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Button title={running ? 'Pause' : 'Start'} onPress={toggleRunning} />
        <Button title="Reset" onPress={reset} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 24 },
  phaseLabel: { fontSize: 16, fontWeight: '600', letterSpacing: 4 },
  ringWrap: { width: RING_SIZE, height: RING_SIZE },
  ringCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: { fontSize: 64, fontWeight: '700', fontVariant: ['tabular-nums'] },
  buttonRow: { flexDirection: 'row', gap: 16 },
});