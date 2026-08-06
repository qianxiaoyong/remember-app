import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { AppDrawer } from '../../src/components/shell/app-drawer';
import { CapsuleBar, type CapsuleTab } from '../../src/components/shell/capsule-bar';
import {
  consumeShellTabTransition,
  navigateShellTab,
  SHELL_TAB_ANIMATION_DURATION_MS,
} from '../../src/shell/shell-tab-transition';
import { ShellProvider, useDrawerOpen, useShellActions } from '../../src/shell/shell-provider';
import { colors } from '../../src/theme/colors';

export default function ShellLayout(): ReactElement {
  return (
    <ShellProvider>
      <ShellLayoutInner />
    </ShellProvider>
  );
}

function ShellDrawerHost(): ReactElement {
  const isDrawerOpen = useDrawerOpen();
  const { closeDrawer, dismissDrawer } = useShellActions();
  return <AppDrawer onClose={closeDrawer} onDismiss={dismissDrawer} visible={isDrawerOpen} />;
}

function ShellCapsuleTabBar(): ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const { closeDrawer } = useShellActions();
  const activeTab: CapsuleTab = pathname.includes('/market') ? 'market' : 'library';

  return (
    <CapsuleBar
      activeTab={activeTab}
      onTabPress={(tab) => {
        closeDrawer();
        const target = tab === 'market' ? '/market' : '/library';
        if (pathname.includes(target)) {
          return;
        }
        navigateShellTab(router, tab);
      }}
    />
  );
}

function ShellLayoutInner(): ReactElement {
  return (
    <View style={styles.root}>
      <Stack
        screenOptions={() => ({
          animation: consumeShellTabTransition(),
          animationDuration: SHELL_TAB_ANIMATION_DURATION_MS,
          contentStyle: {
            backgroundColor: colors.background,
          },
          freezeOnBlur: true,
          headerShown: false,
          presentation: 'card',
        })}
      />
      <ShellCapsuleTabBar />
      <ShellDrawerHost />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
