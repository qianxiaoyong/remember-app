import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { normalizeSurfaceForm } from '@remember/contracts';
import type { LexiconLookupResult } from '../data/repositories/lexicon-entry-repository';
import {
  setUserPreference,
  PREFERENCE_DAILY_REVIEW_LIMIT,
} from '../data/repositories/user-preferences-repository';
import { confirmReviewOutcome } from '../use-cases/confirm-review-outcome';
import {
  getReviewTabSummary,
  invalidateReviewTabSummaryCache,
  type ReviewTabSummary,
} from '../use-cases/get-review-tab-summary';
import { lookupLexiconToken } from '../use-cases/lookup-lexicon-token';
import { playOrCacheLexiconAudio } from '../use-cases/play-or-cache-lexicon-audio';
import { resolveReviewCardContext } from '../use-cases/resolve-review-card-context';
import { resumeOrStartReviewSession } from '../use-cases/resume-or-start-review-session';
import { skipUnloadedReviewQueueItem } from '../use-cases/skip-unloaded-review-queue-item';
import type { ActiveStudySession } from '../use-cases/study-session-types';
import {
  isLexiconItemSavedUseCase,
  toggleSavedLexiconItem,
} from '../use-cases/toggle-saved-lexicon-item';
import { getReviewOutcomeIntervalLabels } from '../use-cases/get-review-outcome-interval-labels';
import {
  markReviewPoolChanged,
  subscribeReviewPoolChanged,
} from '../shell/review-pool-changed-signal';
import { useVocabularyStudyAudio } from './use-vocabulary-study-audio';

const EMPTY_REVIEW_SUMMARY: ReviewTabSummary = {
  dueTotal: 0,
  reviewableDueTotal: 0,
  dailyReviewLimit: 20,
  todayReviewCompleted: 0,
  remainingQuota: 20,
  joinedPoolCountToday: 0,
};

function sessionHasLoadableCurrentItem(session: ActiveStudySession | null): boolean {
  if (!session?.currentItem) {
    return false;
  }
  return resolveReviewCardContext(session.currentItem.knowledgeId)?.cardDetail != null;
}

