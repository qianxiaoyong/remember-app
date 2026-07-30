import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import type { SessionUser } from '@remember/contracts';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { ApiRequestError, readApiBaseUrl } from '../data/api/api-client';
import { countSyncOutboxItems } from '../data/repositories/sync-outbox-repository';
import { readCachedSessionUser, readLastSyncedAt } from '../data/session/session-store';
import { getCurrentSessionUser } from '../use-cases/auth/get-current-session-user';
import { logout } from '../use-cases/auth/logout';
import { uploadPendingSyncOutbox } from '../use-cases/sync/upload-pending-sync-outbox';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const LAST_SYNCED_POLL_MS = 3_000;

export function AccountScreen(): ReactElement {
  const router = useRouter();
  const params = useLocalSearchParams<{ notMainDevice?: string }>();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [notMainDevice, setNotMainDevice] = useState(params.notMainDevice === '1');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [syncStatusHint, setSyncStatusHint] = useState<string | null>(null);

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

  const refreshSyncStatus = useCallback(async () => {
    const result = await uploadPendingSyncOutbox();
    setLastSyncedAt(await readLastSyncedAt());
    setPendingSyncCount(result.remainingCount);
    setSyncStatusHint(formatSyncStatusHint(result));
  }, []);

  const refreshSyncDisplay = useCallback(async () => {
    setLastSyncedAt(await readLastSyncedAt());
    setPendingSyncCount(countSyncOutboxItems());
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useFocusEffect(
    useCallback(() => {
      void refreshSyncStatus();

      const appStateSubscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          void refreshSyncStatus();
        }
      });

      const pollTimer = setInterval(() => {
        void refreshSyncDisplay();
      }, LAST_SYNCED_POLL_MS);

      return () => {
        appStateSubscription.remove();
        clearInterval(pollTimer);
      };
    }, [refreshSyncDisplay, refreshSyncStatus]),
  );

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
            <Text style={styles.label}>最后同步</Text>
            <Text style={styles.value}>
              {lastSyncedAt ? formatSyncedAt(lastSyncedAt) : '尚未同步到云端'}
            </Text>
            <Text style={styles.label}>服务器</Text>
            <Text style={styles.value}>{readApiBaseUrl()}</Text>
            <Text style={styles.label}>待上传</Text>
            <Text style={styles.value}>{`${String(pendingSyncCount)} 条`}</Text>
            {syncStatusHint ? <Text style={styles.hint}>{syncStatusHint}</Text> : null}
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

function formatSyncedAt(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    return '尚未同步到云端';
  }
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSyncStatusHint(
  result: Awaited<ReturnType<typeof uploadPendingSyncOutbox>>,
): string | null {
  if (result.skippedReason === 'NOT_MAIN_DEVICE') {
    return '当前不是主设备，无法上传到云端。';
  }
  if (result.skippedReason === 'OFFLINE') {
    const serverUrl = safeReadApiBaseUrl();
    return `${result.errorMessage ?? '无法连接服务器'}。请确认电脑 API 已启动，且手机与电脑同一 Wi-Fi${serverUrl ? `（${serverUrl}）` : ''}。`;
  }
  if (result.skippedReason === 'ERROR') {
    return result.errorMessage ?? '同步失败，请稍后重试。';
  }
  if (result.remainingCount > 0) {
    return '仍有进度待上传，请保持联网并稍等。';
  }
  return null;
}

function safeReadApiBaseUrl(): string | null {
  try {
    return readApiBaseUrl();
  } catch {
    return null;
  }
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
