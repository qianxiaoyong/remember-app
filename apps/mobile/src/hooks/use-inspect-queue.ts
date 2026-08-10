import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
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
  const router = useRouter();
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
  const currentItem = queue[index] ?? null;
  const subCategoryLabel = config ? getInspectSubCategoryLabel(config.subCategory) : '';

  const navigateToIndex = useCallback(
    (nextIndex: number) => {
      if (!config || !queue[nextIndex]) {
        return;
      }
      const item = queue[nextIndex];
      setIndex(nextIndex);
      const base = `/study?packId=${item.packId}&knowledgeId=${item.knowledgeId}&inspect=1&localDate=${config.localDate}&category=${config.category}&subCategory=${config.subCategory}&index=${String(nextIndex)}`;
      if (item.mode === 'review') {
        router.replace(
          `/review?inspect=1&localDate=${config.localDate}&category=${config.category}&subCategory=${config.subCategory}&index=${String(nextIndex)}&knowledgeId=${item.knowledgeId}`,
        );
        return;
      }
      router.replace(base);
    },
    [config, queue, router],
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
