import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getPackBuilderRoot } from './paths.js';
import { validatePackSource } from './validate-pack-source.js';

const sourceDir = join(getPackBuilderRoot(), 'source', 'primary-1000-stories');
const hasPrimary1000StoriesSource = existsSync(join(sourceDir, 'meta.json'));

describe.skipIf(!hasPrimary1000StoriesSource)('primary-1000-stories draft source', () => {
  it('passes pack-editor validation for C1-C40', () => {
    const meta = JSON.parse(readFileSync(join(sourceDir, 'meta.json'), 'utf8')) as {
      packId: string;
      packVersion: string;
      keyId: string;
    };

    expect(meta).toMatchObject({
      packId: 'primary-1000-stories',
      keyId: 'test-v1',
    });
    expect(meta.packVersion).toMatch(/^\d+\.\d+\.\d+$/);

    const issues = validatePackSource(sourceDir);
    expect(issues).toEqual([]);
  });
});
