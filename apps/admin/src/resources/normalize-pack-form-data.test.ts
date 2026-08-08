import { describe, expect, it } from 'vitest';
import { normalizeIntroMediaForSubmit } from './normalize-pack-form-data.js';

describe('normalizeIntroMediaForSubmit', () => {
  it('drops empty url rows and assigns sortOrder from list order', () => {
    expect(
      normalizeIntroMediaForSubmit([
        { type: 'image', url: 'https://cdn.example.com/a.jpg', sortOrder: 0 },
        { type: 'image', url: '', sortOrder: null },
        { type: 'image', url: 'https://cdn.example.com/b.jpg', sortOrder: null },
      ]),
    ).toEqual([
      { type: 'image', url: 'https://cdn.example.com/a.jpg', sortOrder: 0 },
      { type: 'image', url: 'https://cdn.example.com/b.jpg', sortOrder: 1 },
    ]);
  });

  it('returns empty array when all rows are blank', () => {
    expect(normalizeIntroMediaForSubmit([{ type: 'image', url: '', sortOrder: null }])).toEqual([]);
  });
});
