import type { ReactElement, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface StudySectionCardProps {
  children: ReactNode;
}

export function StudySectionCard(props: StudySectionCardProps): ReactElement {
  return <View style={styles.root}>{props.children}</View>;
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
