import type { ReactElement, ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { spacing } from '../../theme/spacing';

interface HeaderIconButtonProps {
  accessibilityLabel: string;
  onPress?: () => void;
  children: ReactNode;
}

export function HeaderIconButton(props: HeaderIconButtonProps): ReactElement {
  return (
    <Pressable
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={props.onPress}
      style={styles.button}
    >
      {props.children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    height: spacing.touchTarget,
    justifyContent: 'center',
    width: spacing.touchTarget,
  },
});
