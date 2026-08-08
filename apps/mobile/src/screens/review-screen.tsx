import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LexiconPopup } from '../components/lexicon-popup';
import { ReviewOutcomeBar } from '../components/review/review-outcome-bar';
import { ReviewSettingsSheet } from '../components/review/review-settings-sheet';
import { formatReviewSourcePackLabel } from '../components/review/review-source-pack-label';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { StudyMoreMenu } from '../components/study/study-more-menu';
import { PrimaryButton } from '../components/ui/primary-button';
import { useReviewFlow } from '../hooks/use-review-flow';
import { VocabularyStudyPanel } from '../learning/card-types/vocabulary/vocabulary-study-panel';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function ReviewScreen(): ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    session,
    summary,
    revealed,
    isSubmitting,
    message,
    reviewContext,
    outcomeIntervalLabels,
    lexiconEntry,
    lexiconVisible,
    lexiconSaved,
    lexiconSelectedSurfaceForm,
    audioMessage,
    setRevealed,
    handlePassed,
    handleFailed,
    handleSkipUnloaded,
    setDailyReviewLimit,
    startReview,
    openLexicon,
    handleToggleSave,
    handlePlayLexiconAudio,
    handlePlayPrimaryAudio,
    handlePlayExampleAudio,
    closeLexicon,
  } = useReviewFlow();

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [moreVisible, setMoreVisible] = useState(false);

  const hasCurrentItem = Boolean(session?.currentItem);
  const canLoadCurrent = Boolean(reviewContext?.cardDetail);
  const hasSession = hasCurrentItem && canLoadCurrent;
  const moreMenuAnchorTop = insets.top + spacing.xs + spacing.touchTarget + spacing.xs;
  const moreMenuAnchorRight = spacing.lg;

  const goHome = useCallback((): void => {
    router.replace('/library');
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const onHardwareBackPress = (): boolean => {
        if (lexiconVisible) {
          closeLexicon();
          return true;
        }
        if (settingsVisible) {
          setSettingsVisible(false);
          return true;
        }
        if (moreVisible) {
          setMoreVisible(false);
          return true;
        }
        goHome();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
      return () => {
        subscription.remove();
      };
    }, [closeLexicon, goHome, lexiconVisible, moreVisible, settingsVisible]),
  );

  const renderEmptyState = (): ReactElement => {
    if (summary.dueTotal === 0) {
      return (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>暂无到期复习词</Text>
          <PrimaryButton
            label="去学习"
            onPress={() => {
              router.replace('/library');
            }}
          />
        </View>
      );
    }

    if (hasCurrentItem && !canLoadCurrent) {
      return (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>无法加载此复习词</Text>
          <Text style={styles.emptyHint}>来源学习包可能已卸载或内容损坏</Text>
          <PrimaryButton disabled={isSubmitting} label="跳过" onPress={handleSkipUnloaded} />
        </View>
      );
    }

    if (!hasCurrentItem && summary.remainingQuota === 0) {
      return (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>今日复习配额已用完</Text>
          <PrimaryButton label="刷新" onPress={startReview} />
        </View>
      );
    }

    if (!hasCurrentItem && summary.remainingQuota > 0) {
      return (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>暂无可复习的词</Text>
          <Text style={styles.emptyHint}>到期词条可能来自已卸载的学习包</Text>
          <PrimaryButton label="刷新" onPress={startReview} />
        </View>
      );
    }

    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>今日复习配额已用完</Text>
        <PrimaryButton label="刷新" onPress={startReview} />
      </View>
    );
  };

  return (
    <ScreenScaffold
      footer={
        hasSession && revealed ? (
          <ReviewOutcomeBar
            disabled={isSubmitting}
            onFailed={handleFailed}
            onPassed={handlePassed}
            {...(outcomeIntervalLabels?.failed !== undefined
              ? { failedIntervalLabel: outcomeIntervalLabels.failed }
              : {})}
            {...(outcomeIntervalLabels?.passed !== undefined
              ? { passedIntervalLabel: outcomeIntervalLabels.passed }
              : {})}
          />
        ) : null
      }
      safeAreaEdges={['left', 'right']}
    >
      <View style={styles.root}>
        {message ? <Text style={styles.message}>{message}</Text> : null}

        {hasSession && reviewContext?.cardDetail?.cardType === 'vocabulary' ? (
          <VocabularyStudyPanel
            content={reviewContext.cardDetail.content}
            contextLabel={formatReviewSourcePackLabel(reviewContext.sourcePackDisplayName)}
            lexiconSelectedSurfaceForm={lexiconSelectedSurfaceForm}
            onHomePress={goHome}
            onMorePress={() => {
              setMoreVisible(true);
            }}
            onPlayExampleAudio={handlePlayExampleAudio}
            onPlayPrimaryAudio={handlePlayPrimaryAudio}
            onReveal={() => {
              setRevealed(true);
            }}
            onTokenPress={openLexicon}
            revealed={revealed}
          />
        ) : (
          renderEmptyState()
        )}
      </View>

      <LexiconPopup
        audioMessage={audioMessage}
        entry={lexiconEntry}
        isSaved={lexiconSaved}
        onClose={closeLexicon}
        onPlayAudio={handlePlayLexiconAudio}
        onToggleSave={handleToggleSave}
        visible={lexiconVisible}
      />

      <StudyMoreMenu
        anchorRight={moreMenuAnchorRight}
        anchorTop={moreMenuAnchorTop}
        items={[{ id: 'settings', label: '复习设置' }]}
        onClose={() => {
          setMoreVisible(false);
        }}
        onItemPress={(itemId) => {
          setMoreVisible(false);
          if (itemId === 'settings') {
            setSettingsVisible(true);
          }
        }}
        visible={moreVisible}
      />

      <ReviewSettingsSheet
        dailyReviewLimit={summary.dailyReviewLimit}
        dueTotal={summary.dueTotal}
        joinedPoolCountToday={summary.joinedPoolCountToday}
        onChangeDailyLimit={setDailyReviewLimit}
        onClose={() => {
          setSettingsVisible(false);
        }}
        todayReviewCompleted={summary.todayReviewCompleted}
        visible={settingsVisible}
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  message: {
    color: colors.studyRatingForgot,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyHint: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
