interface ShellTabRouter {
  navigate: (href: '/library' | '/review' | '/market') => void;
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
    router.navigate('/market');
    return;
  }
  if (tab === 'review') {
    router.navigate('/review');
    return;
  }
  router.navigate('/library');
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
