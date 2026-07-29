import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';

interface ProgressBarProps {
  progress: number;
  color: string;
}

export function ProgressBar(props: ProgressBarProps): ReactElement {
  const clamped = Math.max(0, Math.min(1, props.progress));
  const filledFlex = clamped === 0 ? 0 : clamped;
  const emptyFlex = clamped === 1 ? 0 : 1 - clamped;

  return (
    <View style={styles.track}>
      {filledFlex > 0 ? (
        <View style={[styles.fill, { backgroundColor: props.color, flex: filledFlex }]} />
      ) : null}
      {emptyFlex > 0 ? <View style={{ flex: emptyFlex }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.border,
    borderRadius: 999,
    flexDirection: 'row',
    height: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 999,
    height: 4,
  },
});
