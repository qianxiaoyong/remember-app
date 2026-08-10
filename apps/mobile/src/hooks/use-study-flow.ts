import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeSurfaceForm } from '@remember/contracts';
import type { LexiconLookupResult } from '../data/repositories/lexicon-entry-repository';
import type { PackCardSummary } from '../data/repositories/pack-card-repository';
import { deletePackBrowseBookmark } from '../data/repositories/pack-browse-bookmark-repository';
import { getLearningStateByKnowledgeId } from '../data/repositories/learning-state-repository';
import { getPackCardDetailUseCase } from '../use-cases/get-pack-card-detail';
import { joinReviewPool } from '../use-cases/join-review-pool';
import { lookupLexiconToken } from '../use-cases/lookup-lexicon-token';
import { playOrCacheLexiconAudio } from '../use-cases/play-or-cache-lexicon-audio';
import { getPackBrowseCompleteSummary } from '../use-cases/get-pack-browse-complete-summary';
import type { PackBrowseCompleteSummary } from '../use-cases/get-pack-browse-complete-summary';
import { useVocabularyStudyAudio } from './use-vocabulary-study-audio';
import { resolvePackLibraryPresentation } from '../use-cases/resolve-pack-library-presentation';
import { resolveStoryReaderEntry } from '../use-cases/resolve-story-reader-entry';
import { resumePackBrowse } from '../use-cases/resume-pack-browse';
import { deleteStoryReadingBookmark } from '../data/repositories/story-reading-bookmark-repository';
import { saveStoryReadingBookmark } from '../use-cases/save-story-reading-bookmark';
import { skipPackCard } from '../use-cases/skip-pack-card';
import { updateReviewPoolFromPack } from '../use-cases/update-review-pool-from-pack';
import { recordVocabularyFirstReveal } from '../use-cases/record-vocabulary-first-reveal';
import { getCurrentCardHeadword } from '../use-cases/get-review-interval-labels';
import {
  isLexiconItemSavedUseCase,
  toggleSavedLexiconItem,
} from '../use-cases/toggle-saved-lexicon-item';
import type { InspectQueueAdvanceResult } from './use-inspect-queue';
import { markLearningCalendarNeedsRefresh } from '../shell/learning-calendar-refresh-signal';
import { upsertPackBrowseBookmarkAfterDecision } from '../use-cases/upsert-pack-browse-bookmark-after-decision';

