import type { ReactElement } from 'react';
import { useMemo, useRef } from 'react';
import {
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type GestureResponderHandlers,
  type PanResponderGestureState,
  type TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderIconButton } from '../ui/header-icon-button';
import { AppIcon } from '../ui/app-icon';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export interface InspectModeChromeProps {
  localDate: string;
  subCategoryLabel: string;
  index: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
}

const NAV_ICON_COLOR = colors.textSecondary;
const SWIPE_DISTANCE_THRESHOLD = 48;
const SWIPE_AXIS_LOCK_DX = 16;

const CHEVRON_HALO_STYLE: TextStyle = {
  position: 'absolute',
  textShadowColor: 'rgba(255, 255, 255, 0.98)',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 7,
};

const CHEVRON_DROP_STYLE: TextStyle = {
  position: 'absolute',
  transform: [{ translateX: 1 }, { translateY: 1 }],
  opacity: 0.52,
};

export function formatInspectContextLabel(input: {
  localDate: string;
  subCategoryLabel: string;
  index: number;
  total: number;
}): string {
  const [, monthRaw, dayRaw] = input.localDate.split('-');
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  return `${month}月${day}日「${input.subCategoryLabel} · ${input.index + 1}/${input.total}」`;
}

export function InspectModeHeader(props: {
  localDate: string;
  subCategoryLabel: string;
  index: number;
  total: number;
}): ReactElement {
  return (
    <Text numberOfLines={1} style={styles.headerText}>
      {formatInspectContextLabel(props)}
    </Text>
  );
}

function shouldCaptureHorizontalSwipe(gesture: PanResponderGestureState): boolean {
  return (
    Math.abs(gesture.dx) > SWIPE_AXIS_LOCK_DX &&
    Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2
  );
}

/** 挂在 VocabularyStudyPanel body 上：左滑下一条，右滑上一条（不与竖向滚动抢手势） */
export function useInspectPanResponder(
  config: InspectModeChromeProps | null | undefined,
): GestureResponderHandlers {
  const configRef = useRef(config);
  configRef.current = config;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_event: GestureResponderEvent, gesture) => {
          const current = configRef.current;
          if (!current || current.total <= 1) {
            return false;
          }
          return shouldCaptureHorizontalSwipe(gesture);
        },
        onPanResponderRelease: (_event: GestureResponderEvent, gesture) => {
          const current = configRef.current;
          if (!current || !shouldCaptureHorizontalSwipe(gesture)) {
            return;
          }
          if (gesture.dx <= -SWIPE_DISTANCE_THRESHOLD && current.canNext) {
            current.onNext();
            return;
          }
          if (gesture.dx >= SWIPE_DISTANCE_THRESHOLD && current.canPrevious) {
            current.onPrevious();
          }
        },
      }),
    [],
  );

  if (!config || config.total <= 1) {
    return {};
  }

  return panResponder.panHandlers;
}

/**
 * 渲染在 VocabularyStudyPanel 根层；anchorCenterY 由回忆页 body 布局锁定，展开后不变。
 */
export function InspectModeNavFloating(
  props: InspectModeChromeProps & { anchorCenterY: number },
): ReactElement | null {
  const insets = useSafeAreaInsets();

  if (props.total <= 1) {
    return null;
  }

  const edgeInsetLeft = Math.max(insets.left, spacing.xs);
  const edgeInsetRight = Math.max(insets.right, spacing.xs);
  const navTop = props.anchorCenterY - spacing.touchTarget / 2;

  return (
    <View
      collapsable={false}
      pointerEvents="box-none"
      style={[styles.navBar, { top: navTop }]}
    >
      <InspectEdgeNavButton
        accessibilityLabel="上一条"
        disabled={!props.canPrevious}
        icon="chevron-back"
        onPress={props.onPrevious}
        style={{ marginLeft: edgeInsetLeft }}
      />
      <InspectEdgeNavButton
        accessibilityLabel="下一条"
        disabled={!props.canNext}
        icon="chevron-forward"
        onPress={props.onNext}
        style={{ marginRight: edgeInsetRight }}
      />
    </View>
  );
}

function InspectEdgeNavButton(props: {
  accessibilityLabel: string;
  icon: 'chevron-back' | 'chevron-forward';
  onPress: () => void;
  disabled?: boolean;
  style?: { marginLeft?: number; marginRight?: number };
}): ReactElement {
  return (
    <HeaderIconButton
      accessibilityLabel={props.accessibilityLabel}
      {...(props.disabled ? {} : { onPress: props.onPress })}
    >
      <View
        style={[
          styles.iconWrap,
          props.style,
          props.disabled ? styles.iconWrapDisabled : null,
        ]}
      >
        <ChevronWithShapeShadow color={NAV_ICON_COLOR} name={props.icon} />
      </View>
    </HeaderIconButton>
  );
}

function ChevronWithShapeShadow(props: {
  name: 'chevron-back' | 'chevron-forward';
  color: string;
}): ReactElement {
  return (
    <View style={styles.chevronStack}>
      <AppIcon color="#FFFFFF" name={props.name} size="sm" style={CHEVRON_HALO_STYLE} />
      <AppIcon
        color="rgba(255, 255, 255, 0.92)"
        name={props.name}
        size="sm"
        style={CHEVRON_HALO_STYLE}
      />
      <AppIcon color={colors.textPrimary} name={props.name} size="sm" style={CHEVRON_DROP_STYLE} />
      <AppIcon color={props.color} name={props.name} size="sm" />
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  navBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: spacing.touchTarget,
    justifyContent: 'space-between',
    left: 0,
    pointerEvents: 'box-none',
    position: 'absolute',
    right: 0,
    zIndex: 999,
    ...(Platform.OS === 'android' ? { elevation: 999 } : null),
  },
  iconWrap: {
    alignItems: 'center',
    height: spacing.touchTarget,
    justifyContent: 'center',
    width: spacing.touchTarget,
  },
  iconWrapDisabled: {
    opacity: 0.28,
  },
  chevronStack: {
    alignItems: 'center',
    height: spacing.touchTarget,
    justifyContent: 'center',
    width: spacing.touchTarget,
  },
});
