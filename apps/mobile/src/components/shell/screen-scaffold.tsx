import type { ReactElement, ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { markAppContentReady } from '../../shell/app-content-ready';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ScreenScaffoldProps {
  children: ReactNode;
  footer?: ReactNode;
  overlay?: ReactNode;
  withCapsulePadding?: boolean;
  safeAreaEdges?: ('top' | 'right' | 'bottom' | 'left')[];
}

export function ScreenScaffold(props: ScreenScaffoldProps): ReactElement {
  const edges = props.safeAreaEdges ?? ['top', 'left', 'right'];

  return (
    <SafeAreaView edges={edges} style={styles.safeArea}>
      <View
        onLayout={markAppContentReady}
        style={[styles.content, props.withCapsulePadding ? styles.withCapsulePadding : null]}
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
    ...StyleSheet.absoluteFill,
    pointerEvents: 'box-none',
    zIndex: 100,
    ...(Platform.OS === 'android' ? { elevation: 100 } : null),
  },
  withCapsulePadding: {
    paddingBottom: spacing.capsuleBottom,
  },
});
