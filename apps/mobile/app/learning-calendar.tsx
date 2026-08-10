import type { ReactElement } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { LearningCalendarScreen } from '../src/screens/learning-calendar-screen';
import { formatLocalReviewDate } from '@remember/domain';
import { getDeviceTimeZone } from '../src/lib/get-device-time-zone';

export default function LearningCalendarRoute(): ReactElement {
  const params = useLocalSearchParams<{ localDate?: string | string[] }>();
  const raw = params.localDate;
  const localDate = Array.isArray(raw) ? raw[0] : raw;
  const today = formatLocalReviewDate(new Date(), getDeviceTimeZone());

  return <LearningCalendarScreen initialLocalDate={localDate ?? today} />;
}
