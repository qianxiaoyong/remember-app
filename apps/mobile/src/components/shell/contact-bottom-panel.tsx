import type { ReactElement } from 'react';
import { useEffect, useRef } from 'react';
import { Alert, Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const SLIDE_DISTANCE = 360;
const ANIMATION_MS = 260;

interface ContactBottomPanelProps {
  visible: boolean;
  onClose: () => void;
}

export function ContactBottomPanel(props: ContactBottomPanelProps): ReactElement {
  const slideAnim = useRef(new Animated.Value(SLIDE_DISTANCE)).current;

  useEffect(() => {
    if (props.visible) {
      slideAnim.setValue(SLIDE_DISTANCE);
      Animated.timing(slideAnim, {
        duration: ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(slideAnim, {
      duration: ANIMATION_MS,
      easing: Easing.in(Easing.cubic),
      toValue: SLIDE_DISTANCE,
      useNativeDriver: true,
    }).start();
  }, [props.visible, slideAnim]);

  const handleSaveQr = (): void => {
    Alert.alert('保存二维码', '客服二维码即将开放');
  };

  return (
    <View collapsable={false} style={styles.host}>
      <Pressable
        accessibilityRole="button"
        onPress={props.onClose}
        style={[StyleSheet.absoluteFillObject, styles.backdrop]}
      >
        <View style={styles.backdropFill} />
      </Pressable>

      <Animated.View
        style={[
          styles.panel,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>联系我们</Text>
          <Pressable
            accessibilityLabel="关闭"
            accessibilityRole="button"
            hitSlop={8}
            onPress={props.onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>

        <View accessibilityLabel="客服二维码占位" style={styles.qrPlaceholder}>
          <Text style={styles.qrPlaceholderText}>QR</Text>
        </View>

        <View style={styles.steps}>
          <Text style={styles.stepText}>1. 保存二维码至本地相册</Text>
          <Text style={styles.stepText}>2. 打开微信识别二维码</Text>
        </View>

        <Pressable accessibilityRole="button" onPress={handleSaveQr} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>保存二维码</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    zIndex: 1,
    ...(Platform.OS === 'android' ? { elevation: 24 } : {}),
  },
  backdropFill: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.modalRadius,
    borderTopRightRadius: spacing.modalRadius,
    bottom: 0,
    gap: spacing.lg,
    left: 0,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    position: 'absolute',
    right: 0,
    zIndex: 2,
    ...(Platform.OS === 'android' ? { elevation: 25 } : {}),
  },
  titleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.statTileBackground,
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 28,
  },
  closeButtonText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 20,
    marginTop: -1,
  },
  qrPlaceholder: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surface,
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
  steps: {
    gap: spacing.sm,
  },
  stepText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.textPrimary,
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
