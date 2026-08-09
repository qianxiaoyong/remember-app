import type { ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import type { AppIconName } from './app-icon';
import { AppIcon } from './app-icon';
import { colors } from '../../theme/colors';

interface AnimatedSpeakerIconProps {
  playing: boolean;
  color?: string;
  size?: 'sm' | 'md';
}

const PLAYING_ICON_FRAMES: AppIconName[] = [
  'volume-low-outline',
  'volume-medium-outline',
  'volume-high-outline',
];

const FRAME_MS = 180;

export function AnimatedSpeakerIcon(props: AnimatedSpeakerIconProps): ReactElement {
  const [frameIndex, setFrameIndex] = useState(PLAYING_ICON_FRAMES.length - 1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const color = props.color ?? colors.accent;

  useEffect(() => {
    let cancelled = false;

    const stopFrames = (): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) {
        return;
      }
      stopFrames();
      if (!props.playing || reduceMotion) {
        setFrameIndex(PLAYING_ICON_FRAMES.length - 1);
        return;
      }

      let index = 0;
      setFrameIndex(index);
      intervalRef.current = setInterval(() => {
        index = (index + 1) % PLAYING_ICON_FRAMES.length;
        setFrameIndex(index);
      }, FRAME_MS);
    });

    return () => {
      cancelled = true;
      stopFrames();
    };
  }, [props.playing]);

  const iconName: AppIconName = props.playing
    ? (PLAYING_ICON_FRAMES[frameIndex] ?? 'volume-high-outline')
    : 'volume-high-outline';

  return <AppIcon color={color} name={iconName} size={props.size ?? 'sm'} />;
}
