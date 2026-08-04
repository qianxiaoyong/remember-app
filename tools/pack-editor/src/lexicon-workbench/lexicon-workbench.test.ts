import { describe, expect, it } from 'vitest';
import type { AdminLexiconDetail, StoryReadingContent } from '@remember/contracts';
import { scanStorySurfaces, scanVocabularyPackSurfaces } from './scan-surfaces.js';
import {
  buildImportCandidates,
  buildIncomingBySurface,
  resolveImportActions,
} from './detect-conflicts.js';
import { applyImportPlan } from './apply-import-plan.js';
import { storySidebarAdapter } from './story-sidebar-adapter.js';
import { vocabularyLexiconAdapter } from './vocabulary-lexicon-adapter.js';

const sampleLemma: AdminLexiconDetail = {
  id: '00000000-0000-4000-8000-000000000001',
  lemmaKey: 'happy',
  headword: 'happy',
  status: 'published',
  source: 'manual',
  ipa: '/ˈhæpi/',
  pos: 'adj.',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  fragments: [
    {
      id: '00000000-0000-4000-8000-000000000002',
      fragmentType: 'definition_zh',
      content: { text: '高兴的；快乐的', pos: 'adj.' },
      sortOrder: 0,
      source: 'manual',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  forms: [],
  assets: [],
  tags: [],
};

describe('scanStorySurfaces', () => {
  it('提取段落 token 与 word run', () => {
    const content: StoryReadingContent = {
      lesson: {
        code: 'C1',
        titleEn: 'T',
        titleZh: '测',
        coverImage: 'assets/images/c1.png',
        primaryAudio: 'assets/audio/c1.mp3',
      },
      story: {
        paragraphs: [
          {
            runs: [
              { kind: 'text', text: 'She is ' },
              { kind: 'word', surface: 'happy', glossZh: '高兴', tier: 'high', vocabId: 'happy' },
              { kind: 'text', text: '.' },
            ],
          },
        ],
      },
      sidebar: [],
    };

    expect(scanStorySurfaces(content).map((item) => item.surfaceForm)).toEqual([
      'happy',
      'is',
      'she',
    ]);
  });
});

describe('story import plan', () => {
  it('新词默认追加，冲突可替换', () => {
    const scanned = scanStorySurfaces({
      lesson: {
        code: 'C1',
        titleEn: 'T',
        titleZh: '测',
        coverImage: 'assets/images/c1.png',
        primaryAudio: 'assets/audio/c1.mp3',
      },
      story: {
        paragraphs: [{ runs: [{ kind: 'text', text: 'happy day' }] }],
      },
      sidebar: [
        {
          vocabId: 'happy',
          headword: 'happy',
          ipa: '/old/',
          pos: 'adj.',
          definitionZh: '旧释义',
          tier: 'high',
        },
      ],
    });

    const candidates = buildImportCandidates({
      adapter: storySidebarAdapter,
      scannedSurfaces: scanned,
      existingItems: [
        {
          vocabId: 'happy',
          headword: 'happy',
          ipa: '/old/',
          pos: 'adj.',
          definitionZh: '旧释义',
          tier: 'high',
        },
      ],
      lookups: [{ surfaceForm: 'happy', lemma: sampleLemma }],
    });

    expect(candidates.find((item) => item.surfaceForm === 'happy')?.status).toBe('conflict');

    const decisions = resolveImportActions(candidates, { happy: 'replace' });
    const nextSidebar = applyImportPlan({
      adapter: storySidebarAdapter,
      existingItems: [
        {
          vocabId: 'happy',
          headword: 'happy',
          ipa: '/old/',
          pos: 'adj.',
          definitionZh: '旧释义',
          tier: 'high',
        },
      ],
      incomingBySurface: buildIncomingBySurface(candidates),
      decisions,
    });

    expect(nextSidebar[0]?.definitionZh).toBe('高兴的；快乐的');
    expect(nextSidebar[0]?.tier).toBe('high');
  });
});

describe('vocabulary lexicon import', () => {
  it('扫描 vocabulary 包例句 token', () => {
    const surfaces = scanVocabularyPackSurfaces([
      {
        kind: 'word',
        sortOrder: 1,
        content: {
          prompt: { headword: 'draw', primaryAudio: 'assets/audio/draw.mp3' },
          reveal: {
            definitions: [{ text: '画' }],
            examples: [{ en: 'She drew a picture.', zh: '她画了一幅画。' }],
          },
        },
      },
    ]);

    expect(surfaces.map((item) => item.surfaceForm)).toEqual([
      'a',
      'draw',
      'drew',
      'picture',
      'she',
    ]);
  });

  it('新 lexicon 条目追加', () => {
    const scanned = [{ surfaceForm: 'drew', displayForm: 'drew' }];
    const candidates = buildImportCandidates({
      adapter: vocabularyLexiconAdapter,
      scannedSurfaces: scanned,
      existingItems: [],
      lookups: [
        { surfaceForm: 'drew', lemma: { ...sampleLemma, lemmaKey: 'draw', headword: 'draw' } },
      ],
    });

    expect(candidates[0]?.status).toBe('new');
    const decisions = resolveImportActions(candidates);
    const next = applyImportPlan({
      adapter: vocabularyLexiconAdapter,
      existingItems: [],
      incomingBySurface: buildIncomingBySurface(candidates),
      decisions,
    });
    expect(next).toHaveLength(1);
    expect(next[0]?.surfaceForm).toBe('drew');
  });
});
