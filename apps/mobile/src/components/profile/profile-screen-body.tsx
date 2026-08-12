import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { DrawerCommonFeatureItem, DrawerMenuItem } from '../../shell/drawer-menu-config';
import { drawerCommonFeatures, drawerMenuItems } from '../../shell/drawer-menu-config';
import { useShellActions } from '../../shell/shell-provider';
import { DrawerAccountHeader, DrawerAccountHeaderLoading } from '../shell/drawer-account-header';
import { DrawerCommonFeaturesBlock } from '../shell/drawer-common-features-block';
import { DrawerMenuListBlock } from '../shell/drawer-menu-list-block';
import { LearningCalendarWidget } from '../shell/learning-calendar-widget';
import { useAuthSession } from '../../hooks/use-auth-session';
import { resolveUserDisplayName } from '../../lib/resolve-user-display-name';
import { useSessionKickAlert } from '../../hooks/use-session-kick-alert';
import { spacing } from '../../theme/spacing';

export function ProfileScreenBody(): ReactElement {
  const router = useRouter();
  const { openContactPanel } = useShellActions();
  const { user, isLoading, isNotMainDevice, refresh } = useAuthSession();
  useSessionKickAlert(isNotMainDevice);

  useEffect(() => {
    void refresh({ showLoading: false });
  }, [refresh]);

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
      router.push(item.route);
    }
  };

  const handleCommonFeaturePress = (item: DrawerCommonFeatureItem): void => {
    if (item.reserved) {
      Alert.alert('敬请期待', item.reservedMessage ?? '功能即将开放');
      return;
    }

    if (item.id === 'redeem' && !user) {
      router.push('/login?returnTo=%2Fredeem');
      return;
    }

    if (item.route) {
      router.push(item.route);
    }
  };

  const handleAccountPress = (): void => {
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
        <LearningCalendarWidget />
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
