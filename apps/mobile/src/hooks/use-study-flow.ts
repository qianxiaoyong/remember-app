import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PackCardSummary } from '../data/repositories/pack-card-repository';
import { deletePackBrowseBookmark } from '../data/repositories/pack-browse-bookmark-repository';
import { getLearningStateByKnowledgeId } from '../data/repositories/learning-state-repository';
import { getPackCardDetailUseCase } from '../use-cases/get-pack-card-detail';
import type { PackBrowseCompleteSummary } from '../use-cases/get-pack-browse-complete-summary';
import { useVocabularyStudyAudio } from './use-vocabulary-study-audio';
import { resolvePackLibraryPresentation } from '../use-cases/resolve-pack-library-presentation';
import { resolveStoryReaderEntry } from '../use-cases/resolve-story-reader-entry';
import { resumePackBrowse } from '../use-cases/resume-pack-browse';
import { deleteStoryReadingBookmark } from '../data/repositories/story-reading-bookmark-repository';
import { saveStoryReadingBookmark } from '../use-cases/save-story-reading-bookmark';
import { recordVocabularyFirstReveal } from '../use-cases/record-vocabulary-first-reveal';
import { getCurrentCardHeadword } from '../use-cases/get-review-interval-labels';
import type { InspectQueueAdvanceResult } from './use-inspect-queue';
import { useStudyBrowseDecisions } from './use-study-browse-decisions';
import { useStudyLexicon } from './use-study-lexicon';

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
  const [browseCompleteVisible, setBrowseCompleteVisible] = useState(false);
  const [browseCompleteSummary, setBrowseCompleteSummary] =
    useState<PackBrowseCompleteSummary | null>(null);
  const lexicon = useStudyLexicon(packId);

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
    if (inspectMode && isBrowseMode) {
      setBrowseReady(true);
    }
  }, [inspectMode, inspectSession?.inspectLocalDate, inspectSession?.knowledgeId, isBrowseMode]);

  useEffect(() => {
    if (!inspectMode || !inspectSession.knowledgeId || !isBrowseMode) {
      return;
    }
    setRevealed(false);
    setBrowseCompleteVisible(false);
    setBrowseCompleteSummary(null);
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

  const inspectActivityLocalDate = inspectMode ? inspectSession.inspectLocalDate : undefined;

  const { handleJoinReview, handleConfirmUpdateReview, handleSkip } = useStudyBrowseDecisions({
    packId,
    isBrowseMode,
    browseCards,
    currentIndex,
    currentKnowledgeId,
    headword,
    cardDetail,
    inspectMode,
    activitySource,
    inspectActivityLocalDate,
    ...(inspectSession?.onInspectActionComplete
      ? { onInspectActionComplete: inspectSession.onInspectActionComplete }
      : {}),
    setCurrentIndex,
    setRevealed,
    setBrowseCompleteVisible,
    setBrowseCompleteSummary,
    setInReviewPool,
    setUpdateReviewVisible,
    setIsSubmitting,
    setMessage,
  });

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
    lexiconEntry: lexicon.lexiconEntry,
    lexiconVisible: lexicon.lexiconVisible,
    lexiconSaved: lexicon.lexiconSaved,
    lexiconSelectedSurfaceForm: lexicon.lexiconSelectedSurfaceForm,
    audioMessage: lexicon.audioMessage,
    cardDetail,
    headword,
    startBrowse,
    setRevealed: handleSetRevealed,
    handleJoinReview,
    handleSkip,
    handleConfirmUpdateReview,
    setUpdateReviewVisible,
    handleReaderBookmark,
    openLexicon: lexicon.openLexicon,
    handleToggleSave: lexicon.handleToggleSave,
    handlePlayAudio: lexicon.handlePlayAudio,
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
    closeLexicon: lexicon.closeLexicon,
  };
}
