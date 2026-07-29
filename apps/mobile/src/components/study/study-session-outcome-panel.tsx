import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../ui/primary-button';
import { SurfaceCard } from '../ui/surface-card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export type StudySessionOutcomeVariant = 'completed' | 'empty';

interface StudySessionOutcomePanelProps {
  variant: StudySessionOutcomeVariant;
  completedCount: number;
  packDisplayName: string;
  onGoHome: () => void;
  onBrowseMarket: () => void;
}

export function StudySessionOutcomePanel(props: StudySessionOutcomePanelProps): ReactElement {
  const insets = useSafeAreaInsets();
  const isCompleted = props.variant === 'completed';

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xxl }]}>
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconMark}>{isCompleted ? '✓' : '☕'}</Text>
        </View>
        <Text style={styles.title}>{isCompleted ? '本次学习完成' : '今日任务已完成'}</Text>
        <Text style={styles.subtitle}>
          {isCompleted
            ? `已完成 ${String(props.completedCount)} 张卡片`
            : '当前没有待复习内容'}
        </Text>
      </View>

      <SurfaceCard>
        <Text style={styles.packLabel}>知识库</Text>
        <Text style={styles.packName}>{props.packDisplayName}</Text>
        <Text style={styles.hint}>
          {isCompleted
            ? '这些内容会按记忆曲线安排复习。你可以返回首页查看进度，或继续浏览资料。'
            : '所有卡片都已复习安排妥当。明天再来看看，或去资料页发现更多内容。'}
        </Text>
      </SurfaceCard>

      <View style={styles.actions}>
        <PrimaryButton label="返回首页" onPress={props.onGoHome} />
        <PrimaryButton label="浏览资料" onPress={props.onBrowseMarket} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.studyHeaderBackground,
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 72,
  },
  iconMark: {
    color: colors.surface,
    fontSize: 32,
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  packLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  packName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    gap: spacing.sm,
    marginTop: 'auto',
  },
});
