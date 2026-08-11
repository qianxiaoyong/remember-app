import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

export type InspectQueueAdvanceResult = 'advanced' | 'completed';

function buildQueueForConfig(config: InspectQueueConfig) {
  return buildInspectQueue({
    localDate: config.localDate,
    category: config.category,
    subCategory: config.subCategory,
  });
}

export function useInspectQueue(config: InspectQueueConfig | null) {
  const [queueVersion, setQueueVersion] = useState(0);
  const [index, setIndex] = useState(config?.initialIndex ?? 0);
  const indexRef = useRef(index);
  indexRef.current = index;

  const queue = useMemo(() => {
    if (!config) {
      return [];
    }
    return buildQueueForConfig(config);
  }, [config, queueVersion]);

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
      setIndex(nextIndex);
    },
    [config, queue],
  );

  /** 操作完成后重建队列：当前词移出子类则同 index 即为下一词；否则视为本类已查看完 */
  const advanceAfterAction = useCallback((): InspectQueueAdvanceResult => {
    if (!config) {
      return 'completed';
    }

    const current = indexRef.current;
    const newQueue = buildQueueForConfig(config);
    setQueueVersion((version) => version + 1);

    if (newQueue.length === 0) {
      setIndex(0);
      return 'completed';
    }

    if (current < newQueue.length) {
      setIndex(current);
      return 'advanced';
    }

    setIndex(Math.max(0, newQueue.length - 1));
    return 'completed';
  }, [config]);

  return {
    queue,
    index,
    currentItem,
    subCategoryLabel,
    canPrevious: index > 0,
    canNext: index < queue.length - 1,
    goPrevious: () => {
      navigateToIndex(index - 1);
    },
    goNext: () => {
      navigateToIndex(index + 1);
    },
    advanceAfterAction,
  };
}
