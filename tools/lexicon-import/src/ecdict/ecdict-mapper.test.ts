import { describe, expect, it } from 'vitest';
import { mapEcdictRow } from './map-ecdict-row.js';
import { parseExchangeField } from './parse-exchange.js';
import { normalizeIpa, parseEcdictTagKeys, parseTranslationLines } from './parse-ecdict-fields.js';

describe('parseExchangeField', () => {
  it('解析 ECDICT exchange 字段', () => {
    expect(parseExchangeField('p:went/d:gone/3:goes/i:going')).toEqual([
      { formType: 'past', displayForm: 'went' },
      { formType: 'past', displayForm: 'gone' },
      { formType: 'third_person', displayForm: 'goes' },
      { formType: 'gerund', displayForm: 'going' },
    ]);
  });

  it('忽略 0/1 lemma 指示符', () => {
    expect(parseExchangeField('0:perceive/1:s')).toEqual([]);
  });
});

describe('parseTranslationLines', () => {
  it('拆分释义行并提取词性', () => {
    expect(parseTranslationLines('vi. 去；走\nn. 尝试')).toEqual([
      { pos: 'vi.', text: '去；走' },
      { pos: 'n.', text: '尝试' },
    ]);
  });
});

describe('mapEcdictRow', () => {
  it('映射 go 词条', () => {
    const mapped = mapEcdictRow({
      word: 'go',
      phonetic: 'ɡəʊ',
      definition: 'vi. to move',
      translation: 'vi. 去；走',
      pos: 'v',
      collins: '4',
      oxford: '1',
      tag: 'zk',
      bnc: '100',
      frq: '200',
      exchange: 'p:went/d:gone',
    });

    expect(mapped.ok).toBe(true);
    if (!mapped.ok) {
      return;
    }
    expect(mapped.lemmaKey).toBe('go');
    expect(mapped.ipa).toBe('/ɡəʊ/');
    expect(mapped.fragments).toHaveLength(2);
    expect(mapped.forms.map((form) => form.formKey)).toEqual(['went', 'gone']);
    expect(mapped.tags).toEqual([{ tagKey: 'zk', labelZh: '中考' }]);
  });

  it('无效 lemma key 返回错误', () => {
    expect(mapEcdictRow({ word: 'x!!', translation: 'n. 无效' }).ok).toBe(false);
  });

  it('无释义返回错误', () => {
    expect(mapEcdictRow({ word: 'empty', translation: '' }).ok).toBe(false);
  });
});

describe('normalizeIpa', () => {
  it('补全音标斜杠', () => {
    expect(normalizeIpa('ˈhæpi')).toBe('/ˈhæpi/');
    expect(normalizeIpa('/ˈhæpi/')).toBe('/ˈhæpi/');
  });
});

describe('parseEcdictTagKeys', () => {
  it('拆分空格标签', () => {
    expect(parseEcdictTagKeys('zk cet4')).toEqual(['zk', 'cet4']);
  });
});
