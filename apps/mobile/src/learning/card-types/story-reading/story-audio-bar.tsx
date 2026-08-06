import type { ReactElement } from 'react';
import { useState } from 'react';
import type { DimensionValue, LayoutChangeEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../../components/ui/app-icon';
import { CircleIconButton } from '../../../components/ui/circle-icon-button';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import type { StoryLoopMode } from './story-loop-mode';
import { storyLoopModeAccessibilityLabel, storyLoopModeLabel } from './story-loop-mode';
import type { StoryPlaybackRate } from './story-playback-rate';
import { storyPlaybackRateAccessibilityLabel, storyPlaybackRateLabel } from './story-playback-rate';

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
  onPreviousLesson: () => void;
  onNextLesson: () => void;
}

function formatAudioTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
}

function LoopModeIcon(props: { mode: StoryLoopMode }): ReactElement {
  const active = props.mode !== 'none';
  return (
    <View style={styles.loopIcon}>
      <AppIcon
        color={active ? colors.accent : colors.textMuted}
        name={active ? 'repeat' : 'repeat-outline'}
        size="sm"
      />
      <Text style={[styles.loopLabel, active ? styles.loopLabelActive : null]}>
        {storyLoopModeLabel(props.mode)}
      </Text>
    </View>
  );
}

function PlaybackRateIcon(props: { rate: StoryPlaybackRate }): ReactElement {
  return <Text style={styles.playbackRateLabel}>{storyPlaybackRateLabel(props.rate)}</Text>;
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

  const paragraphDisabledColor = colors.textMuted;
  const transportColor = colors.textPrimary;

  return (
    <View style={styles.root}>
      <View style={styles.progressRow}>
        <Text style={styles.time}>{formatAudioTime(props.positionMs)}</Text>
        <Pressable
          accessibilityRole="adjustable"
          disabled={(props.disabled ?? false) || props.durationMs <= 0}
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
            <View
              style={[
                styles.trackThumb,
                { left: `${String(Math.round(progress * 100))}%` as DimensionValue },
              ]}
            />
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
          <AppIcon color={transportColor} name="play-skip-back" size="sm" />
        </CircleIconButton>

        <CircleIconButton
          accessibilityLabel="上一段"
          {...(props.canPreviousParagraph && props.onPreviousParagraph
            ? { onPress: props.onPreviousParagraph }
            : {})}
        >
          <AppIcon
            color={props.canPreviousParagraph ? transportColor : paragraphDisabledColor}
            name="arrow-up"
            size="sm"
          />
        </CircleIconButton>

        <Pressable
          accessibilityLabel={props.playing ? '暂停' : '播放'}
          disabled={props.disabled}
          onPress={props.playing ? props.onPause : props.onPlay}
          style={[styles.playButton, props.disabled ? styles.playButtonDisabled : null]}
        >
          <AppIcon color={colors.surface} name={props.playing ? 'pause' : 'play'} size="md" />
        </Pressable>

        <CircleIconButton
          accessibilityLabel="下一段"
          {...(props.canNextParagraph && props.onNextParagraph
            ? { onPress: props.onNextParagraph }
            : {})}
        >
          <AppIcon
            color={props.canNextParagraph ? transportColor : paragraphDisabledColor}
            name="arrow-down"
            size="sm"
          />
        </CircleIconButton>

        <CircleIconButton accessibilityLabel="下一篇" onPress={props.onNextLesson}>
          <AppIcon color={transportColor} name="play-skip-forward" size="sm" />
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
  loopIcon: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
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
