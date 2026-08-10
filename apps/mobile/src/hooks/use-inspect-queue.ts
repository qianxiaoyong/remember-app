import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildInspectQueue,
  getInspectSubCategoryLabel,
  type InspectCategory,
  type InspectSubCategory,
} from '../use-cases/build-inspect-queue';

export interface InspectQueueConfig {
  localDate: string;
  category: InspectCategory;
  subCategory: InspectSubCategory;
  initialIndex: number;
}

export function useInspectQueue(config: InspectQueueConfig | null) {
  const queue = useMemo(() => {
    if (!config) {
      return [];
    }
    return buildInspectQueue({
      localDate: config.localDate,
      category: config.category,
      subCategory: config.subCategory,
    });
  }, [config]);

  const [index, setIndex] = useState(config?.initialIndex ?? 0);

  useEffect(() => {
    setIndex(config?.initialIndex ?? 0);
  }, [config?.initialIndex, config?.localDate, config?.category, config?.subCategory]);

  const currentItem = queue[index] ?? null;
  const subCategoryLabel = config ? getInspectSubCategoryLabel(config.subCategory) : '';

  const navigateToIndex = useCallback(
    (nextIndex: number) => {
      if (!config || !queue[nextIndex]) {
        return;
      }
      // 队列内切词仅更新 state，不 router.replace，避免整页缩放动画
      setIndex(nextIndex);
    },
    [config, queue],
  );

  return {
    queue,
    index,
    currentItem,
    subCategoryLabel,
    canPrevious: index > 0,
    canNext: index < queue.length - 1,
    goPrevious: () => navigateToIndex(index - 1),
    goNext: () => navigateToIndex(index + 1),
  };
}
