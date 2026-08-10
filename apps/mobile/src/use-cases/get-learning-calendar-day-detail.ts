import {
  classifyFirstRevealSubCategory,
  resolveLatestReviewOutcomeSubCategory,
  type FirstRevealSubCategory,
} from '@remember/domain';
import { parseActivityPayload, LearningActivityEventType } from '@remember/contracts';
import {
  listEventsByLocalDate,
  type LearningActivityEventRow,
} from '../data/repositories/learning-activity-event-repository';

export interface CalendarDayItem {
  eventId: string;
  packId: string;
  knowledgeId: string | null;
  displayLabel: string | null;
  occurredAt: string;
  subCategory?: FirstRevealSubCategory;
  reviewOutcome?: 'remembered' | 'not_familiar';
}

export interface CalendarDayDetail {
  localDate: string;
  firstContact: {
    pending: CalendarDayItem[];
    joinedReview: CalendarDayItem[];
    skipped: CalendarDayItem[];
    counts: { pending: number; joinedReview: number; skipped: number; total: number };
  };
  review: {
    remembered: CalendarDayItem[];
    notFamiliar: CalendarDayItem[];
    counts: { remembered: number; notFamiliar: number; total: number };
  };
  story: {
    completed: CalendarDayItem[];
    counts: { completed: number };
  };
}

function toDayItem(
  row: LearningActivityEventRow,
  extra?: Partial<CalendarDayItem>,
): CalendarDayItem {
  return {
    eventId: row.eventId,
    packId: row.packId,
    knowledgeId: row.knowledgeId,
    displayLabel: row.displayLabel,
    occurredAt: row.occurredAt,
    ...extra,
  };
}

function classifyFirstRevealOnDate(row: LearningActivityEventRow): FirstRevealSubCategory {
  const sameDayEvents = listEventsByLocalDate(row.localDate).filter(
    (event) => event.packId === row.packId && event.knowledgeId === row.knowledgeId,
  );
  return classifyFirstRevealSubCategory(sameDayEvents);
}

function buildFirstContactSection(localDate: string): CalendarDayDetail['firstContact'] {
  const firstReveals = listEventsByLocalDate(localDate).filter(
    (event) => event.eventType === LearningActivityEventType.VOCABULARY_FIRST_REVEAL,
  );

  const pending: CalendarDayItem[] = [];
  const joinedReview: CalendarDayItem[] = [];
  const skipped: CalendarDayItem[] = [];

  for (const row of firstReveals) {
    const subCategory = classifyFirstRevealOnDate(row);
    const item = toDayItem(row, { subCategory });
    if (subCategory === 'joined_review') {
      joinedReview.push(item);
    } else if (subCategory === 'skipped') {
      skipped.push(item);
    } else {
      pending.push(item);
    }
  }

  return {
    pending,
    joinedReview,
    skipped,
    counts: {
      pending: pending.length,
      joinedReview: joinedReview.length,
      skipped: skipped.length,
      total: firstReveals.length,
    },
  };
}

function buildReviewSection(localDate: string): CalendarDayDetail['review'] {
  const dayEvents = listEventsByLocalDate(localDate);
  const reviewEvents = dayEvents.filter(
    (event) => event.eventType === LearningActivityEventType.REVIEW_OUTCOME,
  );

  const latestEventByWord = new Map<string, LearningActivityEventRow>();

  for (const row of reviewEvents) {
    if (!row.knowledgeId) {
      continue;
    }
    const key = `${row.packId}:${row.knowledgeId}`;
    const existing = latestEventByWord.get(key);
    if (!existing || row.occurredAt > existing.occurredAt) {
      latestEventByWord.set(key, row);
    }
  }

  const remembered: CalendarDayItem[] = [];
  const notFamiliar: CalendarDayItem[] = [];

  for (const row of latestEventByWord.values()) {
    const sameWordEvents = dayEvents
      .filter(
        (event) => event.packId === row.packId && event.knowledgeId === row.knowledgeId,
      )
      .map((event) => {
        if (event.eventType !== LearningActivityEventType.REVIEW_OUTCOME) {
          return {
            eventType: event.eventType,
            occurredAt: event.occurredAt,
          };
        }
        const payload = parseActivityPayload(
          LearningActivityEventType.REVIEW_OUTCOME,
          event.payload,
        );
        return {
          eventType: event.eventType,
          occurredAt: event.occurredAt,
          outcome: payload.outcome,
        };
      });

    const latestOutcome = resolveLatestReviewOutcomeSubCategory(sameWordEvents);
    if (!latestOutcome) {
      continue;
    }

    const item = toDayItem(row, { reviewOutcome: latestOutcome });
    if (latestOutcome === 'remembered') {
      remembered.push(item);
    } else {
      notFamiliar.push(item);
    }
  }

  return {
    remembered,
    notFamiliar,
    counts: {
      remembered: remembered.length,
      notFamiliar: notFamiliar.length,
      total: remembered.length + notFamiliar.length,
    },
  };
}

function buildStorySection(localDate: string): CalendarDayDetail['story'] {
  const storyEvents = listEventsByLocalDate(localDate).filter(
    (event) => event.eventType === LearningActivityEventType.STORY_COMPLETED,
  );

  return {
    completed: storyEvents.map((row) => toDayItem(row)),
    counts: { completed: storyEvents.length },
  };
}

export function getLearningCalendarDayDetail(localDate: string): CalendarDayDetail {
  return {
    localDate,
    firstContact: buildFirstContactSection(localDate),
    review: buildReviewSection(localDate),
    story: buildStorySection(localDate),
  };
}
