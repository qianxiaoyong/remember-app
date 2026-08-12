import type { ReactElement } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { LearningCalendarScreen } from '../../src/screens/learning-calendar-screen';
import { useShellTabHardwareBackHandler } from '../../src/hooks/use-shell-tab-hardware-back-handler';
import { formatLocalReviewDate } from '@remember/domain';
import { getDeviceTimeZone } from '../../src/lib/get-device-time-zone';

export default function RecordRoute(): ReactElement {
  useShellTabHardwareBackHandler();
  const params = useLocalSearchParams<{ localDate?: string | string[] }>();
  const raw = params.localDate;
  const localDate = Array.isArray(raw) ? raw[0] : raw;
  const today = formatLocalReviewDate(new Date(), getDeviceTimeZone());

  return <LearningCalendarScreen initialLocalDate={localDate ?? today} variant="tab" />;
}
