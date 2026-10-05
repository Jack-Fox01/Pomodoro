import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BreakOverlay } from '../components/BreakOverlay';
import { Card } from '../components/Card';import { Confetti } from '../components/Confetti';
import { ModePill } from '../components/ModePill';
import { ProgressRing } from '../components/ProgressRing';
import { RatingModal } from '../components/RatingModal';
import { Stepper } from '../components/Stepper';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { Toast } from '../components/Toast';
import { ChallengeGame } from '../components/challenges/ChallengeGame';
import { todayKey } from '../domain/date';
import { sessionDates } from '../domain/sessions';
import { computeStreak } from '../domain/streak';
import { formatClock } from '../domain/time';
import type { ChallengeType, Phase, Rating, Session } from '../domain/types';
import { useAppData } from '../state/AppDataContext';
import { useAppTheme } from '../theme/ThemeContext';

const TICK_MS = 200;
const RING_SIZE = Math.min(300, Dimensions.get('window').width - 120);

const CHALLENGE_LABELS: { value: ChallengeType; label: string }[] = [
  { value: 'math', label: 'Maths' },
  { value: 'tiles', label: 'Tiles' },
  { value: 'boss', label: 'Boss' },
  { value: 'random', label: 'Random' },
];

const PRESETS = [
  { focus: 25, rest: 5, label: '25 / 5' },
  { focus: 50, rest: 10, label: '50 / 10' },
  { focus: 90, rest: 20, label: '90 / 20' },
];

