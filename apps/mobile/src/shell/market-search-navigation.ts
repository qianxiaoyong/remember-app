import type { CatalogPrimaryCategory } from '../catalog/catalog-seed';

export interface MarketSearchSelection {
  highlightPackId: string;
  primaryCategory: CatalogPrimaryCategory;
  secondaryCategory: string;
  versionFilter: string;
}

let pendingSelection: MarketSearchSelection | null = null;

export function setMarketSearchSelection(selection: MarketSearchSelection): void {
  pendingSelection = selection;
}

export function consumeMarketSearchSelection(): MarketSearchSelection | null {
  const selection = pendingSelection;
  pendingSelection = null;
  return selection;
}

export function resetMarketSearchNavigationForTests(): void {
  pendingSelection = null;
}