export function useStudyFlow(
  packId: string,
  options?: {
    knowledgeId?: string | null;
    inspectMode?: boolean;
    inspectLocalDate?: string;
    onInspectActionComplete?: () => InspectQueueAdvanceResult | undefined;
  },
) {
  const isReaderMode = useMemo(() => resolvePackLibraryPresentation(packId) === 'reader', [packId]);
  const isBrowseMode = !isReaderMode;
  const inspectSession = options?.inspectMode === true ? options : null;
  const inspectMode = inspectSession !== null;
  const activitySource = inspectMode ? ('calendar_inspect' as const) : undefined;
  const [browseCards, setBrowseCards] = useState<PackCardSummary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [browseReady, setBrowseReady] = useState(false);
  const [readerEntry, setReaderEntry] = useState<{
    knowledgeId: string;
    positionMs: number;
  } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateReviewVisible, setUpdateReviewVisible] = useState(false);
  const [inReviewPool, setInReviewPool] = useState(false);
  const [lexiconEntry, setLexiconEntry] = useState<LexiconLookupResult | null>(null);
  const [lexiconVisible, setLexiconVisible] = useState(false);
  const [lexiconSaved, setLexiconSaved] = useState(false);
  const [lexiconSelectedSurfaceForm, setLexiconSelectedSurfaceForm] = useState<string | null>(null);
  const [audioMessage, setAudioMessage] = useState<string | null>(null);
  const [browseCompleteVisible, setBrowseCompleteVisible] = useState(false);
  const [browseCompleteSummary, setBrowseCompleteSummary] =
    useState<PackBrowseCompleteSummary | null>(null);

  const startBrowse = useCallback(() => {
    setMessage(null);
    setRevealed(false);
    setBrowseCompleteVisible(false);
    setBrowseCompleteSummary(null);
    try {
      const browse = resumePackBrowse({ packId });
      setBrowseCards(browse.cards);
      setCurrentIndex(browse.initialIndex);
      setBrowseReady(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '无法打开学习包');
      setBrowseReady(false);
    }
  }, [packId]);

  useEffect(() => {
    if (!isReaderMode) {
      setReaderEntry(null);
      return;
    }
    setMessage(null);
    try {
      const entry = resolveStoryReaderEntry(packId, options?.knowledgeId);
      setReaderEntry(entry);
    } catch (error) {
      setReaderEntry(null);
      setMessage(error instanceof Error ? error.message : '无法打开阅读');
    }
  }, [isReaderMode, options?.knowledgeId, packId]);

  useEffect(() => {
    if (!inspectMode || !inspectSession.knowledgeId || !isBrowseMode) {
      return;
    }
    setRevealed(false);
    setBrowseCompleteVisible(false);
    setBrowseCompleteSummary(null);
    setBrowseReady(false);
    const frame = requestAnimationFrame(() => {
      setBrowseReady(true);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [inspectMode, inspectSession?.inspectLocalDate, inspectSession?.knowledgeId, isBrowseMode]);

  const inspectKnowledgeId =
    inspectMode && isBrowseMode ? (inspectSession.knowledgeId ?? null) : null;

  const currentKnowledgeId = isReaderMode
    ? (readerEntry?.knowledgeId ?? null)
    : (inspectKnowledgeId ?? browseCards[currentIndex]?.knowledgeId ?? null);

  useEffect(() => {
    if (!currentKnowledgeId || !isBrowseMode) {
      setInReviewPool(false);
      return;
    }
    const state = getLearningStateByKnowledgeId(currentKnowledgeId);
    setInReviewPool(state?.inReviewPool ?? false);
  }, [currentKnowledgeId, isBrowseMode]);

  const cardDetail = useMemo(() => {
    if (!currentKnowledgeId) {
      return null;
    }
    return getPackCardDetailUseCase(packId, currentKnowledgeId);
  }, [currentKnowledgeId, packId]);

  const headword = useMemo(() => {
    if (!currentKnowledgeId) {
      return null;
    }
    try {
      return getCurrentCardHeadword(packId, currentKnowledgeId);
    } catch {
      return currentKnowledgeId;
    }
  }, [currentKnowledgeId, packId]);

  const { primaryAudioPlaying, playingExampleAudioPath, playPrimaryAudio, playExampleAudio } =
    useVocabularyStudyAudio({
      packId,
      primaryAudioRelativePath:
        cardDetail?.cardType === 'vocabulary' ? cardDetail.content.prompt.primaryAudio : null,
      autoPlayActive:
        isBrowseMode && !revealed && browseReady && cardDetail?.cardType === 'vocabulary',
      cardKey:
        currentKnowledgeId && packId ? `${packId}:${currentKnowledgeId}` : currentKnowledgeId,
    });

  const finishInspectAction = useCallback(() => {
    if (!inspectMode) {
      return;
    }
    markLearningCalendarNeedsRefresh();
    inspectSession.onInspectActionComplete?.();
  }, [inspectMode, inspectSession]);

  const inspectActivityLocalDate = inspectMode ? inspectSession.inspectLocalDate : undefined;

  const advanceBrowse = useCallback(() => {
    if (!isBrowseMode || browseCards.length === 0) {
      return;
    }
    upsertPackBrowseBookmarkAfterDecision({
      packId,
      browseCards,
      currentIndex,
    });
    if (currentIndex < browseCards.length - 1) {
      setCurrentIndex((index) => index + 1);
      setRevealed(false);
      return;
    }
    setRevealed(false);
    setBrowseCompleteSummary(getPackBrowseCompleteSummary(packId));
    setBrowseCompleteVisible(true);
  }, [browseCards, currentIndex, isBrowseMode, packId]);

  const handleJoinReview = useCallback(() => {
    if (!currentKnowledgeId) {
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    try {
      const result = joinReviewPool({
        knowledgeId: currentKnowledgeId,
        catalogPackId: packId,
        ...(headword ? { displayLabel: headword } : {}),
        ...(browseCards[currentIndex]?.sortOrder !== undefined
          ? { sortOrder: browseCards[currentIndex].sortOrder }
          : cardDetail?.sortOrder !== undefined
            ? { sortOrder: cardDetail.sortOrder }
            : {}),
        ...(activitySource ? { activitySource } : {}),
        ...(inspectActivityLocalDate ? { activityLocalDate: inspectActivityLocalDate } : {}),
      });
      if (result.status === 'created') {
        setInReviewPool(true);
      }
      if (!inspectMode) {
        advanceBrowse();
      } else {
        finishInspectAction();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '加入复习失败');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activitySource,
    advanceBrowse,
    browseCards,
    cardDetail?.sortOrder,
    currentIndex,
    currentKnowledgeId,
    finishInspectAction,
    headword,
    inspectActivityLocalDate,
    inspectMode,
    packId,
  ]);

  const handleConfirmUpdateReview = useCallback(() => {
    if (!currentKnowledgeId) {
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    try {
      updateReviewPoolFromPack({
        knowledgeId: currentKnowledgeId,
        catalogPackId: packId,
        ...(headword ? { displayLabel: headword } : {}),
        ...(browseCards[currentIndex]?.sortOrder !== undefined
          ? { sortOrder: browseCards[currentIndex].sortOrder }
          : cardDetail?.sortOrder !== undefined
            ? { sortOrder: cardDetail.sortOrder }
            : {}),
        ...(activitySource ? { activitySource } : {}),
        ...(inspectActivityLocalDate ? { activityLocalDate: inspectActivityLocalDate } : {}),
      });
      setInReviewPool(true);
      setUpdateReviewVisible(false);
      if (!inspectMode) {
        advanceBrowse();
      } else {
        finishInspectAction();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '更新复习失败');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activitySource,
    advanceBrowse,
    browseCards,
    cardDetail?.sortOrder,
    currentIndex,
    currentKnowledgeId,
    finishInspectAction,
    headword,
    inspectActivityLocalDate,
    inspectMode,
    packId,
  ]);

  const handleSkip = useCallback(() => {
    if (!currentKnowledgeId) {
      return;
    }
    skipPackCard({
      packId,
      knowledgeId: currentKnowledgeId,
      ...(headword ? { displayLabel: headword } : {}),
      ...(browseCards[currentIndex]?.sortOrder !== undefined
        ? { sortOrder: browseCards[currentIndex].sortOrder }
        : cardDetail?.sortOrder !== undefined
          ? { sortOrder: cardDetail.sortOrder }
          : {}),
      ...(activitySource ? { activitySource } : {}),
      ...(inspectActivityLocalDate ? { activityLocalDate: inspectActivityLocalDate } : {}),
    });
    if (!inspectMode) {
      advanceBrowse();
    } else {
      finishInspectAction();
    }
  }, [
    activitySource,
    advanceBrowse,
    browseCards,
    cardDetail?.sortOrder,
    currentIndex,
    currentKnowledgeId,
    finishInspectAction,
    headword,
    inspectActivityLocalDate,
    inspectMode,
    packId,
  ]);

  const handleSetRevealed = useCallback(
    (value: boolean) => {
      setRevealed(value);
      if (
        value &&
        !inspectMode &&
        currentKnowledgeId &&
        cardDetail?.cardType === 'vocabulary' &&
        headword
      ) {
        recordVocabularyFirstReveal({
          catalogPackId: packId,
          knowledgeId: currentKnowledgeId,
          headword,
          sortOrder: cardDetail.sortOrder,
        });
      }
    },
    [cardDetail, currentKnowledgeId, headword, inspectMode, packId],
  );

  const handleReaderBookmark = useCallback(
    (positionMs: number) => {
      if (!currentKnowledgeId) {
        return;
      }
      saveStoryReadingBookmark({
        packId,
        knowledgeId: currentKnowledgeId,
        positionMs,
      });
    },
    [currentKnowledgeId, packId],
  );

  const openLexicon = useCallback(
    (token: string) => {
      const surfaceForm = normalizeSurfaceForm(token);
      setLexiconSelectedSurfaceForm(surfaceForm);
      const entry = lookupLexiconToken({ packId, token });
      setLexiconEntry(entry);
      setLexiconVisible(true);
      setAudioMessage(null);
      setLexiconSaved(entry ? isLexiconItemSavedUseCase(packId, entry.surfaceForm) : false);
    },
    [packId],
  );

  const handleToggleSave = useCallback(() => {
    if (!lexiconEntry) {
      return;
    }
    const saved = toggleSavedLexiconItem({
      packId,
      surfaceForm: lexiconEntry.surfaceForm,
    });
    setLexiconSaved(saved);
  }, [lexiconEntry, packId]);

  const handlePlayPrimaryAudio = useCallback(() => {
    if (!cardDetail) {
      return;
    }
    const relativePath =
      cardDetail.cardType === 'vocabulary'
        ? cardDetail.content.prompt.primaryAudio
        : cardDetail.content.lesson.primaryAudio;
    playPrimaryAudio(relativePath);
  }, [cardDetail, playPrimaryAudio]);

  const handlePlayExampleAudio = useCallback(
    (relativePath: string) => {
      playExampleAudio(relativePath);
    },
    [playExampleAudio],
  );

  const handlePlayAudio = useCallback(() => {
    if (!lexiconEntry) {
      return;
    }
    void playOrCacheLexiconAudio({
      surfaceForm: lexiconEntry.surfaceForm,
      audioUrl: lexiconEntry.audioUrl,
    }).then((result) => {
      if (result.status === 'no-audio') {
        setAudioMessage('暂无远程发音');
        return;
      }
      if (result.status === 'downloaded') {
        setAudioMessage('首次下载完成，已缓存可离线播放');
        return;
      }
      setAudioMessage('使用离线缓存发音');
    });
  }, [lexiconEntry]);

  const restartFromBeginning = useCallback(() => {
    if (isReaderMode) {
      deleteStoryReadingBookmark(packId);
      setReaderEntry(resolveStoryReaderEntry(packId, null));
      return;
    }
    deletePackBrowseBookmark(packId);
    setCurrentIndex(0);
    setBrowseCompleteVisible(false);
    setBrowseCompleteSummary(null);
    setRevealed(false);
  }, [isReaderMode, packId]);

  const dismissBrowseComplete = useCallback(() => {
    setBrowseCompleteVisible(false);
  }, []);

  return {
    isReaderMode,
    isBrowseMode,
    browseReady,
    readerInitialPositionMs: readerEntry?.positionMs ?? 0,
    revealed,
    message,
    isSubmitting,
    inReviewPool,
    updateReviewVisible,
    lexiconEntry,
    lexiconVisible,
    lexiconSaved,
    lexiconSelectedSurfaceForm: lexiconVisible ? lexiconSelectedSurfaceForm : null,
    audioMessage,
    cardDetail,
    headword,
    startBrowse,
    setRevealed: handleSetRevealed,
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
    browseCompleteVisible,
    browseCompleteSummary,
    restartFromBeginning,
    dismissBrowseComplete,
    refreshInReviewPool: () => {
      if (!currentKnowledgeId) {
        setInReviewPool(false);
        return;
      }
      const state = getLearningStateByKnowledgeId(currentKnowledgeId);
      setInReviewPool(state?.inReviewPool ?? false);
    },
    closeLexicon: () => {
      setLexiconVisible(false);
      setLexiconSelectedSurfaceForm(null);
    },
  };
}
