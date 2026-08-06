import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { ReviewOutcomeBar } from '../components/review/review-outcome-bar';
import { ReviewSourcePackLabel } from '../components/review/review-source-pack-label';
import { PrimaryButton } from '../components/ui/primary-button';
import { useReviewFlow } from '../hooks/use-review-flow';
import { VocabularyStudyPanel } from '../learning/card-types/vocabulary/vocabulary-study-panel';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function ReviewScreen(): ReactElement {
  const router = useRouter();
  const {
    session,
    summary,
    revealed,
    isSubmitting,
    message,
    reviewContext,
    setRevealed,
    handlePassed,
    handleFailed,
    setDailyReviewLimit,
    startReview,
  } = useReviewFlow();

  const hasDueItems = summary.dueTotal > 0;
  const hasSession = Boolean(session?.currentItem && reviewContext?.cardDetail);

  return (
    <ScreenScaffold
      footer={
        hasSession && revealed ? (
          <ReviewOutcomeBar
            disabled={isSubmitting}
            onFailed={handleFailed}
            onPassed={handlePassed}
          />
        ) : null
      }
    >
      <View style={styles.root}>
        <Text style={styles.title}>复习</Text>
        <Text style={styles.meta}>
          今日已练 {summary.todayReviewCompleted} / 限额 {summary.dailyReviewLimit}
        </Text>
        <Text style={styles.meta}>到期共 {summary.dueTotal} 词</Text>
        <Text style={styles.meta}>今日新入池 {summary.joinedPoolCountToday} 词</Text>

        <View style={styles.limitRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setDailyReviewLimit(summary.dailyReviewLimit - 1);
            }}
            style={styles.stepperButton}
          >
            <Text style={styles.stepperLabel}>-</Text>
          </Pressable>
          <Text style={styles.limitValue}>每日 {summary.dailyReviewLimit} 词</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setDailyReviewLimit(summary.dailyReviewLimit + 1);
            }}
            style={styles.stepperButton}
          >
            <Text style={styles.stepperLabel}>+</Text>
          </Pressable>
        </View>

        {message ? <Text style={styles.error}>{message}</Text> : null}

        {!hasDueItems ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>暂无到期复习词</Text>
            <Text style={styles.emptyHint}>在学习里把不会的加入复习</Text>
            <PrimaryButton
              label="去学习"
              onPress={() => {
                router.replace('/library');
              }}
            />
          </View>
        ) : !hasSession ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>今日复习配额已用完</Text>
            <PrimaryButton label="刷新" onPress={startReview} />
          </View>
        ) : reviewContext?.cardDetail?.cardType === 'vocabulary' ? (
          <View style={styles.cardWrap}>
            <ReviewSourcePackLabel displayName={reviewContext.sourcePackDisplayName} />
            <VocabularyStudyPanel
              content={reviewContext.cardDetail.content}
              lexiconSelectedSurfaceForm={null}
              onHomePress={() => {
                router.replace('/library');
              }}
              onMorePress={() => undefined}
              onPlayExampleAudio={() => undefined}
              onPlayPrimaryAudio={() => undefined}
              onReveal={() => {
                setRevealed(true);
              }}
              onTokenPress={() => undefined}
              revealed={revealed}
            />
          </View>
        ) : (
          <Text style={styles.emptyHint}>无法加载复习卡片</Text>
        )}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  limitRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  stepperButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  stepperLabel: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  limitValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  empty: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyHint: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  cardWrap: {
    flex: 1,
  },
  error: {
    color: colors.studyRatingForgot,
    marginBottom: spacing.sm,
  },
});
