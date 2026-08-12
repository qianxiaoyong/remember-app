import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';

interface ProgressBarProps {
  progress: number;
  color: string;
  height?: number;
}

export function ProgressBar(props: ProgressBarProps): ReactElement {
  const clamped = Math.max(0, Math.min(1, props.progress));
  const filledFlex = clamped === 0 ? 0 : clamped;
  const emptyFlex = clamped === 1 ? 0 : 1 - clamped;
  const height = props.height ?? 4;

  return (
    <View style={[styles.track, { height }]}>
      {filledFlex > 0 ? (
        <View style={[styles.fill, { backgroundColor: props.color, flex: filledFlex, height }]} />
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
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 999,
  },
});
