interface ShellTabRouter {
  replace: (href: '/library' | '/review' | '/market') => void;
}

export type ShellTabTransition = 'slide_from_left' | 'slide_from_right';

/** Tab 切换滑动时长（毫秒）；短于默认 Stack 动画以减轻卡顿感。 */
export const SHELL_TAB_ANIMATION_DURATION_MS = 180;

const TAB_ORDER: Record<'library' | 'review' | 'market', number> = {
  library: 0,
  review: 1,
  market: 2,
};

let pendingTransition: ShellTabTransition = 'slide_from_right';

export function prepareShellTabTransition(nextTab: 'library' | 'review' | 'market'): void {
  pendingTransition = nextTab === 'library' ? 'slide_from_left' : 'slide_from_right';
}

export function prepareShellTabTransitionFromTo(
  fromTab: 'library' | 'review' | 'market',
  toTab: 'library' | 'review' | 'market',
): void {
  pendingTransition = TAB_ORDER[toTab] >= TAB_ORDER[fromTab] ? 'slide_from_right' : 'slide_from_left';
}

export function consumeShellTabTransition(): ShellTabTransition {
  return pendingTransition;
}

export function navigateShellTab(
  router: ShellTabRouter,
  tab: 'library' | 'review' | 'market',
  fromTab: 'library' | 'review' | 'market' = 'library',
): void {
  prepareShellTabTransitionFromTo(fromTab, tab);
  if (tab === 'market') {
    router.replace('/market');
    return;
  }
  if (tab === 'review') {
    router.replace('/review');
    return;
  }
  router.replace('/library');
}

export function resetShellTabTransitionForTests(): void {
  pendingTransition = 'slide_from_right';
}

export function resolveShellTabFromPathname(pathname: string): 'library' | 'review' | 'market' {
  if (pathname.includes('/market')) {
    return 'market';
  }
  if (pathname.includes('/review')) {
    return 'review';
  }
  return 'library';
}
