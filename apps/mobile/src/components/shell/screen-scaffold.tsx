import type { ReactElement, ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { markAppContentReady } from '../../shell/app-content-ready';
import { resolveShellTabBarInset } from '../../shell/shell-tab-bar-inset';
import { colors } from '../../theme/colors';

interface ScreenScaffoldProps {
  children: ReactNode;
  footer?: ReactNode;
  overlay?: ReactNode;
  withTabBarPadding?: boolean;
  safeAreaEdges?: ('top' | 'right' | 'bottom' | 'left')[];
}

export function ScreenScaffold(props: ScreenScaffoldProps): ReactElement {
  const insets = useSafeAreaInsets();
  const edges = props.safeAreaEdges ?? ['top', 'left', 'right'];
  const withTabBarPadding = props.withTabBarPadding ?? false;
  const tabBarInset = withTabBarPadding ? resolveShellTabBarInset(insets.bottom) : 0;

  return (
    <SafeAreaView edges={edges} style={styles.safeArea}>
      <View
        onLayout={markAppContentReady}
        style={[styles.content, tabBarInset > 0 ? { paddingBottom: tabBarInset } : null]}
      >
        {props.children}
      </View>
      {props.footer}
      {props.overlay ? (
        <View pointerEvents="box-none" style={styles.overlay}>
          {props.overlay}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  overlay: {
    bottom: 0,
    left: 0,
    pointerEvents: 'box-none',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
    ...(Platform.OS === 'android' ? { elevation: 10 } : {}),
  },
});
