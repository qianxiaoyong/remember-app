import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { AppDrawer } from '../../src/components/shell/app-drawer';
import { CapsuleBar, type CapsuleTab } from '../../src/components/shell/capsule-bar';
import {
  navigateShellTab,
  resolveShellTabFromPathname,
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
  const activeTab: CapsuleTab = resolveShellTabFromPathname(pathname);

  return (
    <CapsuleBar
      activeTab={activeTab}
      onTabPress={(tab) => {
        closeDrawer();
        const target = tab === 'market' ? '/market' : tab === 'review' ? '/review' : '/library';
        if (pathname.includes(target)) {
          return;
        }
        navigateShellTab(router, tab, activeTab);
      }}
    />
  );
}

function ShellLayoutInner(): ReactElement {
  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          animation: 'none',
          headerShown: false,
          lazy: false,
          sceneStyle: {
            backgroundColor: colors.background,
          },
          tabBarStyle: {
            display: 'none',
          },
        }}
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
