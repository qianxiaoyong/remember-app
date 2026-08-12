import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { DrawerCommonFeatureItem, DrawerMenuItem } from '../../shell/drawer-menu-config';
import { drawerCommonFeatures, drawerMenuItems } from '../../shell/drawer-menu-config';
import { markDrawerReturnPending } from '../../shell/drawer-return-intent';
import { useShellActions } from '../../shell/shell-provider';
import { DrawerAccountHeader, DrawerAccountHeaderLoading } from '../shell/drawer-account-header';
import { DrawerCommonFeaturesBlock } from '../shell/drawer-common-features-block';
import { DrawerMenuListBlock } from '../shell/drawer-menu-list-block';
import { LearningCalendarWidget } from '../shell/learning-calendar-widget';
import { useAuthSession } from '../../hooks/use-auth-session';
import { resolveUserDisplayName } from '../../lib/resolve-user-display-name';
import { useSessionKickAlert } from '../../hooks/use-session-kick-alert';
import { spacing } from '../../theme/spacing';

interface ProfileScreenBodyProps {
  /** 从抽屉打开时为 true，子页返回时恢复抽屉。 */
  fromDrawer?: boolean;
  drawerVisible?: boolean;
}

export function ProfileScreenBody(props: ProfileScreenBodyProps): ReactElement {
  const router = useRouter();
  const { openContactPanel } = useShellActions();
  const { user, isLoading, isNotMainDevice, refresh } = useAuthSession();
  useSessionKickAlert(isNotMainDevice);

  useEffect(() => {
    void refresh({ showLoading: false });
  }, [refresh]);

  const navigateFromProfile = (route: string): void => {
    if (props.fromDrawer) {
      markDrawerReturnPending();
    }
    router.push(route);
  };

  const handleMenuItemPress = (item: DrawerMenuItem): void => {
    if (item.id === 'contact') {
      openContactPanel();
      return;
    }

    if (item.reserved) {
      Alert.alert('敬请期待', item.reservedMessage ?? '功能即将开放');
      return;
    }

    if (item.route) {
      navigateFromProfile(item.route);
    }
  };

  const handleCommonFeaturePress = (item: DrawerCommonFeatureItem): void => {
    if (item.reserved) {
      Alert.alert('敬请期待', item.reservedMessage ?? '功能即将开放');
      return;
    }

    if (item.id === 'redeem' && !user) {
      if (props.fromDrawer) {
        markDrawerReturnPending();
      }
      router.push('/login?returnTo=%2Fredeem');
      return;
    }

    if (item.route) {
      navigateFromProfile(item.route);
    }
  };

  const handleAccountPress = (): void => {
    if (props.fromDrawer) {
      markDrawerReturnPending();
    }
    if (user) {
      router.push('/account');
      return;
    }
    router.push('/login');
  };

  return (
    <View style={styles.body}>
      {isLoading ? (
        <DrawerAccountHeaderLoading />
      ) : (
        <DrawerAccountHeader
          displayName={resolveUserDisplayName(user?.displayName)}
          hint={user ? user.maskedPhone : isNotMainDevice ? '账号已在其他设备登录' : '点击登录'}
          onPress={handleAccountPress}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.menuContent}
        showsVerticalScrollIndicator={false}
        style={styles.menuScroll}
      >
        {props.fromDrawer ? (
          <LearningCalendarWidget drawerVisible={props.drawerVisible ?? false} layout="drawer" />
        ) : (
          <LearningCalendarWidget layout="page" />
        )}
        <DrawerCommonFeaturesBlock
          items={drawerCommonFeatures}
          onItemPress={handleCommonFeaturePress}
        />
        <DrawerMenuListBlock items={drawerMenuItems} onItemPress={handleMenuItemPress} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
