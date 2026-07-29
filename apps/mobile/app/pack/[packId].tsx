import type { ReactElement } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { PackDetailScreen } from '../../src/screens/pack-detail-screen';

export default function PackDetailRoute(): ReactElement {
  const params = useLocalSearchParams<{ packId?: string | string[] }>();
  const rawPackId = params.packId;
  const packId = Array.isArray(rawPackId) ? rawPackId[0] : rawPackId;
  if (!packId) {
    return <PackDetailScreen packId="" />;
  }
  return <PackDetailScreen packId={packId} />;
}
