import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthHero, AuthScreenLayout } from '../components/auth/auth-screen-layout';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { PrimaryButton } from '../components/ui/primary-button';
import { markLoginGuideDismissed } from '../data/session/session-store';
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
      <AuthScreenLayout scroll>
        <AuthHero
          subtitle="跳过登录不影响本地学习；换机或重装时，可恢复到最后一次成功同步的进度。"
          title="登录后可同步进度"
        />
        <View style={styles.actions}>
          <PrimaryButton
            label="登录"
            onPress={() => {
              void handleLogin();
            }}
          />
          <PrimaryButton
            label="稍后再说"
            onPress={() => {
              void handleLater();
            }}
            variant="secondary"
          />
        </View>
      </AuthScreenLayout>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
