import { useCallback, useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { AppShell, type BreadcrumbItem } from './components/app-shell.js';
import { CardEditPage } from './pages/card-edit-page.js';
import { CardListPage } from './pages/card-list-page.js';
import { PackPickerPage } from './pages/pack-picker-page.js';
import {
  editorRouteToHash,
  readEditorRouteFromLocation,
  type EditorRoute,
} from './utils/editor-route.js';

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
  const [route, setRoute] = useState<EditorRoute>(() => readEditorRouteFromLocation());

  const navigate = useCallback((next: EditorRoute) => {
    setRoute(next);
    const nextHash = editorRouteToHash(next);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }, []);

  useEffect(() => {
    const syncRouteFromHash = (): void => {
      setRoute(readEditorRouteFromLocation());
    };
    window.addEventListener('hashchange', syncRouteFromHash);
    return () => {
      window.removeEventListener('hashchange', syncRouteFromHash);
    };
  }, []);

  const breadcrumbs = buildBreadcrumbs(route, navigate);

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      {route.page === 'picker' && (
        <PackPickerPage
          onSelectPack={(packId) => {
            navigate({ page: 'list', packId });
          }}
        />
      )}
      {route.page === 'list' && (
        <CardListPage
          packId={route.packId}
          onBack={() => {
            navigate({ page: 'picker' });
          }}
          onEditCard={(sortOrder, headword) => {
            navigate({ page: 'edit', packId: route.packId, sortOrder, headword });
          }}
        />
      )}
      {route.page === 'edit' && (
        <CardEditPage
          packId={route.packId}
          sortOrder={route.sortOrder}
          onBack={() => {
            navigate({ page: 'list', packId: route.packId });
          }}
        />
      )}
    </AppShell>
  );
}
