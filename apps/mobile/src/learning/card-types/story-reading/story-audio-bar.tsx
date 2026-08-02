import type { ReactElement } from 'react';
import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CircleIconButton } from '../../../components/ui/circle-icon-button';
import { SpeakerIcon } from '../../../components/ui/shell-icons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

interface StoryAudioBarProps {
  positionMs: number;
  durationMs: number;
  playing: boolean;
  disabled?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (positionMs: number) => void;
  onPreviousLesson?: () => void;
  onNextLesson?: () => void;
}

function formatAudioTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
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
      <View style={styles.navRow}>
        <Pressable
          accessibilityLabel="上一篇"
          accessibilityRole="button"
          onPress={props.onPreviousLesson}
          style={styles.navButton}
        >
          <Text style={styles.navLabel}>‹ 上一篇</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="下一篇"
          accessibilityRole="button"
          onPress={props.onNextLesson}
          style={styles.navButton}
        >
          <Text style={styles.navLabel}>下一篇 ›</Text>
        </Pressable>
      </View>

      <View style={styles.transportRow}>
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
          </View>
        </Pressable>

        <Text style={styles.time}>{formatAudioTime(props.durationMs)}</Text>

        <CircleIconButton
          accessibilityLabel={props.playing ? '暂停' : '播放'}
          {...(props.disabled ? {} : { onPress: props.playing ? props.onPause : props.onPlay })}
        >
          <SpeakerIcon size="sm" />
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
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    paddingVertical: spacing.xs,
  },
  navLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  transportRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  time: {
    color: colors.textMuted,
    fontSize: 12,
    minWidth: 36,
    textAlign: 'center',
  },
  trackWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  track: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 4,
    overflow: 'hidden',
  },
  trackFillRow: {
    flexDirection: 'row',
    height: 4,
  },
  trackFill: {
    backgroundColor: colors.accent,
    height: 4,
  },
});
