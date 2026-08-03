import type { ReactElement } from 'react';
import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CircleIconButton } from '../../../components/ui/circle-icon-button';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import type { StoryLoopMode } from './story-loop-mode';
import { storyLoopModeAccessibilityLabel, storyLoopModeLabel } from './story-loop-mode';
import type { StoryPlaybackRate } from './story-playback-rate';
import {
  storyPlaybackRateAccessibilityLabel,
  storyPlaybackRateLabel,
} from './story-playback-rate';

interface StoryAudioBarProps {
  positionMs: number;
  durationMs: number;
  playing: boolean;
  disabled?: boolean;
  loopMode: StoryLoopMode;
  playbackRate: StoryPlaybackRate;
  canPreviousParagraph?: boolean;
  canNextParagraph?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (positionMs: number) => void;
  onCycleLoopMode: () => void;
  onCyclePlaybackRate: () => void;
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
    </View>
  );
}

function LessonSkipIcon(props: { direction: 'prev' | 'next' }): ReactElement {
  return (
    <Text style={styles.lessonSkipGlyph}>{props.direction === 'prev' ? '«' : '»'}</Text>
  );
}

function LoopModeIcon(props: { mode: StoryLoopMode }): ReactElement {
  const active = props.mode !== 'none';
  return (
    <View style={[styles.loopIcon, active ? styles.loopIconActive : null]}>
      <Text style={[styles.loopGlyph, active ? styles.loopGlyphActive : null]}>↻</Text>
      <Text style={[styles.loopLabel, active ? styles.loopLabelActive : null]}>
        {storyLoopModeLabel(props.mode)}
      </Text>
    </View>
  );
}

function PlaybackRateIcon(props: { rate: StoryPlaybackRate }): ReactElement {
  return (
    <Text style={styles.playbackRateLabel}>{storyPlaybackRateLabel(props.rate)}</Text>
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
      <View style={styles.progressRow}>
        <Text style={styles.time}>{formatAudioTime(props.positionMs)}</Text>
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
        <Text style={styles.time}>{formatAudioTime(props.durationMs)}</Text>
      </View>

      <View style={styles.transportRow}>
        <CircleIconButton
          accessibilityLabel={storyLoopModeAccessibilityLabel(props.loopMode)}
          onPress={props.onCycleLoopMode}
        >
          <LoopModeIcon mode={props.loopMode} />
        </CircleIconButton>

        <CircleIconButton
          accessibilityLabel={storyPlaybackRateAccessibilityLabel(props.playbackRate)}
          onPress={props.onCyclePlaybackRate}
        >
          <PlaybackRateIcon rate={props.playbackRate} />
        </CircleIconButton>

        <CircleIconButton accessibilityLabel="上一篇" onPress={props.onPreviousLesson}>
          <LessonSkipIcon direction="prev" />
        </CircleIconButton>

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

        <CircleIconButton accessibilityLabel="下一篇" onPress={props.onNextLesson}>
          <LessonSkipIcon direction="next" />
        </CircleIconButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  time: {
    color: colors.textMuted,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    minWidth: 34,
    textAlign: 'center',
  },
  trackWrap: {
    flex: 1,
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
    justifyContent: 'space-between',
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  playButtonDisabled: {
    opacity: 0.45,
  },
  playIcon: {
    marginLeft: 3,
  },
  playTriangle: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 8,
    borderLeftColor: colors.surface,
    borderLeftWidth: 13,
    borderTopColor: 'transparent',
    borderTopWidth: 8,
    height: 0,
    width: 0,
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 5,
  },
  pauseBar: {
    backgroundColor: colors.surface,
    borderRadius: 1,
    height: 16,
    width: 4,
  },
  paragraphSkipIcon: {
    alignItems: 'center',
    gap: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  skipArrow: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 4,
    borderRightColor: 'transparent',
    borderRightWidth: 4,
    height: 0,
    width: 0,
  },
  skipArrowUp: {
    borderBottomWidth: 5,
  },
  skipArrowDown: {
    borderTopWidth: 5,
  },
  skipLine: {
    borderRadius: 1,
    height: 2,
    width: 12,
  },
  lessonSkipGlyph: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  loopIcon: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  loopIconActive: {
    opacity: 1,
  },
  loopGlyph: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 14,
  },
  loopGlyphActive: {
    color: colors.accent,
  },
  loopLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 10,
    marginTop: -1,
  },
  loopLabelActive: {
    color: colors.accent,
  },
  playbackRateLabel: {
    color: colors.textPrimary,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 14,
    minWidth: 28,
    textAlign: 'center',
  },
});