export function TimerScreen() {
  const { colors, dark, toggleDark } = useAppTheme();
  const {
    sessions,
    addSession,
    settings,
    setFocusMinutes,
    setBreakMinutes,
    setChallenge,
  } = useAppData();

  const focusSeconds = settings.focusMinutes * 60;
  const breakSeconds = settings.breakMinutes * 60;

  const [phase, setPhase] = useState<Phase>('focus');
  const [remaining, setRemaining] = useState(focusSeconds);
  const [running, setRunning] = useState(false);
  const [breakActive, setBreakActive] = useState(false);

  const [challengeOpen, setChallengeOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  const [celebrating, setCelebrating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Wall-clock deadline. A ref, because it is never rendered.
  const deadlineRef = useRef(0);
  // What the rating modal is about to log.
  const pendingRef = useRef<{ seconds: number; skipped: boolean }>({
    seconds: focusSeconds,
    skipped: false,
  });

  const streak = useMemo(() => computeStreak(sessionDates(sessions)), [sessions]);

  // Tick often, but always RECOMPUTE from the clock — never count ticks.
  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setRemaining(left);
    }, TICK_MS);

    return () => clearInterval(id);
  }, [running]);

  // Zero → the focus run is over (open the rating), or the break is over.
  useEffect(() => {
    if (remaining > 0) return;

    if (phase === 'focus') {
      pendingRef.current = { seconds: focusSeconds, skipped: false };
      setPhase('break');
      setRemaining(breakSeconds);
      setRunning(false);
      setRatingOpen(true);
    } else {
      setBreakActive(false);
      setRunning(false);
      setPhase('focus');
      setRemaining(focusSeconds);
    }
    // focusSeconds / breakSeconds come from the render that changed `remaining`,
    // so they are already fresh and must not be dependencies here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setBreakActive(false);
    setPhase('focus');
    setRemaining(focusSeconds);
  }

  function changeFocusMinutes(minutes: number) {
    setFocusMinutes(minutes);
    if (!running && phase === 'focus') setRemaining(minutes * 60);
  }

  function changeBreakMinutes(minutes: number) {
    setBreakMinutes(minutes);
    if (!running && phase === 'break') setRemaining(minutes * 60);
  }

  function applyPreset(focus: number, rest: number) {
    setFocusMinutes(focus);
    setBreakMinutes(rest);
    if (!running) {
      setPhase('focus');
      setBreakActive(false);
      setRemaining(focus * 60);
    }
  }

  function startBreak() {
    deadlineRef.current = Date.now() + breakSeconds * 1000;
    setBreakActive(true);
    setRunning(true);
  }

  /** Break ended early through the overlay's yes/no step. Breaks are not logged. */
  function endBreak() {
    setBreakActive(false);
    setRunning(false);
    setPhase('focus');
    setRemaining(focusSeconds);
  }

  function openChallenge() {
    setRunning(false); // you cannot earn a skip while the clock runs
    setChallengeOpen(true);
  }

  function cancelChallenge() {
    setChallengeOpen(false);
    setRunning(true);
  }

  /** Challenge beaten: the focus run counts as skipped. */
  function finishChallenge() {
    pendingRef.current = { seconds: focusSeconds - remaining, skipped: true };
    setChallengeOpen(false);
    setPhase('break');
    setRemaining(breakSeconds);
    setRatingOpen(true);
  }

  function finishRating(rating: Rating | null) {
    const pending = pendingRef.current;

    const session: Session = {
      date: todayKey(),
      phase: 'focus',
      seconds: pending.seconds,
      completedAt: Date.now(),
      skipped: pending.skipped,
      rating,
    };

    const streakBefore = computeStreak(sessionDates(sessions));
    const streakAfter = computeStreak(sessionDates([...sessions, session]));

    addSession(session);
    setRatingOpen(false);

    // Beating a challenge and extending a streak are both worth a fanfare.
    const beatChallenge = pending.skipped;
    const extendedStreak = streakAfter > streakBefore;

    if (beatChallenge || extendedStreak) {
      setCelebrating(true);
    }

    if (extendedStreak) setToast(`🔥 ${streakAfter}-day streak!`);

    startBreak();
  }

  const display = formatClock(remaining);
  const total = phase === 'focus' ? focusSeconds : breakSeconds;
  const progress = total > 0 ? remaining / total : 0;
  const accent = phase === 'focus' ? colors.focus : colors.breakColor;

  const streakText =
    streak > 0
      ? `🔥 ${streak} day streak — keep it going!`
      : '🌱 No streak yet — log a session today to start one';

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.streak, { color: colors.inkSoft }]}>{streakText}</Text>

        <View style={styles.pillRow}>
          <ModePill label={phase === 'focus' ? '🍅 Focus' : '🌿 Break'} color={accent} />
        </View>

        <Card>
          <ProgressRing
            size={RING_SIZE}
            strokeWidth={14}
            progress={progress}
            color={accent}
            trackColor={colors.ringTrack}
          >
            <Text style={[styles.time, { color: colors.ink }]}>{display}</Text>
            <Text style={[styles.timeLabel, { color: colors.inkSoft }]}>
              {phase === 'focus' ? 'Focus session' : 'Rest session'}
            </Text>
          </ProgressRing>

          <View style={styles.controls}>
            <Pressable
              onPress={() => {
                reset();
              }}
              style={[
                styles.ghost,
                { backgroundColor: colors.chipBg, borderRadius: 999 },
              ]}
            >
              <Text style={[styles.ghostLabel, { color: colors.ink }]}>Reset</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                toggleRunning();
              }}
              style={[styles.primary, { backgroundColor: accent, borderRadius: 999 }]}
            >
              <Text style={styles.primaryLabel}>{running ? 'Pause' : 'Start'}</Text>
            </Pressable>

            {phase === 'focus' && (
              <Pressable
                onPress={() => {
                  openChallenge();
                }}
                style={[
                  styles.ghost,
                  { backgroundColor: colors.chipBg, borderRadius: 999 },
                ]}
              >
                <Text style={[styles.ghostLabel, { color: colors.ink }]}>Skip</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.settings}>
            <Stepper
              label="Focus length"
              hint="Deep-work session"
              value={settings.focusMinutes}
              min={1}
              max={240}
              onChange={changeFocusMinutes}
            />

            <Stepper
              label="Break length"
              hint="Rest session"
              value={settings.breakMinutes}
              min={1}
              max={120}
              onChange={changeBreakMinutes}
            />

            <View
              style={[
                styles.stack,
                {
                  backgroundColor: colors.settingBg,
                  borderColor: colors.line,
                  borderWidth: 1,
                  borderRadius: 16,
                },
              ]}
            >
              <View style={styles.stackLabels}>
                <Text style={[styles.settingLabel, { color: colors.ink }]}>Skip challenge</Text>
                <Text style={[styles.settingHint, { color: colors.inkSoft }]}>
                  Game to beat when you skip a focus session
                </Text>
              </View>

              <View style={styles.challengeRow}>
                {CHALLENGE_LABELS.map((option) => {
                  const isActive = settings.challenge === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        setChallenge(option.value);
                      }}
                      style={[
                        styles.challengeOption,
                        {
                          backgroundColor: isActive ? colors.focusDeep : colors.chipBg,
                          borderRadius: 12,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.challengeLabel,
                          { color: isActive ? '#ffffff' : colors.inkSoft },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View
              style={[
                styles.stack,
                {
                  backgroundColor: colors.settingBg,
                  borderColor: colors.line,
                  borderWidth: 1,
                  borderRadius: 16,
                },
              ]}
            >
              <View style={styles.stackLabels}>
                <Text style={[styles.settingLabel, { color: colors.ink }]}>Appearance</Text>
                <Text style={[styles.settingHint, { color: colors.inkSoft }]}>
                  Theme &amp; dark mode
                </Text>
              </View>

              <ToggleSwitch label="Dark mode" value={dark} onChange={toggleDark} />
            </View>

            <View style={styles.presets}>
              {PRESETS.map((preset) => {
                const isActive =
                  settings.focusMinutes === preset.focus && settings.breakMinutes === preset.rest;
                return (
                  <Pressable
                    key={preset.label}
                    onPress={() => {
                      applyPreset(preset.focus, preset.rest);
                    }}
                    style={[
                      styles.preset,
                      {
                        backgroundColor: isActive ? colors.focusDeep : colors.chipBg,
                        borderRadius: 999,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.presetLabel, { color: isActive ? '#ffffff' : colors.inkSoft }]}
                    >
                      {preset.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Card>

        <Text style={[styles.note, { color: colors.inkSoft }]}>
          <Text style={[styles.noteStrong, { color: colors.ink }]}>Skip:</Text> beat a quick game to
          end a focus session early — it still logs to your history.{' '}
          <Text style={[styles.noteStrong, { color: colors.ink }]}>Break:</Text> ending early just
          asks for a yes/no confirmation.
        </Text>
      </ScrollView>

      <BreakOverlay visible={breakActive} secondsLeft={remaining} onEndBreak={endBreak} />

      {challengeOpen && (
        <ChallengeGame
          type={settings.challenge}
          onComplete={finishChallenge}
          onCancel={cancelChallenge}
        />
      )}

      {ratingOpen && (
        <RatingModal
          title="How did that session go?"
          onPick={(rating) => finishRating(rating)}
          onSkip={() => finishRating(null)}
        />
      )}

      {celebrating && <Confetti onDone={() => setCelebrating(false)} />}
      {toast !== null && <Toast message={toast} onHide={() => setToast(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  streak: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
  },
  pillRow: {
    alignItems: 'center',
    marginBottom: 22,
  },
  time: {
    fontSize: 62,
    fontWeight: '700',
    lineHeight: 68,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  primary: {
    minWidth: 128,
    paddingVertical: 15,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  ghost: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settings: {
    marginTop: 20,
    width: '100%',
    gap: 14,
  },
  stack: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  stackLabels: {
    gap: 2,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  challengeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  challengeOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  challengeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  preset: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  presetLabel: {
    fontSize: 13,
  },
  note: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 12.5,
    lineHeight: 18,
  },
  noteStrong: {
    fontWeight: '700',
  },
});
