import { countDueReviewPoolItems } from '../data/repositories/learning-state-repository';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';

export function countDueReviewItems(now: Date = new Date()): number {
  return countDueReviewPoolItems(now, getDeviceTimeZone());
}
