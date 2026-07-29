import type { ReactElement } from 'react';
import { LibrarySearchScreen } from '../src/screens/library-search-screen';
import { searchScreenOptions } from '../src/theme/modal-screen-options';

export const options = searchScreenOptions;

export default function LibrarySearchRoute(): ReactElement {
  return <LibrarySearchScreen />;
}
