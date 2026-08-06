import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../ui/primary-button';
import { SurfaceCard } from '../ui/surface-card';
import type { PackBrowseCompleteSummary } from '../../use-cases/get-pack-browse-complete-summary';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PackBrowseCompletePanelProps extends PackBrowseCompleteSummary {
  onGoReview: () => void;
  onRestartFromBeginning: () => void;
  onGoHome: () => void;
}

export function PackBrowseCompletePanel(props: PackBrowseCompletePanelProps): ReactElement {
  const insets = useSafeAreaInsets();
  const showReviewAction = props.dueReviewCount > 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xxl }]}>
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconMark}>✓</Text>
        </View>
        <Text style={styles.title}>本包已浏览至末尾</Text>
        <Text style={styles.subtitle}>
          {props.packDisplayName} 共 {String(props.totalCards)} 词
          {props.inReviewPoolCount > 0
            ? `，其中 ${String(props.inReviewPoolCount)} 词已加入复习`
            : ''}
        </Text>
      </View>

      <SurfaceCard>
        <Text style={styles.hint}>
          浏览进度已保存。不会的词条可在复习 Tab 按记忆曲线巩固；也可以从头再学一遍。
        </Text>
      </SurfaceCard>

      <View style={styles.actions}>
        {showReviewAction ? (
          <PrimaryButton label="去复习" onPress={props.onGoReview} />
        ) : null}
        <PrimaryButton label="从头再学" onPress={props.onRestartFromBeginning} variant="secondary" />
        <PrimaryButton label="返回首页" onPress={props.onGoHome} variant="secondary" />
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
