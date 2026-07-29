import type { ReactElement } from 'react';
import { Redirect } from 'expo-router';
import { resolveAppLaunchTarget } from '../src/use-cases/resolve-app-launch-target';

export default function Index(): ReactElement {
  const target = resolveAppLaunchTarget();
  if (target.kind === 'study') {
    return <Redirect href={`/study?packId=${target.packId}`} />;
  }
  return <Redirect href="/library" />;
}
