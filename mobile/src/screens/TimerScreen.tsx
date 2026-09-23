import { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { BreakOverlay } from '../components/BreakOverlay';
import { addSession, loadSessions } from '../data/sessions';
import { todayKey } from '../domain/date';
import { formatClock } from '../domain/time';
import type { Phase, Session } from '../domain/types';
import { useAppTheme } from '../theme/ThemeContext';

const FOCUS_SECONDS = 10; // 25 * 60
const BREAK_SECONDS = 15; // 5 * 60

const RING_SIZE = 260;
const RING_STROKE = 16;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const TICK_MS = 200;

export function TimerScreen() {
  const { colors } = useAppTheme();

  const [phase, setPhase] = useState<Phase>('focus');
  const [remaining, setRemaining] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const [todayCount, setTodayCount] = useState(0);

  // Wall-clock deadline (ms since epoch). A ref, not state: it is never rendered.
  const deadlineRef = useRef(0);

  // Load today's focus count once, on mount.
  useEffect(() => {
    loadSessions().then((all) => {
      const today = todayKey();
      setTodayCount(all.filter((s) => s.date === today && s.phase === 'focus').length);
    });
  }, []);

  // Tick often, but always RECOMPUTE from the clock — never count ticks.
  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setRemaining(left);
    }, TICK_MS);

    return () => clearInterval(id);
  }, [running]);

  // Zero → record a finished focus run, start the break, or end the break.
  useEffect(() => {
    if (remaining > 0) return;

    if (phase === 'focus') {
      const session: Session = {
        date: todayKey(),
        phase: 'focus',
        seconds: FOCUS_SECONDS,
        completedAt: deadlineRef.current,
        skipped: false,
      };
      addSession(session).then(() => setTodayCount((prev) => prev + 1));

      setPhase('break');
      setRemaining(BREAK_SECONDS);
      deadlineRef.current = Date.now() + BREAK_SECONDS * 1000;
    } else {
      setPhase('focus');
      setRemaining(FOCUS_SECONDS);
      setRunning(false);
    }
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

  /** The user confirmed ending the break early. Log it as skipped, then reset to focus. */
  function endBreak() {
    const session: Session = {
      date: todayKey(),
      phase: 'break',
      seconds: BREAK_SECONDS - remaining,
      completedAt: Date.now(),
      skipped: true,
    };
    addSession(session);

    setRunning(false);
    setPhase('focus');
    setRemaining(FOCUS_SECONDS);
  }

  // Derived — not state.
  const display = formatClock(remaining);

  const total = phase === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
  const progress = remaining / total;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  const accent = phase === 'focus' ? colors.focus : colors.breakColor;

  return (
    <View style={styles.container}>
      <Text style={[styles.phaseLabel, { color: colors.inkSoft }]}>
        {phase === 'focus' ? 'FOCUS' : 'BREAK'}
      </Text>

      <Text style={[styles.sessionCount, { color: colors.inkSoft }]}>
        {`Focus today: ${todayCount}`}
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

      <BreakOverlay
        visible={phase === 'break'}
        secondsLeft={remaining}
        onEndBreak={endBreak}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 24 },
  phaseLabel: { fontSize: 16, fontWeight: '600', letterSpacing: 4 },
  sessionCount: { fontSize: 14 },
  ringWrap: { width: RING_SIZE, height: RING_SIZE },
  ringCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: { fontSize: 64, fontWeight: '700', fontVariant: ['tabular-nums'] },
  buttonRow: { flexDirection: 'row', gap: 16 },
});