import type { ReactElement, ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { headerButtonShadow } from '../../theme/shadows';
import { colors } from '../../theme/colors';

interface CircleIconButtonProps {
  accessibilityLabel: string;
  onPress?: () => void;
  children: ReactNode;
}

export function CircleIconButton(props: CircleIconButtonProps): ReactElement {
  return (
    <Pressable
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={props.onPress}
      style={styles.button}
    >
      <View style={styles.inner}>{props.children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 18,
    height: 36,
    width: 36,
  },
  inner: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: 'rgba(32, 34, 40, 0.05)',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'center',
    ...headerButtonShadow,
  },
});
