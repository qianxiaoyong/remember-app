import { countReviewableDueReviewPoolItems } from './count-reviewable-pool-items';
import { listDueReviewPoolItems } from '../data/repositories/learning-state-repository';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';

export function countDueReviewItems(now: Date = new Date()): number {
  const timeZone = getDeviceTimeZone();
  const dueItems = listDueReviewPoolItems(now, timeZone);
  return countReviewableDueReviewPoolItems(dueItems);
}
