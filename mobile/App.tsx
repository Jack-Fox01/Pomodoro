import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Button } from 'react-native';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { TimerScreen } from './src/screens/TimerScreen';


function Home() {
  const { colors, dark, retro, toggleDark, toggleRetro} = useAppTheme();

  return (
    <View style={[styles.container, {backgroundColor: colors.pageBg }]}>
      <TimerScreen/>
      <Button title={dark ? 'Dark : ON' : 'Dark : OFF'} onPress={toggleDark}/>
      <Button title={retro ? 'Retro : ON' : 'Retro : OFF'} onPress={toggleRetro}/>
    </View>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Home />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
});
