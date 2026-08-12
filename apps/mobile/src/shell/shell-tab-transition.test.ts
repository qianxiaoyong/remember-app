import { describe, expect, it, vi } from 'vitest';
import { navigateShellTab, resolveShellTabFromPathname } from './shell-tab-transition';

describe('resolveShellTabFromPathname', () => {
  it('maps market paths', () => {
    expect(resolveShellTabFromPathname('/market')).toBe('market');
  });

  it('maps review paths', () => {
    expect(resolveShellTabFromPathname('/review')).toBe('review');
    expect(resolveShellTabFromPathname('/review?inspect=1')).toBe('review');
  });

  it('defaults to library', () => {
    expect(resolveShellTabFromPathname('/library')).toBe('library');
  });
});

describe('navigateShellTab', () => {
  it('navigates to the selected tab', () => {
    const replace = vi.fn();
    navigateShellTab({ replace }, 'market', 'library');
    expect(replace).toHaveBeenCalledWith('/market');
  });

  it('does not navigate when already on the tab', () => {
    const replace = vi.fn();
    navigateShellTab({ replace }, 'library', 'library');
    expect(replace).not.toHaveBeenCalled();
  });

  it('uses replace instead of pushing tab history', () => {
    const replace = vi.fn();
    navigateShellTab({ replace }, 'review', 'library');
    expect(replace).toHaveBeenCalledExactlyOnceWith('/review');
  });
});
