import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LexiconPopup } from '../components/lexicon-popup';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { JoinReviewBar } from '../components/study/join-review-bar';
import { PackBrowseCompletePanel } from '../components/study/pack-browse-complete-panel';
import { ResetPackProgressDialog } from '../components/study/reset-pack-progress-dialog';
import { StudyMoreMenu } from '../components/study/study-more-menu';
import { UpdateReviewConfirmDialog } from '../components/study/update-review-confirm-dialog';
import { PrimaryButton } from '../components/ui/primary-button';
import { useStudyFlow } from '../hooks/use-study-flow';
import { resolveCardTypeDefinition } from '../learning/card-types/registry';
import { UnsupportedCardPanel } from '../learning/card-types/unsupported-card-panel';
import { markLibraryNeedsRefresh } from '../shell/library-refresh-signal';
import { countInReviewPoolForPack } from '../use-cases/count-in-review-pool-for-pack';
import { getPackBrowseCompleteSummary } from '../use-cases/get-pack-browse-complete-summary';
import { listInstalledPacksUseCase } from '../use-cases/list-installed-packs';
import { resetPackLearningProgress } from '../use-cases/reset-pack-learning-progress';
import { saveStoryReadingBookmark } from '../use-cases/save-story-reading-bookmark';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface StudyScreenProps {
  packId: string;
  knowledgeId?: string | null;
  autoStart?: boolean;
}

