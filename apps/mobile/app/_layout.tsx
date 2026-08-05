import type { ReactElement } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ShellSyncHost } from '../src/components/shell/shell-sync-host';
import { useAppSplashScreen } from '../src/hooks/use-app-splash-screen';

void SplashScreen.preventAutoHideAsync().catch(() => {
  // 部分环境可能不支持 splash API；不阻断启动
});

export default function RootLayout(): ReactElement {
  useAppSplashScreen();

  return (
    <>
      <ShellSyncHost />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
