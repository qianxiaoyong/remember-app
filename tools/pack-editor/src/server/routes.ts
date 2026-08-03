import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  handleBuild,
  handleCreateCard,
  handleDeleteCard,
  handleGetAsset,
  handleGetAudioMeta,
  handleGetSource,
  handleListPacks,
  handleSaveCard,
  handleValidate,
} from './local-api-handlers.js';
import { sendJson } from './json-response.js';

async function handleLocalApi(
  req: IncomingMessage,
  res: ServerResponse,
  urlPath: string,
): Promise<void> {
  const pathname = urlPath.split('?')[0] ?? urlPath;
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 2 && segments[0] === 'local-api' && segments[1] === 'packs') {
    if (req.method === 'GET') {
      handleListPacks(res);
      return;
    }
  }

  if (
    segments.length === 4 &&
    segments[0] === 'local-api' &&
    segments[1] === 'packs' &&
    segments[3] === 'source'
  ) {
    if (req.method === 'GET') {
      handleGetSource(segments[2] ?? '', res);
      return;
    }
  }

  if (
    segments.length === 4 &&
    segments[0] === 'local-api' &&
    segments[1] === 'packs' &&
    segments[3] === 'audio-meta'
  ) {
    if (req.method === 'GET') {
      const url = new URL(req.url ?? '', 'http://localhost');
      handleGetAudioMeta(segments[2] ?? '', url.searchParams.get('path') ?? undefined, res);
      return;
    }
  }

  if (
    segments.length >= 5 &&
    segments[0] === 'local-api' &&
    segments[1] === 'packs' &&
    segments[3] === 'assets'
  ) {
    if (req.method === 'GET') {
      const assetPath = segments
        .slice(4)
        .map((part) => decodeURIComponent(part))
        .join('/');
      handleGetAsset(segments[2] ?? '', assetPath, res);
      return;
    }
  }

  if (
    segments.length === 5 &&
    segments[0] === 'local-api' &&
    segments[1] === 'packs' &&
    segments[3] === 'cards'
  ) {
    if (req.method === 'PUT') {
      await handleSaveCard({
        packId: segments[2] ?? '',
        sortOrderText: segments[4] ?? '',
        req,
        res,
      });
      return;
    }
    if (req.method === 'DELETE') {
      handleDeleteCard(segments[2] ?? '', segments[4] ?? '', res);
      return;
    }
  }

  if (
    segments.length === 4 &&
    segments[0] === 'local-api' &&
    segments[1] === 'packs' &&
    segments[3] === 'cards'
  ) {
    if (req.method === 'POST') {
      await handleCreateCard(segments[2] ?? '', req, res);
      return;
    }
  }

  if (
    segments.length === 4 &&
    segments[0] === 'local-api' &&
    segments[1] === 'packs' &&
    segments[3] === 'validate'
  ) {
    if (req.method === 'POST') {
      handleValidate(segments[2] ?? '', res);
      return;
    }
  }

  if (
    segments.length === 4 &&
    segments[0] === 'local-api' &&
    segments[1] === 'packs' &&
    segments[3] === 'build'
  ) {
    if (req.method === 'POST') {
      await handleBuild(segments[2] ?? '', req, res);
      return;
    }
  }

  sendJson(res, 404, { error: 'not found' });
}

export function createLocalApiMiddleware(): (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) => void {
  return (req, res, next) => {
    const url = req.url ?? '';
    if (!url.startsWith('/local-api/')) {
      next();
      return;
    }

    void handleLocalApi(req, res, url).catch((error: unknown) => {
      if (res.writableEnded) {
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      sendJson(res, 500, { error: message });
    });
  };
}
