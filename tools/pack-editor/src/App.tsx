import { useState } from 'react';
import type { ReactElement } from 'react';
import { CardEditPage } from './pages/card-edit-page.js';
import { CardListPage } from './pages/card-list-page.js';
import { PackPickerPage } from './pages/pack-picker-page.js';

type EditorRoute =
  | { page: 'picker' }
  | { page: 'list'; packId: string }
  | { page: 'edit'; packId: string; sortOrder: number };

export function App(): ReactElement {
  const [route, setRoute] = useState<EditorRoute>({ page: 'picker' });

  return (
    <main style={{ padding: '1rem', fontFamily: 'system-ui, sans-serif', maxWidth: '960px' }}>
      {route.page === 'picker' && (
        <PackPickerPage onSelectPack={(packId) => setRoute({ page: 'list', packId })} />
      )}
      {route.page === 'list' && (
        <CardListPage
          packId={route.packId}
          onBack={() => setRoute({ page: 'picker' })}
          onEditCard={(sortOrder) => setRoute({ page: 'edit', packId: route.packId, sortOrder })}
        />
      )}
      {route.page === 'edit' && (
        <CardEditPage
          packId={route.packId}
          sortOrder={route.sortOrder}
          onBack={() => setRoute({ page: 'list', packId: route.packId })}
        />
      )}
    </main>
  );
}
