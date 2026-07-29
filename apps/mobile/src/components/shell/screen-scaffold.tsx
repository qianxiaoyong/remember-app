import type { ReactElement, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ScreenScaffoldProps {
  children: ReactNode;
  footer?: ReactNode;
  withCapsulePadding?: boolean;
  safeAreaEdges?: ('top' | 'right' | 'bottom' | 'left')[];
}

export function ScreenScaffold(props: ScreenScaffoldProps): ReactElement {
  const edges = props.safeAreaEdges ?? ['top', 'left', 'right'];

  return (
    <SafeAreaView edges={edges} style={styles.safeArea}>
      <View
        style={[
          styles.content,
          props.withCapsulePadding ? styles.withCapsulePadding : null,
        ]}
      >
        {props.children}
      </View>
      {props.footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  withCapsulePadding: {
    paddingBottom: spacing.capsuleBottom,
  },
});
