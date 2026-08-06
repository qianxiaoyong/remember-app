import type { ReactElement } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ShellSyncHost } from '../src/components/shell/shell-sync-host';
import { useAppSplashScreen } from '../src/hooks/use-app-splash-screen';
import { markSplashOverlayReady } from '../src/shell/splash-overlay-ready';
import { colors } from '../src/theme/colors';
import splashImage from '../assets/images/splash-full.png';

export default function RootLayout(): ReactElement {
  const splashVisible = useAppSplashScreen();

  return (
    <View style={styles.root}>
      <ShellSyncHost />
      <Stack screenOptions={{ contentStyle: styles.stackContent, headerShown: false }} />
      {splashVisible ? (
        <View pointerEvents="none" style={styles.splashOverlay}>
          <Image
            onLoadEnd={markSplashOverlayReady}
            resizeMode="cover"
            source={splashImage}
            style={styles.splashImage}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  stackContent: {
    backgroundColor: colors.background,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    elevation: 9999,
    zIndex: 9999,
  },
  splashImage: {
    height: '100%',
    width: '100%',
  },
});
