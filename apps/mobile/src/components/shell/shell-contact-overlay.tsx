import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
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

  return (
    <View
      collapsable={false}
      pointerEvents="box-none"
      style={[
        styles.host,
        { bottom: tabBarInset },
        Platform.OS === 'android' ? styles.hostAndroid : null,
      ]}
    >
      <ContactBottomPanel onClose={closeContactPanel} visible />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  hostAndroid: {
    elevation: 20,
  },
});
