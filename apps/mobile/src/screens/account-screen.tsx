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
import { resolveUserDisplayName } from '../lib/resolve-user-display-name';
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
        centerContent={<Text style={styles.headerTitle}>账号信息</Text>}
        onBackPress={() => {
          router.back();
        }}
        variant="back"
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notMainDevice ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>账号已在其他设备登录，进度仅保存在本机</Text>
          </View>
        ) : null}

        {user ? (
          <>
            <View style={styles.profileCard}>
              <Text style={styles.displayName}>{resolveUserDisplayName(user.displayName)}</Text>
              <Text style={styles.maskedPhone}>{user.maskedPhone}</Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>云端同步</Text>
              <InfoRow
                label="最后同步"
                value={lastSyncedAt ? formatSyncedAt(lastSyncedAt) : '尚未同步'}
              />
              <InfoRow label="待上传" value={`${String(pendingSyncCount)} 条`} />
              {syncStatusHint ? <Text style={styles.hint}>{syncStatusHint}</Text> : null}
              <Text style={styles.restoreHint}>
                换机或重新登录时，只能恢复到最后一次成功同步的进度。
              </Text>
            </View>

            {__DEV__ ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>开发信息</Text>
                <InfoRow label="服务器" value={readApiBaseUrl()} />
              </View>
            ) : null}
          </>
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

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow(props: InfoRowProps): ReactElement {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{props.label}</Text>
      <Text style={styles.infoValue}>{props.value}</Text>
    </View>
  );
}

function formatSyncedAt(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    return '尚未同步';
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
    const base = `${result.errorMessage ?? '无法连接服务器'}。请确认电脑 API 已启动，且手机与电脑同一 Wi-Fi`;
    const serverUrl = __DEV__ ? safeReadApiBaseUrl() : null;
    return serverUrl ? `${base}（${serverUrl}）。` : `${base}。`;
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
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  banner: {
    backgroundColor: '#FFF4E5',
    borderRadius: spacing.cardRadius,
    padding: spacing.md,
  },
  bannerText: {
    color: '#9A5B00',
    fontSize: 14,
    lineHeight: 20,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: spacing.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    paddingVertical: spacing.xl,
  },
  displayName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  maskedPhone: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: spacing.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: colors.textPrimary,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: spacing.md,
    textAlign: 'right',
  },
  restoreHint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: spacing.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  logoutButtonText: {
    color: colors.studyRatingForgot,
    fontSize: 15,
    fontWeight: '600',
  },
});
