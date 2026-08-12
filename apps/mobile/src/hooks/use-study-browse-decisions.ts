import { useCallback } from 'react';
import type { PackCardSummary } from '../data/repositories/pack-card-repository';
import { getPackBrowseCompleteSummary } from '../use-cases/get-pack-browse-complete-summary';
import type { PackBrowseCompleteSummary } from '../use-cases/get-pack-browse-complete-summary';
import { joinReviewPool } from '../use-cases/join-review-pool';
import { skipPackCard } from '../use-cases/skip-pack-card';
import { updateReviewPoolFromPack } from '../use-cases/update-review-pool-from-pack';
import { upsertPackBrowseBookmarkAfterDecision } from '../use-cases/upsert-pack-browse-bookmark-after-decision';
import type { InspectQueueAdvanceResult } from './use-inspect-queue';
import { markLearningCalendarNeedsRefresh } from '../shell/learning-calendar-refresh-signal';
import type { getPackCardDetailUseCase } from '../use-cases/get-pack-card-detail';

type CardDetail = ReturnType<typeof getPackCardDetailUseCase>;

interface UseStudyBrowseDecisionsParams {
  packId: string;
  isBrowseMode: boolean;
  browseCards: PackCardSummary[];
  currentIndex: number;
  currentKnowledgeId: string | null;
  headword: string | null;
  cardDetail: CardDetail;
  inspectMode: boolean;
  activitySource: 'calendar_inspect' | undefined;
  inspectActivityLocalDate: string | undefined;
  onInspectActionComplete?: () => InspectQueueAdvanceResult | undefined;
  setCurrentIndex: (value: number | ((index: number) => number)) => void;
  setRevealed: (value: boolean) => void;
  setBrowseCompleteVisible: (value: boolean) => void;
  setBrowseCompleteSummary: (value: PackBrowseCompleteSummary | null) => void;
  setInReviewPool: (value: boolean) => void;
  setUpdateReviewVisible: (value: boolean) => void;
  setIsSubmitting: (value: boolean) => void;
  setMessage: (value: string | null) => void;
}

function buildBrowseDecisionPayload(input: {
  browseCards: PackCardSummary[];
  currentIndex: number;
  cardDetail: CardDetail;
  headword: string | null;
  activitySource: 'calendar_inspect' | undefined;
  inspectActivityLocalDate: string | undefined;
}) {
  const currentCard = input.browseCards[input.currentIndex];
  return {
    ...(input.headword ? { displayLabel: input.headword } : {}),
    ...(currentCard?.sortOrder !== undefined
      ? { sortOrder: currentCard.sortOrder }
      : input.cardDetail?.sortOrder !== undefined
        ? { sortOrder: input.cardDetail.sortOrder }
        : {}),
    ...(input.activitySource ? { activitySource: input.activitySource } : {}),
    ...(input.inspectActivityLocalDate
      ? { activityLocalDate: input.inspectActivityLocalDate }
      : {}),
  };
}

export function useStudyBrowseDecisions({
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
  onInspectActionComplete,
  setCurrentIndex,
  setRevealed,
  setBrowseCompleteVisible,
  setBrowseCompleteSummary,
  setInReviewPool,
  setUpdateReviewVisible,
  setIsSubmitting,
  setMessage,
}: UseStudyBrowseDecisionsParams) {
  const finishInspectAction = useCallback(() => {
    if (!inspectMode) {
      return;
    }
    markLearningCalendarNeedsRefresh();
    onInspectActionComplete?.();
  }, [inspectMode, onInspectActionComplete]);

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
  }, [
    browseCards,
    currentIndex,
    isBrowseMode,
    packId,
    setBrowseCompleteSummary,
    setBrowseCompleteVisible,
    setCurrentIndex,
    setRevealed,
  ]);

  const handleJoinReview = useCallback(() => {
    if (!currentKnowledgeId) {
      return;
    }
    setMessage(null);
    const joinPayload = {
      knowledgeId: currentKnowledgeId,
      catalogPackId: packId,
      ...buildBrowseDecisionPayload({
        browseCards,
        currentIndex,
        cardDetail,
        headword,
        activitySource,
        inspectActivityLocalDate,
      }),
    };

    if (inspectMode) {
      setIsSubmitting(true);
      setMessage(null);
      try {
        joinReviewPool(joinPayload);
        setRevealed(false);
        finishInspectAction();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '加入复习失败');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const result = joinReviewPool(joinPayload);
      if (result.status === 'created') {
        setInReviewPool(true);
      }
      advanceBrowse();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '加入复习失败');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activitySource,
    advanceBrowse,
    browseCards,
    cardDetail,
    currentIndex,
    currentKnowledgeId,
    finishInspectAction,
    headword,
    inspectActivityLocalDate,
    inspectMode,
    packId,
    setInReviewPool,
    setIsSubmitting,
    setMessage,
    setRevealed,
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
        ...buildBrowseDecisionPayload({
          browseCards,
          currentIndex,
          cardDetail,
          headword,
          activitySource,
          inspectActivityLocalDate,
        }),
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
    cardDetail,
    currentIndex,
    currentKnowledgeId,
    finishInspectAction,
    headword,
    inspectActivityLocalDate,
    inspectMode,
    packId,
    setInReviewPool,
    setIsSubmitting,
    setMessage,
    setRevealed,
    setUpdateReviewVisible,
  ]);

  const handleSkip = useCallback(() => {
    if (!currentKnowledgeId) {
      return;
    }
    skipPackCard({
      packId,
      knowledgeId: currentKnowledgeId,
      ...buildBrowseDecisionPayload({
        browseCards,
        currentIndex,
        cardDetail,
        headword,
        activitySource,
        inspectActivityLocalDate,
      }),
    });
    if (!inspectMode) {
      advanceBrowse();
    } else {
      setRevealed(false);
      finishInspectAction();
    }
  }, [
    activitySource,
    advanceBrowse,
    browseCards,
    cardDetail,
    currentIndex,
    currentKnowledgeId,
    finishInspectAction,
    headword,
    inspectActivityLocalDate,
    inspectMode,
    packId,
    setRevealed,
  ]);

  return {
    handleJoinReview,
    handleConfirmUpdateReview,
    handleSkip,
  };
}
