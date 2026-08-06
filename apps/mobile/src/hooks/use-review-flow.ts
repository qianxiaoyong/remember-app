import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeSurfaceForm } from '@remember/contracts';
import type { LexiconLookupResult } from '../data/repositories/lexicon-entry-repository';
import {
  setUserPreference,
  PREFERENCE_DAILY_REVIEW_LIMIT,
} from '../data/repositories/user-preferences-repository';
import { confirmReviewOutcome } from '../use-cases/confirm-review-outcome';
import { getReviewTabSummary } from '../use-cases/get-review-tab-summary';
import { lookupLexiconToken } from '../use-cases/lookup-lexicon-token';
import { playOrCacheLexiconAudio } from '../use-cases/play-or-cache-lexicon-audio';
import { playPackAssetAudio } from '../use-cases/play-pack-asset-audio';
import { resolveReviewCardContext } from '../use-cases/resolve-review-card-context';
import { resumeOrStartReviewSession } from '../use-cases/resume-or-start-review-session';
import type { ActiveStudySession } from '../use-cases/study-session-types';
import {
  isLexiconItemSavedUseCase,
  toggleSavedLexiconItem,
} from '../use-cases/toggle-saved-lexicon-item';

export function useReviewFlow() {
  const [session, setSession] = useState<ActiveStudySession | null>(null);
  const [summary, setSummary] = useState(getReviewTabSummary());
  const [revealed, setRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lexiconEntry, setLexiconEntry] = useState<LexiconLookupResult | null>(null);
  const [lexiconVisible, setLexiconVisible] = useState(false);
  const [lexiconSaved, setLexiconSaved] = useState(false);
  const [lexiconSelectedSurfaceForm, setLexiconSelectedSurfaceForm] = useState<string | null>(null);
  const [audioMessage, setAudioMessage] = useState<string | null>(null);

  const refreshSummary = useCallback(() => {
    setSummary(getReviewTabSummary());
  }, []);

  const startReview = useCallback(() => {
    setMessage(null);
    setRevealed(false);
    setLexiconVisible(false);
    setLexiconSelectedSurfaceForm(null);
    try {
      const nextSession = resumeOrStartReviewSession();
      setSession(nextSession);
      refreshSummary();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '无法开始复习');
    }
  }, [refreshSummary]);

  useEffect(() => {
    startReview();
  }, [startReview]);

  const currentKnowledgeId = session?.currentItem?.knowledgeId ?? null;
  const reviewContext = useMemo(() => {
    if (!currentKnowledgeId) {
      return null;
    }
    return resolveReviewCardContext(currentKnowledgeId);
  }, [currentKnowledgeId]);

  const sourcePackId = reviewContext?.sourcePackId ?? null;

  const openLexicon = useCallback(
    (token: string) => {
      if (!sourcePackId) {
        return;
      }
      const surfaceForm = normalizeSurfaceForm(token);
      setLexiconSelectedSurfaceForm(surfaceForm);
      const entry = lookupLexiconToken({ packId: sourcePackId, token });
      setLexiconEntry(entry);
      setLexiconVisible(true);
      setAudioMessage(null);
      setLexiconSaved(entry ? isLexiconItemSavedUseCase(sourcePackId, entry.surfaceForm) : false);
    },
    [sourcePackId],
  );

  const handleToggleSave = useCallback(() => {
    if (!lexiconEntry || !sourcePackId) {
      return;
    }
    const saved = toggleSavedLexiconItem({
      packId: sourcePackId,
      surfaceForm: lexiconEntry.surfaceForm,
    });
    setLexiconSaved(saved);
  }, [lexiconEntry, sourcePackId]);

  const handlePlayPrimaryAudio = useCallback(() => {
    if (reviewContext?.cardDetail?.cardType !== 'vocabulary') {
      return;
    }
    void playPackAssetAudio({
      packId: reviewContext.sourcePackId,
      relativePath: reviewContext.cardDetail.content.prompt.primaryAudio,
    });
  }, [reviewContext]);

  const handlePlayExampleAudio = useCallback(
    (relativePath: string) => {
      if (!sourcePackId) {
        return;
      }
      void playPackAssetAudio({
        packId: sourcePackId,
        relativePath,
      });
    },
    [sourcePackId],
  );

  const handlePlayLexiconAudio = useCallback(() => {
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

  const handleOutcome = useCallback(
    (outcome: 'passed' | 'failed') => {
      if (!session?.sessionId || !currentKnowledgeId) {
        return;
      }
      setIsSubmitting(true);
      setMessage(null);
      setLexiconVisible(false);
      setLexiconSelectedSurfaceForm(null);
      try {
        confirmReviewOutcome({
          sessionId: session.sessionId,
          knowledgeId: currentKnowledgeId,
          outcome,
        });
        const nextSession = resumeOrStartReviewSession();
        setSession(nextSession);
        setRevealed(false);
        refreshSummary();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '保存复习结果失败');
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentKnowledgeId, refreshSummary, session?.sessionId],
  );

  const setDailyReviewLimit = useCallback(
    (value: number) => {
      const clamped = Math.min(Math.max(value, 1), 999);
      setUserPreference({
        key: PREFERENCE_DAILY_REVIEW_LIMIT,
        value: String(clamped),
        updatedAt: new Date().toISOString(),
      });
      refreshSummary();
      startReview();
    },
    [refreshSummary, startReview],
  );

  return {
    session,
    summary,
    revealed,
    isSubmitting,
    message,
    reviewContext,
    lexiconEntry,
    lexiconVisible,
    lexiconSaved,
    lexiconSelectedSurfaceForm: lexiconVisible ? lexiconSelectedSurfaceForm : null,
    audioMessage,
    setRevealed,
    handlePassed: () => {
      handleOutcome('passed');
    },
    handleFailed: () => {
      handleOutcome('failed');
    },
    setDailyReviewLimit,
    refreshSummary,
    startReview,
    openLexicon,
    handleToggleSave,
    handlePlayLexiconAudio,
    handlePlayPrimaryAudio,
    handlePlayExampleAudio,
    closeLexicon: () => {
      setLexiconVisible(false);
      setLexiconSelectedSurfaceForm(null);
    },
  };
}
