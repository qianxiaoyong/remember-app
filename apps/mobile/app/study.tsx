import type { ReactElement } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StudyScreen } from '../src/screens/study-screen';

export default function StudyRoute(): ReactElement {
  const params = useLocalSearchParams<{ packId?: string | string[] }>();
  const rawPackId = params.packId;
  const packId = Array.isArray(rawPackId) ? rawPackId[0] : rawPackId;
  return <StudyScreen packId={packId ?? 'remember-test-pack'} />;
}
