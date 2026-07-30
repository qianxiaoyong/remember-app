import type { ReactElement } from 'react';
import { PackPreviewScreen } from '../src/screens/pack-preview-screen';
import { useLocalSearchParams } from 'expo-router';

export default function PackPreviewRoute(): ReactElement {
  const params = useLocalSearchParams<{ packId?: string; headword?: string }>();
  const packId = typeof params.packId === 'string' ? params.packId : '';
  const headword = typeof params.headword === 'string' ? params.headword : '';

  return <PackPreviewScreen headword={headword} packId={packId} />;
}
