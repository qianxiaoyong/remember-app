import type { ReactElement } from 'react';
import { MarketSearchScreen } from '../src/screens/market-search-screen';
import { searchScreenOptions } from '../src/theme/modal-screen-options';

export const options = searchScreenOptions;

export default function MarketSearchRoute(): ReactElement {
  return <MarketSearchScreen />;
}
