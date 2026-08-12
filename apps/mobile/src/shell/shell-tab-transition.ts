export type ShellTab = 'library' | 'review' | 'record' | 'profile';

interface ShellTabRouter {
  replace: (href: '/library' | '/review' | '/record' | '/profile') => void;
}

export function navigateShellTab(
  router: ShellTabRouter,
  tab: ShellTab,
  fromTab: ShellTab = 'library',
): void {
  if (tab === fromTab) {
    return;
  }
  if (tab === 'review') {
    router.replace('/review');
    return;
  }
  if (tab === 'record') {
    router.replace('/record');
    return;
  }
  if (tab === 'profile') {
    router.replace('/profile');
    return;
  }
  router.replace('/library');
}

export function resolveShellTabFromPathname(pathname: string): ShellTab {
  if (pathname.includes('/review')) {
    return 'review';
  }
  if (pathname.includes('/record')) {
    return 'record';
  }
  if (pathname.includes('/profile')) {
    return 'profile';
  }
  return 'library';
}
