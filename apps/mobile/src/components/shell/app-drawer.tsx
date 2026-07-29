import type { ReactElement } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { DrawerCommonFeatureItem, DrawerMenuItem } from '../../shell/drawer-menu-config';
import {
  drawerCommonFeatures,
  drawerMenuItems,
} from '../../shell/drawer-menu-config';
import { DrawerAccountHeader } from './drawer-account-header';
import { DrawerCommonFeaturesBlock } from './drawer-common-features-block';
import { DrawerMenuListBlock } from './drawer-menu-list-block';
import { drawerContentPaddingTop } from '../../theme/drawer-styles';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const DRAWER_WIDTH_RATIO = 0.86;
const SLIDE_DURATION_MS = 260;

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function AppDrawer(props: AppDrawerProps): ReactElement | null {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const contentPaddingTop = drawerContentPaddingTop(insets.top);
  const panelWidth = Dimensions.get('window').width * DRAWER_WIDTH_RATIO;
  const [renderOverlay, setRenderOverlay] = useState(props.visible);
  const slideAnim = useRef(new Animated.Value(-panelWidth)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    if (props.visible) {
      setRenderOverlay(true);
      slideAnim.setValue(-panelWidth);
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

    if (!renderOverlay) {
      return;
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        duration: SLIDE_DURATION_MS,
        easing: Easing.in(Easing.cubic),
        toValue: -panelWidth,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        duration: SLIDE_DURATION_MS,
        easing: Easing.in(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setRenderOverlay(false);
      }
    });
  }, [backdropAnim, panelWidth, props.visible, slideAnim]);

  const handleMenuItemPress = (item: DrawerMenuItem): void => {
    props.onClose();

    if (item.reserved) {
      Alert.alert('敬请期待', item.reservedMessage ?? '功能即将开放');
      return;
    }

    if (item.route) {
      router.push(item.route);
    }
  };

  const handleCommonFeaturePress = (item: DrawerCommonFeatureItem): void => {
    props.onClose();
    Alert.alert('敬请期待', item.reservedMessage);
  };

  if (!renderOverlay) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <Animated.View
        style={[
          styles.panel,
          {
            maxWidth: panelWidth,
            transform: [{ translateX: slideAnim }],
            width: panelWidth,
          },
        ]}
      >
        <View
          style={[
            styles.panelBody,
            {
              paddingBottom: insets.bottom,
              paddingTop: contentPaddingTop,
            },
          ]}
        >
          <DrawerAccountHeader />

          <ScrollView
            contentContainerStyle={styles.menuContent}
            showsVerticalScrollIndicator={false}
            style={styles.menuScroll}
          >
            <DrawerCommonFeaturesBlock
              items={drawerCommonFeatures}
              onItemPress={handleCommonFeaturePress}
            />
            <DrawerMenuListBlock items={drawerMenuItems} onItemPress={handleMenuItemPress} />
          </ScrollView>
        </View>
      </Animated.View>

      <Animated.View pointerEvents="box-none" style={[styles.backdropWrap, { opacity: backdropAnim }]}>
        <Pressable accessibilityRole="button" onPress={props.onClose} style={styles.backdrop} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    zIndex: 100,
  },
  panel: {
    backgroundColor: colors.background,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  panelBody: {
    flex: 1,
  },
  menuScroll: {
    flex: 1,
  },
  backdropWrap: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  backdrop: {
    backgroundColor: colors.overlay,
    flex: 1,
  },
  menuContent: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
