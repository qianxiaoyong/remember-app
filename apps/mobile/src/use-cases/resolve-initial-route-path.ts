import { resolveAppLaunchTarget } from './resolve-app-launch-target';

function resolveStudyLaunchPath(): string {
  const launch = resolveAppLaunchTarget();
  if (launch.kind === 'study') {
    return `/study?packId=${launch.packId}`;
  }
  return '/library';
}

export function resolveInitialRoutePath(): string {
  return resolveStudyLaunchPath();
}
