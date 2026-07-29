import type { ReactElement } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function SettingsScreen(): ReactElement {
  const router = useRouter();

  return (
    <ScreenScaffold>
      <AppHeader onBackPress={() => router.back()} variant="back" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>基础设置</Text>
        <Text style={styles.body}>阶段 4 smoke 页面。学习偏好与通知将在后续版本提供。</Text>
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  body: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
