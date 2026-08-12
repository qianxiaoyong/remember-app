import { useCallback, useEffect, useState } from 'react';
import { getReviewTabSummary } from '../use-cases/get-review-tab-summary';
import { subscribeReviewPoolChanged } from '../shell/review-pool-changed-signal';

export function useReviewTabBadge(): number {
  const [reviewableDueTotal, setReviewableDueTotal] = useState(
    () => getReviewTabSummary().reviewableDueTotal,
  );

  const refresh = useCallback((reason: 'refresh' | 'join_due') => {
    if (reason === 'join_due') {
      setReviewableDueTotal((total) => total + 1);
      return;
    }
    setReviewableDueTotal(getReviewTabSummary().reviewableDueTotal);
  }, []);

  useEffect(() => {
    return subscribeReviewPoolChanged(refresh);
  }, [refresh]);

  return reviewableDueTotal;
}
