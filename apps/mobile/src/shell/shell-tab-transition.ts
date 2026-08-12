interface ShellTabRouter {
  replace: (href: '/library' | '/review' | '/market') => void;
}

export function navigateShellTab(
  router: ShellTabRouter,
  tab: 'library' | 'review' | 'market',
  fromTab: 'library' | 'review' | 'market' = 'library',
): void {
  if (tab === fromTab) {
    return;
  }
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

export function resolveShellTabFromPathname(pathname: string): 'library' | 'review' | 'market' {
  if (pathname.includes('/market')) {
    return 'market';
  }
  if (pathname.includes('/review')) {
    return 'review';
  }
  return 'library';
}
