import type { ReactElement, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SurfaceCard } from '../ui/surface-card';
import { spacing } from '../../theme/spacing';

interface StudySectionCardProps {
  children: ReactNode;
}

export function StudySectionCard(props: StudySectionCardProps): ReactElement {
  return (
    <View style={styles.wrap}>
      <SurfaceCard>{props.children}</SurfaceCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
  },
});
