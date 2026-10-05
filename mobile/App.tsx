import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { TabBar } from './src/components/TabBar';
import type { TabKey } from './src/components/TabBar';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { NotesScreen } from './src/screens/NotesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { TimerScreen } from './src/screens/TimerScreen';
import { AppDataProvider, useAppData } from './src/state/AppDataContext';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';

function Shell() {
  const { colors } = useAppTheme();
  const { ready } = useAppData();
  const [tab, setTab] = useState<TabKey>('timer');

  return (
    <View style={[styles.root, { backgroundColor: colors.pageBg }]}>
      {!ready ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.focus} />
        </View>
      ) : (
        <>
          {/* Every screen stays mounted and the inactive ones are hidden.
              That matters: unmounting TimerScreen would throw away a
              running timer the moment you looked at another tab. */}
          <View style={[styles.screen, tab !== 'timer' && styles.hidden]}>
            <TimerScreen />
          </View>
          <View style={[styles.screen, tab !== 'calendar' && styles.hidden]}>
            <CalendarScreen />
          </View>
          <View style={[styles.screen, tab !== 'notes' && styles.hidden]}>
            <NotesScreen />
          </View>
          <View style={[styles.screen, tab !== 'profile' && styles.hidden]}>
            <ProfileScreen />
          </View>

          <TabBar active={tab} onChange={setTab} />
        </>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <Shell />
      </AppDataProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
});
