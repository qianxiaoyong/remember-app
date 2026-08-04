import type { AdminLexiconDetail } from '@remember/contracts';

export function pickPrimaryDefinitionZh(lemma: AdminLexiconDetail): string {
  const fragment = lemma.fragments
    .filter((item) => item.fragmentType === 'definition_zh')
    .sort((left, right) => left.sortOrder - right.sortOrder)[0];
  if (!fragment) {
    return lemma.headword;
  }
  const content = fragment.content as { text?: string };
  const text = content.text?.trim();
  return text && text.length > 0 ? text : lemma.headword;
}

export function pickPrimaryPos(lemma: AdminLexiconDetail): string | undefined {
  const fromLemma = lemma.pos?.trim();
  if (fromLemma) {
    return fromLemma;
  }
  const fragment = lemma.fragments
    .filter((item) => item.fragmentType === 'definition_zh')
    .sort((left, right) => left.sortOrder - right.sortOrder)[0];
  if (!fragment) {
    return undefined;
  }
  const content = fragment.content as { pos?: string };
  const pos = content.pos?.trim();
  return pos && pos.length > 0 ? pos : undefined;
}

export function pickMorphologyNote(lemma: AdminLexiconDetail): string | undefined {
  const fragment = lemma.fragments
    .filter((item) => item.fragmentType === 'morphology')
    .sort((left, right) => left.sortOrder - right.sortOrder)[0];
  if (!fragment) {
    return undefined;
  }
  const content = fragment.content as {
    breakdown?: string;
    root?: string;
    prefix?: string;
    suffix?: string;
  };
  const breakdown = content.breakdown?.trim();
  if (breakdown) {
    return breakdown;
  }
  const parts = [content.prefix, content.root, content.suffix]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

export function pickDefinitionZhList(lemma: AdminLexiconDetail): { text: string; pos?: string }[] {
  return lemma.fragments
    .filter((item) => item.fragmentType === 'definition_zh')
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((fragment) => {
      const content = fragment.content as { text?: string; pos?: string };
      const text = content.text?.trim() ?? '';
      const pos = content.pos?.trim();
      return pos ? { text, pos } : { text };
    })
    .filter((item) => item.text.length > 0);
}

export function resolveLemmaDisplayForm(
  lemma: AdminLexiconDetail,
  surfaceForm: string,
  displayForm: string,
): string {
  const matchedForm = lemma.forms.find((form) => form.formKey === surfaceForm);
  if (matchedForm) {
    return matchedForm.displayForm;
  }
  if (lemma.lemmaKey === surfaceForm) {
    return lemma.headword;
  }
  return displayForm;
}
