import type { ImportDecision } from './types.js';
import type { PackLexiconAdapter } from './detect-conflicts.js';

export interface ApplyImportPlanInput<TExisting, TIncoming> {
  adapter: PackLexiconAdapter<TExisting, TIncoming>;
  existingItems: TExisting[];
  incomingBySurface: Map<string, TIncoming>;
  decisions: ImportDecision[];
}

export function applyImportPlan<TExisting, TIncoming>(
  input: ApplyImportPlanInput<TExisting, TIncoming>,
): TExisting[] {
  const { adapter, existingItems, incomingBySurface, decisions } = input;
  const next = [...existingItems];
  const indexByKey = new Map(next.map((item, index) => [adapter.getEntryKey(item), index]));

  for (const decision of decisions) {
    if (decision.action === 'skip') {
      continue;
    }

    const incoming = incomingBySurface.get(decision.surfaceForm);
    if (!incoming) {
      continue;
    }

    const key = adapter.getEntryKey(incoming as TExisting);
    const existingIndex = indexByKey.get(key);

    if (decision.action === 'append') {
      if (existingIndex === undefined) {
        indexByKey.set(key, next.length);
        next.push(incoming as unknown as TExisting);
      }
      continue;
    }

    if (existingIndex === undefined) {
      indexByKey.set(key, next.length);
      next.push(incoming as unknown as TExisting);
      continue;
    }

    next[existingIndex] = incoming as unknown as TExisting;
  }

  return next;
}
