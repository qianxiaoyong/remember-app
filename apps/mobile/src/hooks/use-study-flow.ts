import { useCallback, useMemo, useState } from 'react';
import type { ReviewRating } from '@remember/domain';
import { normalizeSurfaceForm } from '@remember/contracts';
import type { LexiconLookupResult } from '../data/repositories/lexicon-entry-repository';
import { confirmCardReview } from '../use-cases/confirm-card-review';
import { getPackCardDetailUseCase } from '../use-cases/get-pack-card-detail';
import {
  getCurrentCardHeadword,
  getReviewIntervalLabels,
} from '../use-cases/get-review-interval-labels';
import { lookupLexiconToken } from '../use-cases/lookup-lexicon-token';
import { playOrCacheLexiconAudio } from '../use-cases/play-or-cache-lexicon-audio';
import { playPackAssetAudio } from '../use-cases/play-pack-asset-audio';
import { resumeOrStartStudySession } from '../use-cases/resume-or-start-study-session';
import type { ActiveStudySession } from '../use-cases/study-session-types';
import {
  isLexiconItemSavedUseCase,
  toggleSavedLexiconItem,
} from '../use-cases/toggle-saved-lexicon-item';

export function useStudyFlow(packId: string) {
  const [session, setSession] = useState<ActiveStudySession | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lexiconEntry, setLexiconEntry] = useState<LexiconLookupResult | null>(null);
  const [lexiconVisible, setLexiconVisible] = useState(false);
  const [lexiconSaved, setLexiconSaved] = useState(false);
  const [lexiconSelectedSurfaceForm, setLexiconSelectedSurfaceForm] = useState<string | null>(null);
  const [audioMessage, setAudioMessage] = useState<string | null>(null);

  const startSession = useCallback(() => {
    setMessage(null);
    setRevealed(false);
    try {
      const nextSession = resumeOrStartStudySession(packId);
      setSession(nextSession);
      if (nextSession.totalCount === 0) {
        setMessage(null);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '无法开始学习');
    }
  }, [packId]);

  const currentKnowledgeId = session?.currentItem?.knowledgeId ?? null;
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

  const intervalLabels = useMemo(() => {
    if (!currentKnowledgeId) {
      return null;
    }
    return getReviewIntervalLabels(currentKnowledgeId);
  }, [currentKnowledgeId]);

  const handleReview = useCallback(
    (rating: ReviewRating) => {
      if (!session?.currentItem) {
        return;
      }
      setIsSubmitting(true);
      setMessage(null);
      try {
        const nextSession = confirmCardReview({
          packId,
          knowledgeId: session.currentItem.knowledgeId,
          rating,
        });
        setSession(nextSession);
        setRevealed(false);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '保存作答失败');
      } finally {
        setIsSubmitting(false);
      }
    },
    [packId, session],
  );

  const openLexicon = useCallback(
    (token: string) => {
      const surfaceForm = normalizeSurfaceForm(token);
      setLexiconSelectedSurfaceForm(surfaceForm || null);
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
    void playPackAssetAudio({
      packId,
      relativePath: cardDetail.content.prompt.primaryAudio,
    });
  }, [cardDetail, packId]);

  const handlePlayExampleAudio = useCallback(
    (relativePath: string) => {
      void playPackAssetAudio({
        packId,
        relativePath,
      });
    },
    [packId],
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

  return {
    session,
    revealed,
    message,
    isSubmitting,
    lexiconEntry,
    lexiconVisible,
    lexiconSaved,
    lexiconSelectedSurfaceForm: lexiconVisible ? lexiconSelectedSurfaceForm : null,
    audioMessage,
    cardDetail,
    headword,
    intervalLabels,
    startSession,
    setRevealed,
    handleReview,
    openLexicon,
    handleToggleSave,
    handlePlayAudio,
    handlePlayPrimaryAudio,
    handlePlayExampleAudio,
    closeLexicon: () => {
      setLexiconVisible(false);
      setLexiconSelectedSurfaceForm(null);
    },
  };
}
