import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { useAppTheme } from '../theme/ThemeContext';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** The rounded panel everything sits in. */
export function Card({ children, style }: CardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.line,
          borderWidth: 1,
          borderRadius: 26,
          padding: 26,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 5,
  },
});
