import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readJsonBody, sendJson } from './json-response.js';
import { synthesizeWithLocalTts } from './local-tts-client.js';
import { resolvePackAssetWritePath, resolveSourceDir } from './paths.js';
import { enqueueTtsSynthesis, readTtsQueueStatus } from './tts-synthesis-queue.js';

interface TtsSynthesizeRequestBody {
  packId?: string;
  text?: string;
  relativePath?: string;
  label?: string;
  voice?: string;
}

export interface TtsSynthesizeResponse {
  ok: true;
  relativePath: string;
  sizeBytes: number;
}

export function handleTtsStatus(res: ServerResponse): void {
  sendJson(res, 200, readTtsQueueStatus());
}

export async function handleTtsSynthesize(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const body = await readJsonBody<TtsSynthesizeRequestBody>(req);
  const packId = body.packId?.trim() ?? '';
  const text = body.text?.trim() ?? '';
  const relativePath = body.relativePath?.trim() ?? '';
  const label = body.label?.trim() ?? text.slice(0, 48);

  if (!packId) {
    sendJson(res, 400, { error: 'packId 必填' });
    return;
  }
  if (!text) {
    sendJson(res, 400, { error: 'text 必填' });
    return;
  }
  if (!relativePath) {
    sendJson(res, 400, { error: 'relativePath 必填' });
    return;
  }

  const sourceDir = resolveSourceDir(packId);
  if (!sourceDir.ok) {
    sendJson(res, sourceDir.status, { error: sourceDir.message });
    return;
  }

  const assetPath = resolvePackAssetWritePath(sourceDir.path, relativePath);
  if (!assetPath.ok) {
    sendJson(res, assetPath.status, { error: assetPath.message });
    return;
  }

  try {
    const result = await enqueueTtsSynthesis(label, async () => {
      const synthesized = await synthesizeWithLocalTts({
        text,
        ...(body.voice?.trim() ? { voice: body.voice.trim() } : {}),
      });
      mkdirSync(dirname(assetPath.absolutePath), { recursive: true });
      writeFileSync(assetPath.absolutePath, synthesized.audioBytes);
      return {
        relativePath: assetPath.relativePath,
        sizeBytes: synthesized.audioBytes.byteLength,
      };
    });

    sendJson(res, 200, { ok: true, ...result } satisfies TtsSynthesizeResponse);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    sendJson(res, 502, { error: message });
  }
}
