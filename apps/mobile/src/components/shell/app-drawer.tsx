import type { ReactElement } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileScreenBody } from '../profile/profile-screen-body';
import { drawerContentPaddingTop } from '../../theme/drawer-styles';
import { colors } from '../../theme/colors';

const DRAWER_WIDTH_RATIO = 0.86;
const SLIDE_DURATION_MS = 260;

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
  onDismiss: () => void;
}

export function AppDrawer(props: AppDrawerProps): ReactElement | null {
  const insets = useSafeAreaInsets();
  const contentPaddingTop = drawerContentPaddingTop(insets.top);
  const panelWidth = Dimensions.get('window').width * DRAWER_WIDTH_RATIO;
  const [renderOverlay, setRenderOverlay] = useState(props.visible);
  const slideAnim = useRef(new Animated.Value(-panelWidth)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const renderOverlayRef = useRef(renderOverlay);
  renderOverlayRef.current = renderOverlay;

  useEffect(() => {
    if (!props.visible) {
      return;
    }

    const onHardwareBackPress = (): boolean => {
      props.onClose();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => {
      subscription.remove();
    };
  }, [props.onClose, props.visible]);

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

    if (!renderOverlayRef.current) {
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
    ]).start();
  }, [backdropAnim, panelWidth, props.visible, slideAnim]);

  if (!props.visible && !renderOverlay) {
    return null;
  }

  return (
    <View pointerEvents={props.visible ? 'box-none' : 'none'} style={styles.host}>
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
          <ProfileScreenBody drawerVisible={props.visible} fromDrawer />
        </View>
      </Animated.View>

      <Animated.View
        pointerEvents="box-none"
        style={[styles.backdropWrap, { opacity: backdropAnim }]}
      >
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
  backdropWrap: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  backdrop: {
    backgroundColor: colors.overlay,
    flex: 1,
  },
});
