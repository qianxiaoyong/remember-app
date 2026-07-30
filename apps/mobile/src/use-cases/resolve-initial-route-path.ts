import { resolveAppLaunchTarget } from './resolve-app-launch-target';
import { getCurrentSessionUser } from './auth/get-current-session-user';
import { isLoginGuideDismissed } from '../data/session/session-store';
import { ApiRequestError } from '../data/api/api-client';

function resolveStudyLaunchPath(): string {
  const launch = resolveAppLaunchTarget();
  if (launch.kind === 'study') {
    return `/study?packId=${launch.packId}`;
  }
  return '/library';
}

export async function resolveInitialRoutePath(): Promise<string> {
  try {
    const sessionUser = await getCurrentSessionUser();
    if (sessionUser) {
      return resolveStudyLaunchPath();
    }
  } catch (error) {
    if (error instanceof ApiRequestError && error.code === 'NOT_MAIN_DEVICE') {
      return resolveStudyLaunchPath();
    }
  }

  const guideDismissed = await isLoginGuideDismissed();
  if (!guideDismissed) {
    return '/login-guide';
  }

  return resolveStudyLaunchPath();
}
