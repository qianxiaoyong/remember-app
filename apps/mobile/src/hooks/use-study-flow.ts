import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { normalizeSurfaceForm } from '@remember/contracts';
import type { LexiconLookupResult } from '../data/repositories/lexicon-entry-repository';
import type { PackCardSummary } from '../data/repositories/pack-card-repository';
import {
  upsertPackBrowseBookmark,
  deletePackBrowseBookmark,
} from '../data/repositories/pack-browse-bookmark-repository';
import { getLearningStateByKnowledgeId } from '../data/repositories/learning-state-repository';
import { getPackCardDetailUseCase } from '../use-cases/get-pack-card-detail';
import { joinReviewPool } from '../use-cases/join-review-pool';
import { lookupLexiconToken } from '../use-cases/lookup-lexicon-token';
import { playOrCacheLexiconAudio } from '../use-cases/play-or-cache-lexicon-audio';
import { getRecallAutoPlayEnabled } from '../data/repositories/user-preferences-repository';
import { playPackAssetAudio } from '../use-cases/play-pack-asset-audio';
import {
  beginPrimaryAudioPlayback,
  cancelExpoAudioPlayback,
  playExpoAudioUriRepeated,
  subscribeExpoAudioPosition,
} from '../use-cases/play-expo-audio-uri';
import { resolvePackAssetUri } from '../use-cases/resolve-pack-asset-uri';
import { resolvePackLibraryPresentation } from '../use-cases/resolve-pack-library-presentation';
import { resolveStoryReaderEntry } from '../use-cases/resolve-story-reader-entry';
import { resumePackBrowse } from '../use-cases/resume-pack-browse';
import { deleteStoryReadingBookmark } from '../data/repositories/story-reading-bookmark-repository';
import { saveStoryReadingBookmark } from '../use-cases/save-story-reading-bookmark';
import { skipPackCard } from '../use-cases/skip-pack-card';
import { updateReviewPoolFromPack } from '../use-cases/update-review-pool-from-pack';
import { getCurrentCardHeadword } from '../use-cases/get-review-interval-labels';
import {
  isLexiconItemSavedUseCase,
  toggleSavedLexiconItem,
} from '../use-cases/toggle-saved-lexicon-item';
import { getPackBrowseCompleteSummary } from '../use-cases/get-pack-browse-complete-summary';
import type { PackBrowseCompleteSummary } from '../use-cases/get-pack-browse-complete-summary';

export function useStudyFlow(
  packId: string,
  options?: {
    knowledgeId?: string | null;
  },
) {
  const isReaderMode = useMemo(() => resolvePackLibraryPresentation(packId) === 'reader', [packId]);
  const isBrowseMode = !isReaderMode;
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
  const recallAutoPlayTokenRef = useRef(0);
  const activeStudyAudioRef = useRef<'primary' | { kind: 'example'; path: string } | null>(null);
  const [primaryAudioPlaying, setPrimaryAudioPlaying] = useState(false);
  const [playingExampleAudioPath, setPlayingExampleAudioPath] = useState<string | null>(null);

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

  const currentKnowledgeId = isReaderMode
    ? (readerEntry?.knowledgeId ?? null)
    : (browseCards[currentIndex]?.knowledgeId ?? null);

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

  const cancelRecallAutoPlay = useCallback(() => {
    recallAutoPlayTokenRef.current += 1;
    activeStudyAudioRef.current = null;
    cancelExpoAudioPlayback();
    setPrimaryAudioPlaying(false);
    setPlayingExampleAudioPath(null);
  }, []);

  useEffect(() => {
    return subscribeExpoAudioPosition((state) => {
      const active = activeStudyAudioRef.current;
      if (!active) {
        setPrimaryAudioPlaying(false);
        setPlayingExampleAudioPath(null);
        return;
      }
      if (active === 'primary') {
        setPrimaryAudioPlaying(state.playing);
        setPlayingExampleAudioPath(null);
        return;
      }
      setPrimaryAudioPlaying(false);
      setPlayingExampleAudioPath(state.playing ? active.path : null);
    });
  }, []);

  useEffect(() => {
    if (!isBrowseMode || revealed || !browseReady) {
      cancelRecallAutoPlay();
      return;
    }
    if (!getRecallAutoPlayEnabled()) {
      return;
    }
    if (cardDetail?.cardType !== 'vocabulary') {
      return;
    }

    const relativePath = cardDetail.content.prompt.primaryAudio;
    const uri = resolvePackAssetUri(packId, relativePath);
    if (!uri) {
      return;
    }

    const token = beginPrimaryAudioPlayback();
    recallAutoPlayTokenRef.current = token;
    activeStudyAudioRef.current = 'primary';
    void playExpoAudioUriRepeated(uri, 3, token).finally(() => {
      if (recallAutoPlayTokenRef.current === token) {
        activeStudyAudioRef.current = null;
      }
    });

    return () => {
      if (recallAutoPlayTokenRef.current === token) {
        cancelRecallAutoPlay();
      }
    };
  }, [
    browseReady,
    cancelRecallAutoPlay,
    cardDetail,
    currentKnowledgeId,
    isBrowseMode,
    packId,
    revealed,
  ]);

  const advanceBrowse = useCallback(() => {
    if (!isBrowseMode || browseCards.length === 0) {
      return;
    }
    const currentCard = browseCards[currentIndex];
    if (currentCard) {
      upsertPackBrowseBookmark({
        packId,
        knowledgeId: currentCard.knowledgeId,
        sortOrder: currentCard.sortOrder,
        updatedAt: new Date().toISOString(),
      });
    }
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
      });
      if (result.status === 'created') {
        setInReviewPool(true);
      }
      advanceBrowse();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '加入复习失败');
    } finally {
      setIsSubmitting(false);
    }
  }, [advanceBrowse, currentKnowledgeId, packId]);

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
      });
      setInReviewPool(true);
      setUpdateReviewVisible(false);
      advanceBrowse();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '更新复习失败');
    } finally {
      setIsSubmitting(false);
    }
  }, [advanceBrowse, currentKnowledgeId, packId]);

  const handleSkip = useCallback(() => {
    if (!currentKnowledgeId) {
      return;
    }
    skipPackCard({ packId, knowledgeId: currentKnowledgeId });
    advanceBrowse();
  }, [advanceBrowse, currentKnowledgeId, packId]);

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
    cancelRecallAutoPlay();
    activeStudyAudioRef.current = 'primary';
    const relativePath =
      cardDetail.cardType === 'vocabulary'
        ? cardDetail.content.prompt.primaryAudio
        : cardDetail.content.lesson.primaryAudio;
    void playPackAssetAudio({
      packId,
      relativePath,
    });
  }, [cancelRecallAutoPlay, cardDetail, packId]);

  const handlePlayExampleAudio = useCallback(
    (relativePath: string) => {
      cancelRecallAutoPlay();
      activeStudyAudioRef.current = { kind: 'example', path: relativePath };
      void playPackAssetAudio({
        packId,
        relativePath,
      });
    },
    [cancelRecallAutoPlay, packId],
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
