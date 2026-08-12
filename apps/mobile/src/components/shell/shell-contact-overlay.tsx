import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { BackHandler, Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveShellTabBarInset } from '../../shell/shell-tab-bar-inset';
import { useContactPanelOpen, useShellActions } from '../../shell/shell-provider';
import { ContactBottomPanel } from './contact-bottom-panel';

export function ShellContactOverlayHost(): ReactElement | null {
  const visible = useContactPanelOpen();
  const { closeContactPanel } = useShellActions();
  const insets = useSafeAreaInsets();
  const tabBarInset = resolveShellTabBarInset(insets.bottom);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeContactPanel();
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [closeContactPanel, visible]);

  if (!visible) {
    return null;
  }

  const hostStyle: ViewStyle[] = [styles.host, { bottom: tabBarInset }];
  if (Platform.OS === 'android') {
    hostStyle.push(styles.hostAndroid);
  }

  return (
    <View collapsable={false} pointerEvents="box-none" style={hostStyle}>
      <ContactBottomPanel onClose={closeContactPanel} visible />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  hostAndroid: {
    elevation: 20,
  },
});
