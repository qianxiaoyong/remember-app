import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LexiconPopup } from '../components/lexicon-popup';
import { ReviewOutcomeBar } from '../components/review/review-outcome-bar';
import { ReviewSettingsSheet } from '../components/review/review-settings-sheet';
import { ReviewSourcePackLabel } from '../components/review/review-source-pack-label';
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
    lexiconEntry,
    lexiconVisible,
    lexiconSaved,
    lexiconSelectedSurfaceForm,
    audioMessage,
    setRevealed,
    handlePassed,
    handleFailed,
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

  const hasDueItems = summary.dueTotal > 0;
  const hasSession = Boolean(session?.currentItem && reviewContext?.cardDetail);
  const moreMenuAnchorTop = insets.top + spacing.sm + spacing.touchTarget + spacing.xs;
  const moreMenuAnchorRight = spacing.lg;

  const goHome = useCallback((): void => {
    router.replace('/library');
  }, [router]);

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
      safeAreaEdges={['left', 'right']}
    >
      <View style={styles.root}>
        {message ? <Text style={styles.message}>{message}</Text> : null}

        {!hasDueItems ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>暂无到期复习词</Text>
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
          <View style={styles.sessionRoot}>
            <View pointerEvents="none" style={[styles.sourceLabel, { top: insets.top + spacing.xs }]}>
              <ReviewSourcePackLabel displayName={reviewContext.sourcePackDisplayName} />
            </View>
            <VocabularyStudyPanel
              content={reviewContext.cardDetail.content}
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
          </View>
        ) : (
          <Text style={styles.emptyHint}>无法加载复习卡片</Text>
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
  sessionRoot: {
    flex: 1,
  },
  sourceLabel: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 2,
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
    padding: spacing.lg,
  },
});
