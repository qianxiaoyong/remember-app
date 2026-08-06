import { useCallback, useEffect, useMemo, useState } from 'react';
import { confirmReviewOutcome } from '../use-cases/confirm-review-outcome';
import { getReviewTabSummary } from '../use-cases/get-review-tab-summary';
import { resolveReviewCardContext } from '../use-cases/resolve-review-card-context';
import { resumeOrStartReviewSession } from '../use-cases/resume-or-start-review-session';
import type { ActiveStudySession } from '../use-cases/study-session-types';
import { setUserPreference, PREFERENCE_DAILY_REVIEW_LIMIT } from '../data/repositories/user-preferences-repository';

export function useReviewFlow() {
  const [session, setSession] = useState<ActiveStudySession | null>(null);
  const [summary, setSummary] = useState(getReviewTabSummary());
  const [revealed, setRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refreshSummary = useCallback(() => {
    setSummary(getReviewTabSummary());
  }, []);

  const startReview = useCallback(() => {
    setMessage(null);
    setRevealed(false);
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

  const handleOutcome = useCallback(
    (outcome: 'passed' | 'failed') => {
      if (!session?.sessionId || !currentKnowledgeId) {
        return;
      }
      setIsSubmitting(true);
      setMessage(null);
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
      setUserPreference(PREFERENCE_DAILY_REVIEW_LIMIT, String(clamped), new Date().toISOString());
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
  };
}
