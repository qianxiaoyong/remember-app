import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { ShellContactOverlayHost } from '../../src/components/shell/shell-contact-overlay';
import { ShellTabBar } from '../../src/components/shell/shell-tab-bar';
import {
  navigateShellTab,
  resolveShellTabFromPathname,
  type ShellTab,
} from '../../src/shell/shell-tab-transition';
import { ShellProvider, useTabBarVisible } from '../../src/shell/shell-provider';
import { colors } from '../../src/theme/colors';

const SHELL_TAB_HREF: Record<ShellTab, `/library` | `/review` | `/record` | `/profile`> = {
  library: '/library',
  review: '/review',
  record: '/record',
  profile: '/profile',
};

export default function ShellLayout(): ReactElement {
  return (
    <ShellProvider>
      <ShellLayoutInner />
    </ShellProvider>
  );
}

function ShellTabBarHost(): ReactElement | null {
  const pathname = usePathname();
  const router = useRouter();
  const tabBarVisible = useTabBarVisible();
  const activeTab = resolveShellTabFromPathname(pathname);

  if (!tabBarVisible) {
    return null;
  }

  return (
    <ShellTabBar
      activeTab={activeTab}
      onTabPress={(tab) => {
        const target = SHELL_TAB_HREF[tab];
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
      <View style={styles.sceneHost}>
        <Tabs
          screenOptions={{
            animation: 'none',
            headerShown: false,
            lazy: true,
            sceneStyle: {
              backgroundColor: colors.background,
            },
            tabBarStyle: {
              display: 'none',
            },
          }}
        />
        <ShellContactOverlayHost />
      </View>
      <ShellTabBarHost />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  sceneHost: {
    flex: 1,
    position: 'relative',
  },
});
