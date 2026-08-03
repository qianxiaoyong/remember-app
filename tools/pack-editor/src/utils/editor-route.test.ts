import { describe, expect, it } from 'vitest';
import { editorRouteToHash, parseEditorRouteHash } from './editor-route.js';

describe('editor-route', () => {
  it('picker ↔ #/', () => {
    expect(parseEditorRouteHash('#/')).toEqual({ page: 'picker' });
    expect(parseEditorRouteHash('')).toEqual({ page: 'picker' });
    expect(editorRouteToHash({ page: 'picker' })).toBe('#/');
  });

  it('list ↔ #/pack/:packId', () => {
    expect(parseEditorRouteHash('#/pack/story-test-pack')).toEqual({
      page: 'list',
      packId: 'story-test-pack',
    });
    expect(editorRouteToHash({ page: 'list', packId: 'story-test-pack' })).toBe(
      '#/pack/story-test-pack',
    );
  });

  it('edit ↔ #/pack/:packId/card/:sortOrder', () => {
    expect(parseEditorRouteHash('#/pack/story-test-pack/card/1')).toEqual({
      page: 'edit',
      packId: 'story-test-pack',
      sortOrder: 1,
    });
    expect(
      editorRouteToHash({ page: 'edit', packId: 'story-test-pack', sortOrder: 1 }),
    ).toBe('#/pack/story-test-pack/card/1');
  });
});
