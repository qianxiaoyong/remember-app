import type { ReactElement } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SearchScreen } from '../src/screens/search-screen';

export default function SearchRoute(): ReactElement {
  const params = useLocalSearchParams<{ packId?: string | string[] }>();
  const rawPackId = params.packId;
  const packId = Array.isArray(rawPackId) ? rawPackId[0] : rawPackId;
  return <SearchScreen packId={packId ?? 'remember-test-pack'} />;
}
