import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { markLoginGuideDismissed } from '../data/session/session-store';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function LoginGuideScreen(): ReactElement {
  const router = useRouter();

  const handleLater = async (): Promise<void> => {
    await markLoginGuideDismissed();
    router.replace('/library');
  };

  const handleLogin = async (): Promise<void> => {
    await markLoginGuideDismissed();
    router.replace('/login');
  };

  return (
    <ScreenScaffold>
      <View style={styles.container}>
        <Text style={styles.title}>登录后可同步进度</Text>
        <Text style={styles.body}>
          你可以现在登录监护人账号，也可以稍后再说。跳过登录不影响本地学习。
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void handleLogin();
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>登录</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void handleLater();
          }}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>稍后</Text>
        </Pressable>
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
});