export function useReviewFlow(options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false;
  const [isScreenFocused, setIsScreenFocused] = useState(false);
  const [session, setSession] = useState<ActiveStudySession | null>(null);
  const [summary, setSummary] = useState<ReviewTabSummary>(EMPTY_REVIEW_SUMMARY);
  const [revealed, setRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lexiconEntry, setLexiconEntry] = useState<LexiconLookupResult | null>(null);
  const [lexiconVisible, setLexiconVisible] = useState(false);
  const [lexiconSaved, setLexiconSaved] = useState(false);
  const [lexiconSelectedSurfaceForm, setLexiconSelectedSurfaceForm] = useState<string | null>(null);
  const [audioMessage, setAudioMessage] = useState<string | null>(null);
  const needsSessionRefreshRef = useRef(true);
  const isScreenFocusedRef = useRef(false);
  const sessionReadyRef = useRef(false);
  const roundStatsRef = useRef({ passed: 0, failed: 0 });
  const [isStartingReview, setIsStartingReview] = useState(false);
  const [completedRound, setCompletedRound] = useState<{ passed: number; failed: number } | null>(
    null,
  );

  const refreshSummary = useCallback(() => {
    setSummary(getReviewTabSummary());
  }, []);

  const clearCompletedRound = useCallback(() => {
    setCompletedRound(null);
  }, []);

  const startReview = useCallback((startOptions?: { forceRebuild?: boolean }) => {
    setMessage(null);
    setRevealed(false);
    setLexiconVisible(false);
    setLexiconSelectedSurfaceForm(null);
    roundStatsRef.current = { passed: 0, failed: 0 };
    setCompletedRound(null);
    setIsStartingReview(true);
    try {
      const forceRebuild = startOptions?.forceRebuild ?? needsSessionRefreshRef.current;
      const nextSession = resumeOrStartReviewSession(undefined, { forceRebuild });
      setSession(nextSession);
      const latestSummary = getReviewTabSummary();
      setSummary(latestSummary);
      const hasLoadableItem = sessionHasLoadableCurrentItem(nextSession);
      needsSessionRefreshRef.current = false;
      sessionReadyRef.current = hasLoadableItem || nextSession.sessionId === 'empty';
      if (
        !hasLoadableItem &&
        latestSummary.reviewableDueTotal > 0 &&
        latestSummary.remainingQuota > 0
      ) {
        setMessage('无法加载到期复习词，请返回后重试');
      }
    } catch (error) {
      needsSessionRefreshRef.current = true;
      sessionReadyRef.current = false;
      setMessage(error instanceof Error ? error.message : '无法开始复习');
    } finally {
      setIsStartingReview(false);
    }
  }, []);

  const scheduleSessionRefresh = useCallback(
    (forceRebuild: boolean) => {
      needsSessionRefreshRef.current = true;
      sessionReadyRef.current = false;
      const handle = InteractionManager.runAfterInteractions(() => {
        if (!enabled || !isScreenFocusedRef.current) {
          return;
        }
        startReview({ forceRebuild });
      });
      return handle;
    },
    [enabled, startReview],
  );

  useEffect(() => {
    return subscribeReviewPoolChanged((reason) => {
      if (reason !== 'join_due') {
        invalidateReviewTabSummaryCache();
      }
      if (enabled && isScreenFocusedRef.current) {
        scheduleSessionRefresh(true);
      } else {
        needsSessionRefreshRef.current = true;
      }
    });
  }, [enabled, scheduleSessionRefresh]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return;
      }
      setIsScreenFocused(true);
      isScreenFocusedRef.current = true;

      if (sessionReadyRef.current && !needsSessionRefreshRef.current) {
        return () => {
          setIsScreenFocused(false);
          isScreenFocusedRef.current = false;
        };
      }

      const handle = scheduleSessionRefresh(needsSessionRefreshRef.current);
      return () => {
        handle.cancel();
        setIsScreenFocused(false);
        isScreenFocusedRef.current = false;
      };
    }, [enabled, scheduleSessionRefresh]),
  );

  const currentKnowledgeId = session?.currentItem?.knowledgeId ?? null;
  const reviewContext = useMemo(() => {
    if (!currentKnowledgeId) {
      return null;
    }
    return resolveReviewCardContext(currentKnowledgeId);
  }, [currentKnowledgeId]);

  const sourcePackId = reviewContext?.sourcePackId ?? null;

  const { primaryAudioPlaying, playingExampleAudioPath, playPrimaryAudio, playExampleAudio } =
    useVocabularyStudyAudio({
      packId: sourcePackId,
      primaryAudioRelativePath:
        reviewContext?.cardDetail?.cardType === 'vocabulary'
          ? reviewContext.cardDetail.content.prompt.primaryAudio
          : null,
      autoPlayActive:
        enabled &&
        isScreenFocused &&
        !revealed &&
        reviewContext?.cardDetail?.cardType === 'vocabulary' &&
        Boolean(sourcePackId),
      cardKey: currentKnowledgeId,
    });

  const outcomeIntervalLabels = useMemo(() => {
    if (!currentKnowledgeId) {
      return null;
    }
    return getReviewOutcomeIntervalLabels(currentKnowledgeId);
  }, [currentKnowledgeId]);

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
    playPrimaryAudio(reviewContext.cardDetail.content.prompt.primaryAudio);
  }, [playPrimaryAudio, reviewContext]);

  const handlePlayExampleAudio = useCallback(
    (relativePath: string) => {
      playExampleAudio(relativePath);
    },
    [playExampleAudio],
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
          ...(reviewContext?.cardDetail?.cardType === 'vocabulary'
            ? { displayLabel: reviewContext.cardDetail.content.prompt.headword }
            : {}),
          activitySource: 'review_tab',
        });
        markReviewPoolChanged();
        needsSessionRefreshRef.current = true;
        if (outcome === 'passed') {
          roundStatsRef.current.passed += 1;
        } else {
          roundStatsRef.current.failed += 1;
        }
        const nextSession = resumeOrStartReviewSession();
        setSession(nextSession);
        setRevealed(false);
        refreshSummary();
        needsSessionRefreshRef.current = !sessionHasLoadableCurrentItem(nextSession);
        sessionReadyRef.current = sessionHasLoadableCurrentItem(nextSession);
        if (!nextSession.currentItem) {
          const { passed, failed } = roundStatsRef.current;
          if (passed + failed > 0) {
            setCompletedRound({ passed, failed });
            roundStatsRef.current = { passed: 0, failed: 0 };
          }
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '保存复习结果失败');
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentKnowledgeId, refreshSummary, reviewContext?.cardDetail, session?.sessionId],
  );

  const handleSkipUnloaded = useCallback(() => {
    if (!session?.sessionId || !currentKnowledgeId) {
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    setLexiconVisible(false);
    setLexiconSelectedSurfaceForm(null);
    try {
      skipUnloadedReviewQueueItem({
        sessionId: session.sessionId,
        knowledgeId: currentKnowledgeId,
      });
      const nextSession = resumeOrStartReviewSession(undefined, { forceRebuild: true });
      setSession(nextSession);
      setRevealed(false);
      refreshSummary();
      needsSessionRefreshRef.current = !sessionHasLoadableCurrentItem(nextSession);
      sessionReadyRef.current = sessionHasLoadableCurrentItem(nextSession);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '跳过失败');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentKnowledgeId, refreshSummary, session?.sessionId]);

  useEffect(() => {
    if (!enabled || !isScreenFocused || isSubmitting || isStartingReview) {
      return;
    }
    if (session?.currentItem && !reviewContext?.cardDetail) {
      handleSkipUnloaded();
    }
  }, [
    enabled,
    handleSkipUnloaded,
    isScreenFocused,
    isStartingReview,
    isSubmitting,
    reviewContext?.cardDetail,
    session?.currentItem,
  ]);

  const setDailyReviewLimit = useCallback(
    (value: number) => {
      const clamped = Math.min(Math.max(value, 1), 999);
      setUserPreference({
        key: PREFERENCE_DAILY_REVIEW_LIMIT,
        value: String(clamped),
        updatedAt: new Date().toISOString(),
      });
      invalidateReviewTabSummaryCache();
      refreshSummary();
      startReview({ forceRebuild: true });
    },
    [refreshSummary, startReview],
  );

  const isSessionBootstrapping =
    enabled && isScreenFocused && isStartingReview && summary.reviewableDueTotal > 0;

  return {
    session,
    summary,
    completedRound,
    revealed,
    isSubmitting,
    isSessionBootstrapping,
    message,
    reviewContext,
    outcomeIntervalLabels,
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
    handleSkipUnloaded,
    setDailyReviewLimit,
    refreshSummary,
    startReview,
    clearCompletedRound,
    openLexicon,
    handleToggleSave,
    handlePlayLexiconAudio,
    handlePlayPrimaryAudio,
    handlePlayExampleAudio,
    primaryAudioPlaying,
    playingExampleAudioPath,
    closeLexicon: () => {
      setLexiconVisible(false);
      setLexiconSelectedSurfaceForm(null);
    },
  };
}
