import { normalizeFormKey, normalizeLemmaKey } from '@remember/domain';
import { parseExchangeField, type EcdictLemmaFormType } from './parse-exchange.js';
import {
  labelForEcdictTag,
  normalizeIpa,
  parseCollinsStar,
  parseDefinitionEnLines,
  parseEcdictTagKeys,
  parseOptionalInt,
  parseOxfordCore,
  parsePrimaryPos,
  parseTranslationLines,
} from './parse-ecdict-fields.js';

export interface EcdictCsvRow {
  word: string;
  phonetic?: string;
  definition?: string;
  translation?: string;
  pos?: string;
  collins?: string;
  oxford?: string;
  tag?: string;
  bnc?: string;
  frq?: string;
  exchange?: string;
}

export interface MappedEcdictFragment {
  fragmentType: 'definition_zh' | 'definition_en';
  content: Record<string, string>;
  sortOrder: number;
}

export interface MappedEcdictForm {
  formKey: string;
  formType: EcdictLemmaFormType;
  displayForm: string;
}

export interface MappedEcdictTag {
  tagKey: string;
  labelZh: string;
}

export type MapEcdictRowResult =
  | {
      ok: true;
      lemmaKey: string;
      headword: string;
      ipa?: string;
      pos?: string;
      collinsStar?: number;
      oxfordCore?: boolean;
      frequencyBnc?: number;
      frequencyFrq?: number;
      fragments: MappedEcdictFragment[];
      forms: MappedEcdictForm[];
      tags: MappedEcdictTag[];
    }
  | { ok: false; reason: string };

export function mapEcdictRow(row: EcdictCsvRow): MapEcdictRowResult {
  const headword = row.word.trim();
  if (!headword) {
    return { ok: false, reason: 'empty word' };
  }

  const lemmaKey = normalizeLemmaKey(headword);
  if (!lemmaKey) {
    return { ok: false, reason: `invalid lemma key for "${headword}"` };
  }

  const fragments: MappedEcdictFragment[] = [];
  let sortOrder = 0;

  for (const item of parseTranslationLines(row.translation ?? '')) {
    if (!item.text) {
      continue;
    }
    const content: Record<string, string> = { text: item.text };
    if (item.pos) {
      content.pos = item.pos;
    }
    fragments.push({
      fragmentType: 'definition_zh',
      content,
      sortOrder,
    });
    sortOrder += 1;
  }

  for (const item of parseDefinitionEnLines(row.definition ?? '')) {
    fragments.push({
      fragmentType: 'definition_en',
      content: { text: item.text },
      sortOrder,
    });
    sortOrder += 1;
  }

  if (fragments.length === 0) {
    return { ok: false, reason: `no definitions for "${headword}"` };
  }

  const forms: MappedEcdictForm[] = [];
  const seenFormKeys = new Set<string>();
  for (const exchangeForm of parseExchangeField(row.exchange ?? '')) {
    const formKey = normalizeFormKey(exchangeForm.displayForm);
    if (!formKey || seenFormKeys.has(formKey)) {
      continue;
    }
    seenFormKeys.add(formKey);
    forms.push({
      formKey,
      formType: exchangeForm.formType,
      displayForm: exchangeForm.displayForm,
    });
  }

  const tags = parseEcdictTagKeys(row.tag ?? '').map((tagKey) => ({
    tagKey,
    labelZh: labelForEcdictTag(tagKey),
  }));

  const ipa = normalizeIpa(row.phonetic ?? '');
  const pos = parsePrimaryPos(row.pos ?? '');
  const collinsStar = parseCollinsStar(row.collins ?? '');
  const oxfordCore = parseOxfordCore(row.oxford ?? '');
  const frequencyBnc = parseOptionalInt(row.bnc ?? '');
  const frequencyFrq = parseOptionalInt(row.frq ?? '');

  return {
    ok: true,
    lemmaKey,
    headword,
    fragments,
    forms,
    tags,
    ...(ipa ? { ipa } : {}),
    ...(pos ? { pos } : {}),
    ...(collinsStar !== undefined ? { collinsStar } : {}),
    ...(oxfordCore !== undefined ? { oxfordCore } : {}),
    ...(frequencyBnc !== undefined ? { frequencyBnc } : {}),
    ...(frequencyFrq !== undefined ? { frequencyFrq } : {}),
  };
}
