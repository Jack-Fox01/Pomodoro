import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme/ThemeContext';

export type TabKey = 'timer' | 'calendar' | 'notes' | 'profile';

const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: 'timer', icon: '⏱', label: 'Timer' },
  { key: 'calendar', icon: '📅', label: 'Calendar' },
  { key: 'notes', icon: '📝', label: 'Notes' },
  { key: 'profile', icon: '👤', label: 'Profile' },
];

type TabBarProps = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

/** The floating pill along the bottom. */
export function TabBar({ active, onChange }: TabBarProps) {
  const { colors, retro } = useAppTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.card,
          borderColor: colors.line,
          borderWidth: retro ? 2 : 1,
          borderRadius: retro ? 2 : 999,
        },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.key)}
            style={[
              styles.tab,
              {
                backgroundColor: isActive ? colors.chipBg : 'transparent',
                borderRadius: retro ? 2 : 999,
              },
            ]}
          >
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text style={[styles.label, { color: isActive ? colors.ink : colors.inkSoft }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    gap: 6,
    padding: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 7,
  },
  icon: {
    fontSize: 20,
    lineHeight: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
