import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getPackBuilderRoot } from './paths.js';
import { validatePackSource } from './validate-pack-source.js';

describe('primary-1000-stories draft source', () => {
  it('passes pack-editor validation for C1-C40', () => {
    const sourceDir = join(getPackBuilderRoot(), 'source', 'primary-1000-stories');
    const meta = JSON.parse(readFileSync(join(sourceDir, 'meta.json'), 'utf8')) as {
      packId: string;
      packVersion: string;
      keyId: string;
    };

    expect(meta).toEqual({
      packId: 'primary-1000-stories',
      packVersion: '1.0.0',
      keyId: 'test-v1',
    });

    const issues = validatePackSource(sourceDir);
    expect(issues).toEqual([]);
  });
});