export function StudyScreen(props: StudyScreenProps): ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    isReaderMode,
    isBrowseMode,
    browseReady,
    startBrowse,
    revealed,
    isSubmitting,
    inReviewPool,
    updateReviewVisible,
    lexiconEntry,
    lexiconVisible,
    lexiconSaved,
    lexiconSelectedSurfaceForm,
    audioMessage,
    cardDetail,
    message,
    readerInitialPositionMs,
    browseCompleteVisible,
    browseCompleteSummary,
    setRevealed,
    handleJoinReview,
    handleSkip,
    handleConfirmUpdateReview,
    setUpdateReviewVisible,
    handleReaderBookmark,
    openLexicon,
    handleToggleSave,
    handlePlayAudio,
    handlePlayPrimaryAudio,
    handlePlayExampleAudio,
    restartFromBeginning,
    dismissBrowseComplete,
    refreshInReviewPool,
    closeLexicon,
  } = useStudyFlow(
    props.packId,
    props.knowledgeId === undefined ? undefined : { knowledgeId: props.knowledgeId },
  );
  const [moreVisible, setMoreVisible] = useState(false);
  const [switchVisible, setSwitchVisible] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);
  const [resetBrowse, setResetBrowse] = useState(true);
  const [resetReview, setResetReview] = useState(true);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const installedPacks = useMemo(() => listInstalledPacksUseCase(), []);
  const cardTypeDefinition = cardDetail ? resolveCardTypeDefinition(cardDetail.cardType) : null;
  const packSummary = useMemo(
    () => getPackBrowseCompleteSummary(props.packId),
    [props.packId, resetVisible, browseCompleteVisible],
  );
  const inReviewPoolCount = useMemo(
    () => countInReviewPoolForPack(props.packId),
    [props.packId, resetVisible, browseCompleteVisible],
  );

  useEffect(() => {
    if (props.autoStart !== false && isBrowseMode && !browseReady) {
      startBrowse();
    }
  }, [props.autoStart, browseReady, isBrowseMode, props.packId, startBrowse]);

  useEffect(() => {
    if (resetVisible) {
      setResetBrowse(true);
      setResetReview(inReviewPoolCount > 0);
    }
  }, [inReviewPoolCount, resetVisible]);

  const handleNavigateLesson = useCallback(
    (knowledgeId: string) => {
      saveStoryReadingBookmark({
        packId: props.packId,
        knowledgeId,
        positionMs: 0,
      });
      router.replace(`/study?packId=${props.packId}&knowledgeId=${knowledgeId}`);
    },
    [props.packId, router],
  );

  const goHome = useCallback((): void => {
    dismissBrowseComplete();
    router.replace('/library');
  }, [dismissBrowseComplete, router]);

  const handleGoReview = useCallback((): void => {
    dismissBrowseComplete();
    router.replace('/review');
  }, [dismissBrowseComplete, router]);

  const handleRestartFromBeginning = useCallback((): void => {
    restartFromBeginning();
  }, [restartFromBeginning]);

  const handleConfirmReset = useCallback(() => {
    setResetMessage(null);
    try {
      resetPackLearningProgress({
        packId: props.packId,
        resetBrowse,
        resetReview,
      });
      markLibraryNeedsRefresh();
      if (resetBrowse) {
        restartFromBeginning();
      } else {
        refreshInReviewPool();
      }
      setResetVisible(false);
      setResetMessage('已重置');
    } catch (error) {
      setResetMessage(error instanceof Error ? error.message : '重置失败');
    }
  }, [props.packId, refreshInReviewPool, resetBrowse, resetReview, restartFromBeginning]);

  const moreItems = [
    { id: 'search', label: '搜索当前知识库' },
    { id: 'switch', label: '切换已安装知识库' },
    { id: 'settings', label: '基础学习设置' },
    { id: 'reset', label: isReaderMode ? '重置阅读进度' : '重置学习进度' },
  ];

  const showJoinReviewBar =
    isBrowseMode &&
    !browseCompleteVisible &&
    cardTypeDefinition?.reviewMode === 'sm2' &&
    revealed &&
    cardDetail &&
    browseReady;

  const moreMenuAnchorTop = insets.top + spacing.sm + spacing.touchTarget + spacing.xs;
  const moreMenuAnchorRight = spacing.lg;

  return (
    <ScreenScaffold
      footer={
        showJoinReviewBar ? (
          <JoinReviewBar
            disabled={isSubmitting}
            inReviewPool={inReviewPool}
            onJoinReview={handleJoinReview}
            onOpenUpdateReview={() => {
              setUpdateReviewVisible(true);
            }}
            onSkip={handleSkip}
          />
        ) : null
      }
      safeAreaEdges={['left', 'right']}
    >
      <View style={styles.root}>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {resetMessage ? <Text style={styles.resetMessage}>{resetMessage}</Text> : null}

        {browseCompleteVisible && browseCompleteSummary ? (
          <PackBrowseCompletePanel
            {...browseCompleteSummary}
            onGoHome={goHome}
            onGoReview={handleGoReview}
            onRestartFromBeginning={handleRestartFromBeginning}
          />
        ) : isBrowseMode && !browseReady ? (
          <View style={styles.emptyState}>
            <PrimaryButton label="打开学习包" onPress={startBrowse} />
          </View>
        ) : cardDetail ? (
          cardTypeDefinition ? (
            <cardTypeDefinition.Renderer
              content={cardDetail.content}
              knowledgeId={cardDetail.knowledgeId}
              lexiconSelectedSurfaceForm={lexiconSelectedSurfaceForm}
              onHomePress={goHome}
              onMorePress={() => {
                setMoreVisible(true);
              }}
              onNavigateLesson={handleNavigateLesson}
              onPlayExampleAudio={handlePlayExampleAudio}
              onPlayPrimaryAudio={handlePlayPrimaryAudio}
              onTokenPress={openLexicon}
              packId={props.packId}
              revealed={revealed}
              setRevealed={setRevealed}
              sortOrder={cardDetail.sortOrder}
              {...(isReaderMode ? { onReaderBookmark: handleReaderBookmark } : {})}
              {...(isReaderMode ? { initialAudioPositionMs: readerInitialPositionMs } : {})}
            />
          ) : (
            <UnsupportedCardPanel onGoHome={goHome} />
          )
        ) : isReaderMode ? (
          <UnsupportedCardPanel message="无法加载此阅读内容" onGoHome={goHome} />
        ) : browseReady ? (
          <UnsupportedCardPanel message="无法加载此卡片内容" onGoHome={goHome} />
        ) : null}
      </View>

      <UpdateReviewConfirmDialog
        onCancel={() => {
          setUpdateReviewVisible(false);
        }}
        onConfirm={handleConfirmUpdateReview}
        visible={updateReviewVisible}
      />

      <ResetPackProgressDialog
        inReviewPoolCount={inReviewPoolCount}
        isReaderMode={isReaderMode}
        onCancel={() => {
          setResetVisible(false);
        }}
        onConfirm={handleConfirmReset}
        onToggleBrowse={() => {
          setResetBrowse((value) => !value);
        }}
        onToggleReview={() => {
          if (inReviewPoolCount === 0) {
            return;
          }
          setResetReview((value) => !value);
        }}
        packDisplayName={packSummary.packDisplayName}
        resetBrowse={resetBrowse}
        resetReview={resetReview}
        visible={resetVisible}
      />

      <LexiconPopup
        audioMessage={audioMessage}
        entry={lexiconEntry}
        isSaved={lexiconSaved}
        onClose={closeLexicon}
        onPlayAudio={handlePlayAudio}
        onToggleSave={handleToggleSave}
        visible={lexiconVisible}
      />

      <StudyMoreMenu
        anchorRight={moreMenuAnchorRight}
        anchorTop={moreMenuAnchorTop}
        items={moreItems}
        onClose={() => {
          setMoreVisible(false);
        }}
        onItemPress={(itemId) => {
          setMoreVisible(false);
          if (itemId === 'search') {
            router.push(`/search?packId=${props.packId}`);
            return;
          }
          if (itemId === 'switch') {
            setSwitchVisible(true);
            return;
          }
          if (itemId === 'settings') {
            router.push('/settings');
            return;
          }
          if (itemId === 'reset') {
            setResetVisible(true);
          }
        }}
        visible={moreVisible}
      />

      <StudyMoreMenu
        anchorRight={moreMenuAnchorRight}
        anchorTop={moreMenuAnchorTop}
        items={installedPacks.map((pack) => ({
          id: pack.packId,
          label: pack.displayName,
        }))}
        onClose={() => {
          setSwitchVisible(false);
        }}
        onItemPress={(itemId) => {
          setSwitchVisible(false);
          router.replace(`/study?packId=${itemId}`);
        }}
        visible={switchVisible}
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  emptyState: {
    padding: spacing.lg,
  },
  message: {
    color: colors.studyRatingForgot,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  resetMessage: {
    color: colors.studyHeaderBackground,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
