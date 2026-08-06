interface ShellTabRouter {
  replace: (href: '/library' | '/market') => void;
}

export type ShellTabTransition = 'slide_from_left' | 'slide_from_right';

/** Tab 切换滑动时长（毫秒）；短于默认 Stack 动画以减轻卡顿感。 */
export const SHELL_TAB_ANIMATION_DURATION_MS = 180;

let pendingTransition: ShellTabTransition = 'slide_from_right';

export function prepareShellTabTransition(nextTab: 'library' | 'market'): void {
  pendingTransition = nextTab === 'market' ? 'slide_from_right' : 'slide_from_left';
}

export function consumeShellTabTransition(): ShellTabTransition {
  return pendingTransition;
}

export function navigateShellTab(router: ShellTabRouter, tab: 'library' | 'market'): void {
  prepareShellTabTransition(tab);
  router.replace(tab === 'market' ? '/market' : '/library');
}

export function resetShellTabTransitionForTests(): void {
  pendingTransition = 'slide_from_right';
}
