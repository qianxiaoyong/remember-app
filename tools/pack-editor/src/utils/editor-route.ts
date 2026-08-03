export type EditorRoute =
  | { page: 'picker' }
  | { page: 'list'; packId: string }
  | { page: 'edit'; packId: string; sortOrder: number; headword?: string };

export function editorRouteToHash(route: EditorRoute): string {
  if (route.page === 'picker') {
    return '#/';
  }
  if (route.page === 'list') {
    return `#/pack/${encodeURIComponent(route.packId)}`;
  }
  return `#/pack/${encodeURIComponent(route.packId)}/card/${String(route.sortOrder)}`;
}

export function parseEditorRouteHash(hash: string): EditorRoute {
  const path = hash.replace(/^#/, '').replace(/^\//, '');
  if (!path || path === '/') {
    return { page: 'picker' };
  }

  const segments = path.split('/').filter(Boolean);
  if (segments[0] === 'pack' && segments.length === 2 && segments[1]) {
    return { page: 'list', packId: decodeURIComponent(segments[1]) };
  }

  if (
    segments[0] === 'pack' &&
    segments.length === 4 &&
    segments[1] &&
    segments[2] === 'card' &&
    segments[3]
  ) {
    const sortOrder = Number.parseInt(segments[3], 10);
    if (Number.isFinite(sortOrder)) {
      return {
        page: 'edit',
        packId: decodeURIComponent(segments[1]),
        sortOrder,
      };
    }
  }

  return { page: 'picker' };
}

export function readEditorRouteFromLocation(): EditorRoute {
  return parseEditorRouteHash(window.location.hash);
}
