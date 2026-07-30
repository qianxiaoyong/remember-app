import { readSessionToken } from '../data/session/session-store';
import { fetchMyPackAccess } from '../data/api/pack-access-api';
import { ApiNetworkError, ApiRequestError } from '../data/api/api-client';

export type PackAccessResolution =
  | { status: 'granted' }
  | { status: 'denied' }
  | { status: 'unknown'; reason: 'network' | 'auth' };

export type PackDetailActionKind =
  | 'purchase'
  | 'download'
  | 'install'
  | 'start_study'
  | 'continue_study'
  | 'retry_access';

export interface ResolvedPackDetailAction {
  hasPackAccess: boolean;
  packAccessUnavailable: boolean;
  actionKind: PackDetailActionKind;
  actionLabel: string;
}

export async function resolvePackAccess(packId: string): Promise<PackAccessResolution> {
  const token = await readSessionToken();
  if (!token) {
    return { status: 'denied' };
  }

  try {
    const items = await fetchMyPackAccess(token);
    return items.some((item) => item.packId === packId)
      ? { status: 'granted' }
      : { status: 'denied' };
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return { status: 'unknown', reason: 'auth' };
    }
    if (error instanceof ApiNetworkError || error instanceof ApiRequestError) {
      return { status: 'unknown', reason: 'network' };
    }
    throw error;
  }
}

export function resolveDetailAction(input: {
  isInstalled: boolean;
  packAccess: PackAccessResolution;
  isBundledTestPack: boolean;
}): ResolvedPackDetailAction {
  if (input.isInstalled) {
    return {
      hasPackAccess: input.packAccess.status === 'granted',
      packAccessUnavailable: input.packAccess.status === 'unknown',
      actionKind: 'start_study',
      actionLabel: '开始学习',
    };
  }

  if (input.packAccess.status === 'unknown') {
    return {
      hasPackAccess: false,
      packAccessUnavailable: true,
      actionKind: 'retry_access',
      actionLabel: '重试',
    };
  }

  const hasPackAccess = input.packAccess.status === 'granted';
  if (hasPackAccess || input.isBundledTestPack) {
    return {
      hasPackAccess: hasPackAccess || input.isBundledTestPack,
      packAccessUnavailable: false,
      actionKind: 'install',
      actionLabel: '安装',
    };
  }

  return {
    hasPackAccess: false,
    packAccessUnavailable: false,
    actionKind: 'purchase',
    actionLabel: '立即购买',
  };
}
