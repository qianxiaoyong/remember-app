import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LexiconPopup } from '../components/lexicon-popup';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { JoinReviewBar } from '../components/study/join-review-bar';
import { PackBrowseCompletePanel } from '../components/study/pack-browse-complete-panel';
import { ResetBrowseProgressDialog } from '../components/study/reset-browse-progress-dialog';
import { StudyMoreMenu } from '../components/study/study-more-menu';
import { UpdateReviewConfirmDialog } from '../components/study/update-review-confirm-dialog';
import { PrimaryButton } from '../components/ui/primary-button';
import { useStudyFlow } from '../hooks/use-study-flow';
import { resolveCardTypeDefinition } from '../learning/card-types/registry';
import { UnsupportedCardPanel } from '../learning/card-types/unsupported-card-panel';
import { markLibraryNeedsRefresh } from '../shell/library-refresh-signal';
import { getPackBrowseCompleteSummary } from '../use-cases/get-pack-browse-complete-summary';
import { listInstalledPacksUseCase } from '../use-cases/list-installed-packs';
import { resetPackBrowseProgress } from '../use-cases/reset-pack-browse-progress';
import { saveStoryReadingBookmark } from '../use-cases/save-story-reading-bookmark';
import { touchInstalledPackLastOpenedUseCase } from '../use-cases/touch-installed-pack-last-opened';
import {
  useInspectQueue,
  type InspectQueueAdvanceResult,
  type InspectQueueConfig,
} from '../hooks/use-inspect-queue';
import { formatInspectContextLabel } from '../components/calendar/inspect-mode-chrome';
import { exitCalendarInspect } from '../shell/calendar-inspect-navigation';
import { useInspectHardwareBackHandler } from '../hooks/use-inspect-hardware-back-handler';
import { studyScreenStyles as styles } from './study-screen.styles';
import { spacing } from '../theme/spacing';

interface StudyScreenProps {
  packId: string;
  knowledgeId?: string | null;
  autoStart?: boolean;
  inspect?: InspectQueueConfig | null;
}

