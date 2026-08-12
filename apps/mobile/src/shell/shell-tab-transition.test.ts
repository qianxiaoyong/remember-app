import { describe, expect, it, vi } from 'vitest';
import { navigateShellTab, resolveShellTabFromPathname } from './shell-tab-transition';

describe('resolveShellTabFromPathname', () => {
  it('maps review paths', () => {
    expect(resolveShellTabFromPathname('/review')).toBe('review');
    expect(resolveShellTabFromPathname('/review?inspect=1')).toBe('review');
  });

  it('maps record paths', () => {
    expect(resolveShellTabFromPathname('/record')).toBe('record');
  });

  it('maps profile paths', () => {
    expect(resolveShellTabFromPathname('/profile')).toBe('profile');
  });

  it('defaults to library', () => {
    expect(resolveShellTabFromPathname('/library')).toBe('library');
  });

  it('does not treat market stack routes as shell tabs', () => {
    expect(resolveShellTabFromPathname('/market')).toBe('library');
  });
});

describe('navigateShellTab', () => {
  it('navigates to the selected tab', () => {
    const replace = vi.fn();
    navigateShellTab({ replace }, 'record', 'library');
    expect(replace).toHaveBeenCalledWith('/record');
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
