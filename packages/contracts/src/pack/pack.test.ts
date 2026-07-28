import { describe, expect, it } from 'vitest';
import { buildKnowledgeId, slugFromHeadword } from './knowledge-id.js';
import { canonicalJson } from './canonical-json.js';
import { normalizeSurfaceForm, tokenizeEnglishSentence } from './normalize.js';
import { packManifestSchema } from './manifest.js';
import { vocabularyContentSchema } from './vocabulary-content.js';
import { isAllowedPackPath } from './paths.js';

describe('slugFromHeadword', () => {
  it('规范化单词与短语 slug', () => {
    expect(slugFromHeadword('Picture')).toBe('picture');
    expect(slugFromHeadword('  Take a Picture ')).toBe('take-a-picture');
  });

  it('buildKnowledgeId 与 slug 一致', () => {
    expect(buildKnowledgeId('remember-test-pack', 'picture', 'word')).toBe(
      'remember-test-pack:en:word:picture',
    );
    expect(buildKnowledgeId('remember-test-pack', 'take a picture', 'phrase')).toBe(
      'remember-test-pack:en:phrase:take-a-picture',
    );
  });
});

describe('normalizeSurfaceForm', () => {
  it('小写并去首尾标点', () => {
    expect(normalizeSurfaceForm('Picture.')).toBe('picture');
    expect(normalizeSurfaceForm("don't")).toBe("don't");
  });

  it('tokenizeEnglishSentence 提取 token', () => {
    expect(tokenizeEnglishSentence('She drew a picture.')).toEqual(['She', 'drew', 'a', 'picture']);
  });
});

describe('canonicalJson', () => {
  it('递归键排序', () => {
    const json = canonicalJson({ b: 2, a: { d: 1, c: 3 } });
    expect(json).toBe('{"a":{"c":3,"d":1},"b":2}');
  });
});

describe('paths', () => {
  it('允许根文件与 assets', () => {
    expect(isAllowedPackPath('pack.sqlite')).toBe(true);
    expect(isAllowedPackPath('assets/audio/a.mp3')).toBe(true);
    expect(isAllowedPackPath('../secret')).toBe(false);
    expect(isAllowedPackPath('/etc/passwd')).toBe(false);
  });
});

describe('packManifestSchema', () => {
  it('拒绝未知字段', () => {
    expect(() =>
      packManifestSchema.parse({
        manifestVersion: 1,
        protocolVersion: 1,
        packId: 'p',
        packVersion: '1.0.0',
        keyId: 'test-v1',
        files: [{ path: 'pack.sqlite', sha256: 'a'.repeat(64), sizeBytes: 1 }],
        signature: 'abc',
        extra: true,
      }),
    ).toThrow();
  });
});

describe('vocabularyContentSchema', () => {
  it('接受最小合法 content', () => {
    const parsed = vocabularyContentSchema.parse({
      prompt: {
        headword: 'picture',
        primaryAudio: 'assets/audio/picture.mp3',
      },
      reveal: {
        definitions: [{ text: '图片' }],
        examples: [{ en: 'She drew a picture.', zh: '她画了一幅画。' }],
      },
    });
    expect(parsed.prompt.headword).toBe('picture');
  });
});