export function StudyScreen(props: StudyScreenProps): ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inspectQueue = useInspectQueue(props.inspect ?? null);
  const activePackId = inspectQueue.currentItem?.packId ?? props.packId;
  const activeKnowledgeId = inspectQueue.currentItem?.knowledgeId ?? props.knowledgeId;
  const inspectMode = props.inspect !== null && props.inspect !== undefined;

  const handleInspectActionComplete = useCallback((): InspectQueueAdvanceResult => {
    const result = inspectQueue.advanceAfterAction();
    if (result === 'completed') {
      exitCalendarInspect(router);
    }
    return result;
  }, [inspectQueue.advanceAfterAction, router]);

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
    primaryAudioPlaying,
    playingExampleAudioPath,
    restartFromBeginning,
    dismissBrowseComplete,
    closeLexicon,
  } = useStudyFlow(activePackId, {
    ...(activeKnowledgeId !== undefined ? { knowledgeId: activeKnowledgeId } : {}),
    inspectMode,
    ...(props.inspect?.localDate ? { inspectLocalDate: props.inspect.localDate } : {}),
    ...(inspectMode ? { onInspectActionComplete: handleInspectActionComplete } : {}),
  });
  const [moreVisible, setMoreVisible] = useState(false);
  const [switchVisible, setSwitchVisible] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const installedPacks = useMemo(() => listInstalledPacksUseCase(), []);
  const cardTypeDefinition = cardDetail ? resolveCardTypeDefinition(cardDetail.cardType) : null;
  const packSummary = useMemo(
    () => getPackBrowseCompleteSummary(props.packId),
    [props.packId, resetVisible, browseCompleteVisible],
  );
  useEffect(() => {
    if (props.autoStart !== false && isBrowseMode && !browseReady && !inspectMode) {
      startBrowse();
    }
  }, [inspectMode, props.autoStart, browseReady, isBrowseMode, props.packId, startBrowse]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        touchInstalledPackLastOpenedUseCase(props.packId);
        markLibraryNeedsRefresh();
      };
    }, [props.packId]),
  );

  const handleNavigateLesson = useCallback(
    (knowledgeId: string) => {
      if (inspectMode && props.inspect) {
        const targetIndex = inspectQueue.queue.findIndex(
          (item) => item.knowledgeId === knowledgeId,
        );
        if (targetIndex < 0) {
          return;
        }
        const target = inspectQueue.queue[targetIndex];
        if (!target) {
          return;
        }
        router.replace(
          `/study?packId=${target.packId}&knowledgeId=${knowledgeId}&inspect=1&localDate=${props.inspect.localDate}&category=${props.inspect.category}&subCategory=${props.inspect.subCategory}&index=${String(targetIndex)}`,
        );
        return;
      }
      saveStoryReadingBookmark({
        packId: props.packId,
        knowledgeId,
        positionMs: 0,
      });
      router.replace(`/study?packId=${props.packId}&knowledgeId=${knowledgeId}`);
    },
    [inspectMode, inspectQueue.queue, props.inspect, props.packId, router],
  );

  const readerInspectLessonIds =
    inspectMode &&
    isReaderMode &&
    props.inspect?.category === 'story' &&
    inspectQueue.queue.length > 0
      ? inspectQueue.queue.map((item) => item.knowledgeId)
      : undefined;

  const goHome = useCallback((): void => {
    dismissBrowseComplete();
    if (inspectMode) {
      exitCalendarInspect(router);
      return;
    }
    router.replace('/library');
  }, [dismissBrowseComplete, inspectMode, router]);

  useInspectHardwareBackHandler({
    closeLexicon,
    enabled: inspectMode,
    goHome,
    lexiconVisible,
    moreVisible,
    setMoreVisible,
  });

  const headerContextLabel =
    inspectMode && props.inspect
      ? formatInspectContextLabel({
          localDate: props.inspect.localDate,
          subCategoryLabel: inspectQueue.subCategoryLabel,
          index: inspectQueue.index,
          total: inspectQueue.queue.length,
        })
      : undefined;

  const inspectNavConfig =
    inspectMode && props.inspect
      ? {
          localDate: props.inspect.localDate,
          subCategoryLabel: inspectQueue.subCategoryLabel,
          index: inspectQueue.index,
          total: inspectQueue.queue.length,
          canPrevious: inspectQueue.canPrevious,
          canNext: inspectQueue.canNext,
          onPrevious: inspectQueue.goPrevious,
          onNext: inspectQueue.goNext,
        }
      : null;

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
      resetPackBrowseProgress({ packId: props.packId });
      markLibraryNeedsRefresh();
      restartFromBeginning();
      setResetVisible(false);
      setResetMessage('已重置');
    } catch (error) {
      setResetMessage(error instanceof Error ? error.message : '重置失败');
    }
  }, [props.packId, restartFromBeginning]);

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

  const moreMenuAnchorTop = insets.top + spacing.xs + spacing.touchTarget + spacing.xs;
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
        ) : isBrowseMode && !browseReady && !inspectMode ? (
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
              packId={activePackId}
              playingExampleAudioPath={playingExampleAudioPath}
              primaryAudioPlaying={primaryAudioPlaying}
              revealed={revealed}
              setRevealed={setRevealed}
              sortOrder={cardDetail.sortOrder}
              {...(headerContextLabel && !isReaderMode ? { contextLabel: headerContextLabel } : {})}
              {...(inspectNavConfig && !isReaderMode ? { inspectNav: inspectNavConfig } : {})}
              {...(isReaderMode ? { onReaderBookmark: handleReaderBookmark } : {})}
              {...(isReaderMode ? { initialAudioPositionMs: readerInitialPositionMs } : {})}
              {...(readerInspectLessonIds ? { lessonNavigationIds: readerInspectLessonIds } : {})}
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

      <ResetBrowseProgressDialog
        isReaderMode={isReaderMode}
        onCancel={() => {
          setResetVisible(false);
        }}
        onConfirm={handleConfirmReset}
        packDisplayName={packSummary.packDisplayName}
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
