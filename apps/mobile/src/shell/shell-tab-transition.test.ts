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
    const navigate = vi.fn();
    navigateShellTab({ navigate }, 'market', 'library');
    expect(navigate).toHaveBeenCalledWith('/market');
  });

  it('does not navigate when already on the tab', () => {
    const navigate = vi.fn();
    navigateShellTab({ navigate }, 'library', 'library');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('uses navigate instead of replace semantics', () => {
    const navigate = vi.fn();
    navigateShellTab({ navigate }, 'review', 'library');
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/review');
  });
});
