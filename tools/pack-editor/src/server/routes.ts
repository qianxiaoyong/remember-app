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
import {
  handleGetPackLexicon,
  handleLexiconBatchGet,
  handleLexiconByForm,
  handleLexiconSearch,
  handleSavePackLexicon,
} from './lexicon-proxy-handlers.js';
import { handleTtsStatus, handleTtsSynthesize } from './tts-handlers.js';
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
      handleGetAsset({
        packId: segments[2] ?? '',
        assetRelativePath: assetPath,
        req,
        res,
      });
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

  if (
    segments.length === 4 &&
    segments[0] === 'local-api' &&
    segments[1] === 'packs' &&
    segments[3] === 'lexicon'
  ) {
    if (req.method === 'GET') {
      handleGetPackLexicon(segments[2] ?? '', res);
      return;
    }
    if (req.method === 'PUT') {
      await handleSavePackLexicon(segments[2] ?? '', req, res);
      return;
    }
  }

  if (segments.length === 3 && segments[0] === 'local-api' && segments[1] === 'lexicon') {
    const url = new URL(req.url ?? '', 'http://localhost');
    if (segments[2] === 'search' && req.method === 'GET') {
      await handleLexiconSearch(url, res);
      return;
    }
    if (segments[2] === 'batch-get' && req.method === 'POST') {
      await handleLexiconBatchGet(req, res);
      return;
    }
  }

  if (
    segments.length === 4 &&
    segments[0] === 'local-api' &&
    segments[1] === 'lexicon' &&
    segments[2] === 'by-form'
  ) {
    if (req.method === 'GET') {
      await handleLexiconByForm(decodeURIComponent(segments[3] ?? ''), res);
      return;
    }
  }

  if (segments.length === 3 && segments[0] === 'local-api' && segments[1] === 'tts') {
    if (segments[2] === 'status' && req.method === 'GET') {
      handleTtsStatus(res);
      return;
    }
    if (segments[2] === 'synthesize' && req.method === 'POST') {
      await handleTtsSynthesize(req, res);
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
