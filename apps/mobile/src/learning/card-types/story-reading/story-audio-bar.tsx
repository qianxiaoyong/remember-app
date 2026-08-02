import type { ReactElement } from 'react';
import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CircleIconButton } from '../../../components/ui/circle-icon-button';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

interface StoryAudioBarProps {
  positionMs: number;
  durationMs: number;
  playing: boolean;
  disabled?: boolean;
  canPreviousParagraph?: boolean;
  canNextParagraph?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (positionMs: number) => void;
  onPreviousParagraph?: () => void;
  onNextParagraph?: () => void;
  onPreviousLesson?: () => void;
  onNextLesson?: () => void;
}

function formatAudioTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
}

function PlayIcon(): ReactElement {
  return (
    <View style={styles.playIcon}>
      <View style={styles.playTriangle} />
    </View>
  );
}

function PauseIcon(): ReactElement {
  return (
    <View style={styles.pauseIcon}>
      <View style={styles.pauseBar} />
      <View style={styles.pauseBar} />
    </View>
  );
}

function ParagraphSkipIcon(props: { direction: 'up' | 'down'; disabled?: boolean }): ReactElement {
  const color = props.disabled ? colors.textMuted : colors.textPrimary;
  return (
    <View style={styles.paragraphSkipIcon}>
      {props.direction === 'up' ? (
        <View style={[styles.skipArrow, styles.skipArrowUp, { borderBottomColor: color }]} />
      ) : (
        <View style={[styles.skipArrow, styles.skipArrowDown, { borderTopColor: color }]} />
      )}
      <View style={[styles.skipLine, { backgroundColor: color }]} />
      <View style={[styles.skipLine, { backgroundColor: color }]} />
      <View style={[styles.skipLine, { backgroundColor: color }]} />
    </View>
  );
}

export function StoryAudioBar(props: StoryAudioBarProps): ReactElement {
  const [trackWidth, setTrackWidth] = useState(0);
  const progress =
    props.durationMs > 0 ? Math.min(1, Math.max(0, props.positionMs / props.durationMs)) : 0;

  const handleTrackLayout = (event: LayoutChangeEvent): void => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const handleTrackPress = (locationX: number): void => {
    if (props.disabled || props.durationMs <= 0 || trackWidth <= 0) {
      return;
    }
    const ratio = Math.min(1, Math.max(0, locationX / trackWidth));
    props.onSeek(Math.round(ratio * props.durationMs));
  };

  return (
    <View style={styles.root}>
      <View style={styles.progressSection}>
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatAudioTime(props.positionMs)}</Text>
          <Text style={styles.time}>{formatAudioTime(props.durationMs)}</Text>
        </View>
        <Pressable
          accessibilityRole="adjustable"
          disabled={props.disabled || props.durationMs <= 0}
          onPress={(event) => {
            handleTrackPress(event.nativeEvent.locationX);
          }}
          style={styles.trackWrap}
        >
          <View onLayout={handleTrackLayout} style={styles.track}>
            <View style={styles.trackFillRow}>
              <View style={[styles.trackFill, { flex: progress }]} />
              <View style={{ flex: 1 - progress }} />
            </View>
            <View style={[styles.trackThumb, { left: `${String(progress * 100)}%` }]} />
          </View>
        </Pressable>
      </View>

      <View style={styles.transportRow}>
        <CircleIconButton
          accessibilityLabel="上一段"
          {...(props.canPreviousParagraph && props.onPreviousParagraph
            ? { onPress: props.onPreviousParagraph }
            : {})}
        >
          <ParagraphSkipIcon direction="up" disabled={!props.canPreviousParagraph} />
        </CircleIconButton>

        <Pressable
          accessibilityLabel={props.playing ? '暂停' : '播放'}
          disabled={props.disabled}
          onPress={props.playing ? props.onPause : props.onPlay}
          style={[styles.playButton, props.disabled ? styles.playButtonDisabled : null]}
        >
          {props.playing ? <PauseIcon /> : <PlayIcon />}
        </Pressable>

        <CircleIconButton
          accessibilityLabel="下一段"
          {...(props.canNextParagraph && props.onNextParagraph
            ? { onPress: props.onNextParagraph }
            : {})}
        >
          <ParagraphSkipIcon direction="down" disabled={!props.canNextParagraph} />
        </CircleIconButton>
      </View>

      <View style={styles.lessonNavRow}>
        <Pressable
          accessibilityLabel="上一篇"
          accessibilityRole="button"
          onPress={props.onPreviousLesson}
          style={styles.lessonNavButton}
        >
          <Text style={styles.lessonNavLabel}>‹ 上一篇</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="下一篇"
          accessibilityRole="button"
          onPress={props.onNextLesson}
          style={styles.lessonNavButton}
        >
          <Text style={styles.lessonNavLabel}>下一篇 ›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  progressSection: {
    gap: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    color: colors.textMuted,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  trackWrap: {
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  track: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 4,
    position: 'relative',
  },
  trackFillRow: {
    borderRadius: 999,
    flexDirection: 'row',
    height: 4,
    overflow: 'hidden',
  },
  trackFill: {
    backgroundColor: colors.accent,
    height: 4,
  },
  trackThumb: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 10,
    marginLeft: -5,
    marginTop: -3,
    position: 'absolute',
    top: 0,
    width: 10,
  },
  transportRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  playButtonDisabled: {
    opacity: 0.45,
  },
  playIcon: {
    marginLeft: 4,
  },
  playTriangle: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 10,
    borderLeftColor: colors.surface,
    borderLeftWidth: 16,
    borderTopColor: 'transparent',
    borderTopWidth: 10,
    height: 0,
    width: 0,
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 6,
  },
  pauseBar: {
    backgroundColor: colors.surface,
    borderRadius: 1,
    height: 18,
    width: 4,
  },
  paragraphSkipIcon: {
    alignItems: 'center',
    gap: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  skipArrow: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 5,
    borderRightColor: 'transparent',
    borderRightWidth: 5,
    height: 0,
    width: 0,
  },
  skipArrowUp: {
    borderBottomWidth: 6,
  },
  skipArrowDown: {
    borderTopWidth: 6,
  },
  skipLine: {
    borderRadius: 1,
    height: 2,
    width: 14,
  },
  lessonNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lessonNavButton: {
    paddingVertical: spacing.xs,
  },
  lessonNavLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});
