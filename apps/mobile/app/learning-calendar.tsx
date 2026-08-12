import type { ReactElement } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LearningCalendarRoute(): ReactElement {
  const params = useLocalSearchParams<{ localDate?: string | string[] }>();
  const raw = params.localDate;
  const localDate = Array.isArray(raw) ? raw[0] : raw;
  const href = localDate ? `/record?localDate=${localDate}` : '/record';

  return <Redirect href={href} />;
}
