import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { SessionUser } from '@remember/contracts';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { ApiRequestError } from '../data/api/api-client';
import { readCachedSessionUser } from '../data/session/session-store';
import { getCurrentSessionUser } from '../use-cases/auth/get-current-session-user';
import { logout } from '../use-cases/auth/logout';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function AccountScreen(): ReactElement {
  const router = useRouter();
  const params = useLocalSearchParams<{ notMainDevice?: string }>();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [notMainDevice, setNotMainDevice] = useState(params.notMainDevice === '1');

  const loadUser = useCallback(async () => {
    try {
      const sessionUser = await getCurrentSessionUser();
      if (!sessionUser) {
        if (!notMainDevice) {
          router.replace('/login');
        }
        return;
      }
      setUser(sessionUser);
      setNotMainDevice(false);
    } catch (error) {
      if (error instanceof ApiRequestError && error.code === 'NOT_MAIN_DEVICE') {
        const cachedUser = await readCachedSessionUser();
        setNotMainDevice(true);
        setUser(cachedUser);
        return;
      }
      router.replace('/login');
    }
  }, [notMainDevice, router]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace('/library');
  }, [router]);

  return (
    <ScreenScaffold>
      <AppHeader
        onBackPress={() => {
          router.back();
        }}
        variant="back"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>账号信息</Text>

        {notMainDevice ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>账号已在其他设备登录，进度仅保存在本机</Text>
          </View>
        ) : null}

        {user ? (
          <View style={styles.card}>
            <Text style={styles.label}>昵称</Text>
            <Text style={styles.value}>{user.displayName}</Text>
            <Text style={styles.label}>手机号</Text>
            <Text style={styles.value}>{user.maskedPhone}</Text>
            <Text style={styles.hint}>最后同步时间将在进度上传功能上线后展示</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            Alert.alert('确认登出', '登出后本地学习进度仍保留在本机。', [
              { text: '取消', style: 'cancel' },
              {
                text: '登出',
                style: 'destructive',
                onPress: () => {
                  void handleLogout();
                },
              },
            ]);
          }}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutButtonText}>登出</Text>
        </Pressable>
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  banner: {
    backgroundColor: '#FFF4E5',
    borderRadius: 12,
    padding: spacing.md,
  },
  bannerText: {
    color: '#9A5B00',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.md,
  },
  logoutButton: {
    alignItems: 'center',
    borderColor: colors.borderStrong,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  logoutButtonText: {
    color: colors.studyRatingForgot,
    fontSize: 15,
    fontWeight: '600',
  },
});
