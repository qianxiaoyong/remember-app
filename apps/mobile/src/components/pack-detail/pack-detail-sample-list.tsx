import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PackSamplePreview } from '../../catalog/pack-sample-preview';
import { SurfaceCard } from '../ui/surface-card';
import { MusicNoteIcon } from '../ui/shell-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PackDetailSampleListProps {
  samples: PackSamplePreview[];
  onPlaySample: (sample: PackSamplePreview) => void;
  onOpenPreview: (sample: PackSamplePreview) => void;
}

export function PackDetailSampleList(props: PackDetailSampleListProps): ReactElement {
  return (
    <SurfaceCard>
      <View style={styles.header}>
        <Text style={styles.title}>内容示例</Text>
        <Text style={styles.hint}>仅展示少量预览</Text>
      </View>
      <View style={styles.list}>
        {props.samples.map((sample) => (
          <SampleRow
            key={sample.headword}
            onOpenPreview={() => {
              props.onOpenPreview(sample);
            }}
            onPlay={() => {
              props.onPlaySample(sample);
            }}
            sample={sample}
          />
        ))}
      </View>
    </SurfaceCard>
  );
}

function SampleRow(props: {
  sample: PackSamplePreview;
  onPlay: () => void;
  onOpenPreview: () => void;
}): ReactElement {
  const initial = props.sample.initial ?? props.sample.headword.charAt(0).toUpperCase();

  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" onPress={props.onOpenPreview} style={styles.rowMain}>
        <View style={styles.initialBadge}>
          <Text style={styles.initialText}>{initial}</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.headword}>{props.sample.headword}</Text>
          <Text numberOfLines={2} style={styles.detail}>
            {props.sample.zh} · {props.sample.exampleEn}
          </Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityLabel="试听示例"
        hitSlop={8}
        onPress={props.onPlay}
        style={styles.playButton}
      >
        <MusicNoteIcon size="sm" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowMain: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  initialBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(109, 112, 232, 0.12)',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  initialText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  headword: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  detail: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  playButton: {
    alignItems: 'center',
    height: spacing.touchTarget,
    justifyContent: 'center',
    width: spacing.touchTarget,
  },
});
