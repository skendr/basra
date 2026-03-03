import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { colors } from '../src/theme';

const MAX_APP_WIDTH = 480;

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.appWrapper}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'slide_from_right',
          }}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
  appWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    alignSelf: 'center',
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
});
