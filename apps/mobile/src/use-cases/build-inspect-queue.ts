import type { CalendarDayItem } from './get-learning-calendar-day-detail';
import { getLearningCalendarDayDetail } from './get-learning-calendar-day-detail';

export type InspectCategory = 'first_contact' | 'review' | 'story';

export type InspectSubCategory =
  | 'pending'
  | 'joined_review'
  | 'skipped'
  | 'remembered'
  | 'not_familiar'
  | 'completed';

export interface InspectQueueItem {
  packId: string;
  knowledgeId: string;
  displayLabel: string;
  mode: 'study' | 'review';
}

function mapStudyItems(items: CalendarDayItem[]): InspectQueueItem[] {
  return items
    .filter((item) => item.knowledgeId)
    .map((item) => ({
      packId: item.packId,
      knowledgeId: item.knowledgeId as string,
      displayLabel: item.displayLabel ?? item.knowledgeId as string,
      mode: 'study' as const,
    }));
}

function mapReviewItems(items: CalendarDayItem[]): InspectQueueItem[] {
  return items
    .filter((item) => item.knowledgeId)
    .map((item) => ({
      packId: item.packId,
      knowledgeId: item.knowledgeId as string,
      displayLabel: item.displayLabel ?? item.knowledgeId as string,
      mode: 'review' as const,
    }));
}

export function buildInspectQueue(input: {
  localDate: string;
  category: InspectCategory;
  subCategory: InspectSubCategory;
}): InspectQueueItem[] {
  const detail = getLearningCalendarDayDetail(input.localDate);

  if (input.category === 'first_contact') {
    if (input.subCategory === 'pending') {
      return mapStudyItems(detail.firstContact.pending);
    }
    if (input.subCategory === 'joined_review') {
      return mapStudyItems(detail.firstContact.joinedReview);
    }
    if (input.subCategory === 'skipped') {
      return mapStudyItems(detail.firstContact.skipped);
    }
    return [];
  }

  if (input.category === 'review') {
    if (input.subCategory === 'remembered') {
      return mapReviewItems(detail.review.remembered);
    }
    if (input.subCategory === 'not_familiar') {
      return mapReviewItems(detail.review.notFamiliar);
    }
    return [];
  }

  if (input.category === 'story' && input.subCategory === 'completed') {
    return mapStudyItems(detail.story.completed);
  }

  return [];
}

export function getInspectSubCategoryLabel(subCategory: InspectSubCategory): string {
  const labels: Record<InspectSubCategory, string> = {
    pending: '待处理',
    joined_review: '已加入复习',
    skipped: '暂不',
    remembered: '记住了',
    not_familiar: '还不熟',
    completed: '已听完',
  };
  return labels[subCategory];
}
