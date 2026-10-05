import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { sessionDates } from '../domain/sessions';
import { computeStreak } from '../domain/streak';
import { useAppData } from '../state/AppDataContext';
import { useAppTheme } from '../theme/ThemeContext';

export function ProfileScreen() {
  const { colors } = useAppTheme();
  const { sessions } = useAppData();

  const streak = computeStreak(sessionDates(sessions));

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.viewTitle, { color: colors.inkSoft }]}>Your progress</Text>

      <Card style={styles.statsCard}>
        <View style={styles.stats}>
          <View
            style={[
              styles.stat,
              {
                backgroundColor: colors.settingBg,
                borderColor: colors.line,
                borderWidth: 1,
                borderRadius: 14,
              },
            ]}
          >
            <Text style={[styles.statNumber, { color: colors.ink }]}>{sessions.length}</Text>
            <Text style={[styles.statLabel, { color: colors.inkSoft }]}>sessions</Text>
          </View>

          <View
            style={[
              styles.stat,
              {
                backgroundColor: colors.settingBg,
                borderColor: colors.line,
                borderWidth: 1,
                borderRadius: 14,
              },
            ]}
          >
            <Text style={[styles.statNumber, { color: colors.ink }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.inkSoft }]}>streak</Text>
          </View>
        </View>
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
  statsCard: {
    padding: 22,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
