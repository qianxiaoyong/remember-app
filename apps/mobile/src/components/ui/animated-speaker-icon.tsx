import type { ReactElement } from 'react';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { AppIcon } from './app-icon';
import { colors } from '../../theme/colors';

interface AnimatedSpeakerIconProps {
  playing: boolean;
  color?: string;
  size?: 'sm' | 'md';
}

export function AnimatedSpeakerIcon(props: AnimatedSpeakerIconProps): ReactElement {
  const waveAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const color = props.color ?? colors.accent;

  useEffect(() => {
    let cancelled = false;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) {
        return;
      }
      loopRef.current?.stop();
      loopRef.current = null;
      if (!props.playing || reduceMotion) {
        waveAnim.setValue(0);
        return;
      }
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            duration: 180,
            easing: Easing.inOut(Easing.quad),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            duration: 180,
            easing: Easing.inOut(Easing.quad),
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      );
      loopRef.current = loop;
      loop.start();
    });

    return () => {
      cancelled = true;
      loopRef.current?.stop();
    };
  }, [props.playing, waveAnim]);

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });
  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <View style={styles.root}>
      {props.playing ? (
        <Animated.View
          style={[
            styles.wave,
            {
              opacity: waveOpacity,
              transform: [{ scale: waveScale }],
            },
          ]}
        />
      ) : null}
      <AppIcon color={color} name="volume-high-outline" size={props.size ?? 'sm'} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 24,
    opacity: 0.3,
    position: 'absolute',
    width: 24,
  },
});
