interface ShellTabRouter {
  replace: (href: '/library' | '/market') => void;
}

export type ShellTabTransition = 'slide_from_left' | 'slide_from_right';

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
