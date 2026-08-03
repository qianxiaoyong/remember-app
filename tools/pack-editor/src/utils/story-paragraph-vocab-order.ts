/** 本段用词表：最近新增/标记的 vocabId 排第一行，改 tier 不改变顺序。 */
export function orderParagraphVocabIds(
  displayOrder: string[],
  paragraphVocabIds: string[],
): string[] {
  const ordered = displayOrder.filter((id) => paragraphVocabIds.includes(id));
  for (const id of paragraphVocabIds) {
    if (!ordered.includes(id)) {
      ordered.push(id);
    }
  }
  return ordered;
}

export function prependParagraphVocabId(
  displayOrder: string[],
  vocabId: string,
  paragraphVocabIds: string[],
): string[] {
  const kept = displayOrder.filter((id) => id !== vocabId && paragraphVocabIds.includes(id));
  const appended = paragraphVocabIds.filter((id) => id !== vocabId && !kept.includes(id));
  return [vocabId, ...kept, ...appended];
}

export function removeParagraphVocabId(displayOrder: string[], vocabId: string): string[] {
  return displayOrder.filter((id) => id !== vocabId);
}
