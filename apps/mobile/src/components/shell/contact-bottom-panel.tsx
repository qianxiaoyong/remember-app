import type { ReactElement } from 'react';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const DRAWER_WIDTH_RATIO = 0.86;
const SLIDE_DURATION_MS = 260;

interface ContactBottomPanelProps {
  visible: boolean;
  onClose: () => void;
}

export function ContactBottomPanel(props: ContactBottomPanelProps): ReactElement | null {
  const insets = useSafeAreaInsets();
  const panelWidth = Dimensions.get('window').width * DRAWER_WIDTH_RATIO;
  const slideAnim = useRef(new Animated.Value(320)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (props.visible) {
      slideAnim.setValue(320);
      backdropAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          duration: SLIDE_DURATION_MS,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          duration: SLIDE_DURATION_MS,
          easing: Easing.out(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        duration: SLIDE_DURATION_MS,
        easing: Easing.in(Easing.cubic),
        toValue: 320,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        duration: SLIDE_DURATION_MS,
        easing: Easing.in(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropAnim, props.visible, slideAnim]);

  if (!props.visible) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.backdropWrap, { opacity: backdropAnim }]}
      >
        <Pressable accessibilityRole="button" onPress={props.onClose} style={styles.backdrop} />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          {
            paddingBottom: insets.bottom + spacing.lg,
            transform: [{ translateY: slideAnim }],
            width: panelWidth,
          },
        ]}
      >
        <Text style={styles.description}>扫码联系客服（占位）</Text>
        <View accessibilityLabel="客服二维码占位" style={styles.qrPlaceholder}>
          <Text style={styles.qrPlaceholderText}>QR</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 110,
  },
  backdropWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    backgroundColor: colors.overlay,
    flex: 1,
  },
  panel: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  description: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  qrPlaceholder: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.statTileBackground,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    height: 200,
    justifyContent: 'center',
    width: 200,
  },
  qrPlaceholderText: {
    color: colors.textMuted,
    fontSize: 28,
    fontWeight: '600',
  },
});
