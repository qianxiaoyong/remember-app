import type { ReactElement } from 'react';
import { Redirect } from 'expo-router';
import { resolveInitialRoutePath } from '../src/use-cases/resolve-initial-route-path';

export default function Index(): ReactElement {
  return <Redirect href={resolveInitialRoutePath()} />;
}
