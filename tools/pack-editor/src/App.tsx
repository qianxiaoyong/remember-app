import { useState } from 'react';
import type { ReactElement } from 'react';
import { AppShell, type BreadcrumbItem } from './components/app-shell.js';
import { CardEditPage } from './pages/card-edit-page.js';
import { CardListPage } from './pages/card-list-page.js';
import { PackPickerPage } from './pages/pack-picker-page.js';

type EditorRoute =
  | { page: 'picker' }
  | { page: 'list'; packId: string }
  | { page: 'edit'; packId: string; sortOrder: number; headword?: string };

function buildBreadcrumbs(
  route: EditorRoute,
  navigate: (next: EditorRoute) => void,
): BreadcrumbItem[] {
  if (route.page === 'picker') {
    return [{ label: '选择包' }];
  }

  if (route.page === 'list') {
    return [
      {
        label: '选择包',
        onClick: () => {
          navigate({ page: 'picker' });
        },
      },
      { label: route.packId },
    ];
  }

  const editLabel = route.headword
    ? `#${String(route.sortOrder)} · ${route.headword}`
    : `#${String(route.sortOrder)}`;

  return [
    {
      label: '选择包',
      onClick: () => {
        navigate({ page: 'picker' });
      },
    },
    {
      label: route.packId,
      onClick: () => {
        navigate({ page: 'list', packId: route.packId });
      },
    },
    { label: editLabel },
  ];
}

export function App(): ReactElement {
  const [route, setRoute] = useState<EditorRoute>({ page: 'picker' });
  const breadcrumbs = buildBreadcrumbs(route, setRoute);

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      {route.page === 'picker' && (
        <PackPickerPage
          onSelectPack={(packId) => {
            setRoute({ page: 'list', packId });
          }}
        />
      )}
      {route.page === 'list' && (
        <CardListPage
          packId={route.packId}
          onBack={() => {
            setRoute({ page: 'picker' });
          }}
          onEditCard={(sortOrder, headword) => {
            setRoute({ page: 'edit', packId: route.packId, sortOrder, headword });
          }}
        />
      )}
      {route.page === 'edit' && (
        <CardEditPage
          packId={route.packId}
          sortOrder={route.sortOrder}
          onBack={() => {
            setRoute({ page: 'list', packId: route.packId });
          }}
        />
      )}
    </AppShell>
  );
}
