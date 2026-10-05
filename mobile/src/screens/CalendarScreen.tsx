import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card } from '../components/Card';
import {
  WEEKDAY_LABELS,
  formatLongDate,
  formatMonthTitle,
  formatTime,
  monthCells,
  todayKey,
} from '../domain/date';
import { averageRatingColor, ratingColor, ratingEmoji } from '../domain/rating';
import { byTimeAscending, groupByDate, sessionDates } from '../domain/sessions';
import { computeBestStreak, computeStreak } from '../domain/streak';
import type { Rating, Session } from '../domain/types';
import { useAppData } from '../state/AppDataContext';
import { useAppTheme } from '../theme/ThemeContext';

const RATING_CHOICES: { value: Rating; emoji: string; label: string }[] = [
  { value: 1, emoji: '😞', label: 'Rough' },
  { value: 2, emoji: '😐', label: 'Okay' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '🤩', label: 'Great' },
];

const LEGEND = [
  { color: '#2f9e7f', label: 'Great' },
  { color: '#a3c94f', label: 'Good' },
  { color: '#e8a13f', label: 'Okay' },
  { color: '#e8553f', label: 'Rough' },
  { color: '#b9b3aa', label: 'No rating' },
];

export function CalendarScreen() {
  const { colors, retro } = useAppTheme();
  const { sessions, addSession, dayNotes, setDayNote } = useAppData();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(todayKey());

  const [logging, setLogging] = useState(false);

  const byDate = useMemo(() => groupByDate(sessions), [sessions]);
  const streak = useMemo(() => computeStreak(sessionDates(sessions)), [sessions]);
  const best = useMemo(() => computeBestStreak(sessionDates(sessions)), [sessions]);

  const cells = useMemo(() => monthCells(year, month), [year, month]);
  const entries = useMemo(
    () => (byDate[selected] ?? []).slice().sort(byTimeAscending),
    [byDate, selected]
  );

  const today = todayKey();
  const savedNote = dayNotes[selected] ?? '';

  function shiftMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function logForSelectedDay(rating: Rating) {
    const session: Session = {
      date: selected,
      phase: 'focus',
      seconds: 0,
      completedAt: Date.now(),
      skipped: false,
      rating,
    };
    addSession(session);
    setLogging(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.viewTitle, { color: colors.inkSoft }]}>Session history</Text>

      <Card style={styles.streakCard}>
        <View style={styles.streakStats}>
          <View style={styles.streakStat}>
            <Text style={[styles.streakNumber, { color: colors.ink }]}>{streak}</Text>
            <Text style={[styles.streakLabel, { color: colors.inkSoft }]}>day streak</Text>
          </View>
          <View style={styles.streakStat}>
            <Text style={[styles.streakNumber, { color: colors.ink }]}>{best}</Text>
            <Text style={[styles.streakLabel, { color: colors.inkSoft }]}>best streak</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.calCard}>
        <View style={styles.calHeader}>
          <Pressable
            accessibilityLabel="Previous month"
            onPress={() => shiftMonth(-1)}
            style={[
              styles.calNav,
              { backgroundColor: colors.chipBg, borderRadius: retro ? 2 : 10 },
            ]}
          >
            <Text style={[styles.calNavLabel, { color: colors.ink }]}>‹</Text>
          </Pressable>

          <Text style={[styles.calTitle, { color: colors.ink }]}>
            {formatMonthTitle(year, month)}
          </Text>

          <Pressable
            accessibilityLabel="Next month"
            onPress={() => shiftMonth(1)}
            style={[
              styles.calNav,
              { backgroundColor: colors.chipBg, borderRadius: retro ? 2 : 10 },
            ]}
          >
            <Text style={[styles.calNavLabel, { color: colors.ink }]}>›</Text>
          </Pressable>
        </View>

        <View style={styles.calWeekdays}>
          {WEEKDAY_LABELS.map((label, index) => (
            <Text key={index} style={[styles.weekday, { color: colors.inkSoft }]}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.calGrid}>
          {cells.map((cell, index) => {
            if (cell === null) return <View key={index} style={styles.calCell} />;

            const dayEntries = byDate[cell.key] ?? [];
            const isToday = cell.key === today;
            const isSelected = cell.key === selected;

            return (
              <Pressable
                key={cell.key}
                onPress={() => {
                  setSelected(cell.key);
                }}
                style={[
                  styles.calCell,
                  { borderRadius: retro ? 2 : 10 },
                  isSelected && { backgroundColor: colors.focus },
                  isToday && !isSelected && { borderWidth: 2, borderColor: colors.focus },
                ]}
              >
                <Text
                  style={[
                    styles.calDay,
                    { color: isSelected ? '#ffffff' : colors.ink },
                    (isToday || isSelected) && styles.calDayStrong,
                  ]}
                >
                  {cell.day}
                </Text>

                {dayEntries.length > 0 && (
                  <View
                    style={[
                      styles.calDot,
                      {
                        backgroundColor: isSelected
                          ? '#ffffff'
                          : averageRatingColor(dayEntries),
                      },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.legend}>
          {LEGEND.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={[styles.legendLabel, { color: colors.inkSoft }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.detailCard}>
        <Text style={[styles.detailDate, { color: colors.ink }]}>{formatLongDate(selected)}</Text>

        <Text style={[styles.detailSummary, { color: colors.inkSoft }]}>
          {entries.length === 0
            ? 'No sessions logged yet'
            : `${entries.length} session${entries.length > 1 ? 's' : ''}`}
        </Text>

        {entries.length === 0 ? (
          <Text style={[styles.detailEmpty, { color: colors.inkSoft }]}>
            Log a session to start tracking your focus.
          </Text>
        ) : (
          entries.map((entry) => (
            <View
              key={`${entry.completedAt}-${entry.rating ?? 'none'}`}
              style={[styles.entry, { borderBottomColor: colors.line }]}
            >
              <Text style={[styles.entryEmoji, { color: ratingColor(entry.rating) }]}>
                {ratingEmoji(entry.rating)}
              </Text>
              <Text style={[styles.entryLabel, { color: colors.ink }]}>
                {entry.skipped ? 'Skipped session' : 'Focus session'}
              </Text>
              <Text style={[styles.entryTime, { color: colors.inkSoft }]}>
                {entry.seconds > 0 ? `${Math.round(entry.seconds / 60)} min` : ''}
              </Text>
              <Text style={[styles.entryTime, { color: colors.inkSoft }]}>
                {formatTime(entry.completedAt)}
              </Text>
            </View>
          ))
        )}

        {logging ? (
          <View style={styles.ratingRow}>
            {RATING_CHOICES.map((choice) => (
              <Pressable
                key={choice.value}
                accessibilityLabel={choice.label}
                onPress={() => logForSelectedDay(choice.value)}
                style={[
                  styles.ratingOption,
                  { backgroundColor: colors.chipBg, borderRadius: retro ? 2 : 14 },
                ]}
              >
                <Text style={styles.ratingEmoji}>{choice.emoji}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable
            onPress={() => setLogging(true)}
            style={[
              styles.logButton,
              { backgroundColor: colors.chipBg, borderRadius: retro ? 2 : 999 },
            ]}
          >
            <Text style={[styles.logLabel, { color: colors.ink }]}>
              + Log a session for this day
            </Text>
          </Pressable>
        )}

        <Text style={[styles.noteLabel, { color: colors.inkSoft }]}>Notes for this day</Text>
        <TextInput
          value={savedNote}
          onChangeText={(text) => setDayNote(selected, text)}
          placeholder="Add a note for this day…"
          placeholderTextColor={colors.inkSoft}
          multiline
          style={[
            styles.noteInput,
            {
              color: colors.ink,
              backgroundColor: colors.settingBg,
              borderColor: colors.line,
              borderRadius: retro ? 2 : 12,
            },
          ]}
        />
        {savedNote.length > 0 && (
          <Text style={[styles.savedLabel, { color: colors.inkSoft }]}>Saved</Text>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  viewTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
  },
  streakCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  streakStat: {
    alignItems: 'center',
    gap: 2,
  },
  streakNumber: {
    fontSize: 26,
    fontWeight: '800',
  },
  streakLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calCard: {
    padding: 20,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 14,
  },
  calNav: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calNavLabel: {
    fontSize: 20,
    lineHeight: 24,
  },
  calTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  calWeekdays: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 6,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  calCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDay: {
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  calDayStrong: {
    fontWeight: '800',
  },
  calDot: {
    position: 'absolute',
    bottom: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
  },
  detailCard: {
    marginTop: 14,
    alignItems: 'stretch',
  },
  detailDate: {
    fontWeight: '700',
    fontSize: 15,
  },
  detailSummary: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10,
  },
  detailEmpty: {
    fontSize: 13,
    marginBottom: 6,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  entryEmoji: {
    fontSize: 20,
  },
  entryLabel: {
    flex: 1,
    fontSize: 14,
  },
  entryTime: {
    fontSize: 13,
  },
  logButton: {
    marginTop: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  ratingOption: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingEmoji: {
    fontSize: 28,
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noteInput: {
    minHeight: 90,
    padding: 12,
    borderWidth: 1,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  savedLabel: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'right',
  },
});
