import { StyleSheet, Text, View } from 'react-native';

type ModePillProps = {
  label: string;
  color: string;
};

/** The '🍅 Focus' / '🌿 Break' badge above the timer. */
export function ModePill({ label, color }: ModePillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: color }]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  label: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
