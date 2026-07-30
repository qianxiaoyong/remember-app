import type { ReactElement } from 'react';
import { Stack } from 'expo-router';
import { ShellSyncHost } from '../src/components/shell/shell-sync-host';

export default function RootLayout(): ReactElement {
  return (
    <>
      <ShellSyncHost />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
