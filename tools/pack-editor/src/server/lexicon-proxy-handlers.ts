import { lexiconEntrySchema } from '@remember/contracts';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readJsonBody, sendJson } from './json-response.js';
import { proxyAdminLexiconRequest } from './lexicon-proxy.js';
import { resolveSourceDir } from './paths.js';

async function forwardLexiconResponse(upstream: Response, res: ServerResponse): Promise<void> {
  const text = await upstream.text();
  let body: unknown = {};
  if (text.length > 0) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      sendJson(res, 502, { error: '中心词库 API 返回非 JSON' });
      return;
    }
  }

  if (!upstream.ok) {
    const message =
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : `中心词库 API 错误 (${String(upstream.status)})`;
    sendJson(res, upstream.status, { error: message, ...(typeof body === 'object' ? body : {}) });
    return;
  }

  sendJson(res, upstream.status, body);
}

export async function handleLexiconSearch(url: URL, res: ServerResponse): Promise<void> {
  const query = url.searchParams.toString();
  const path = query.length > 0 ? `/search?${query}` : '/search';
  try {
    const upstream = await proxyAdminLexiconRequest(path, { method: 'GET' });
    await forwardLexiconResponse(upstream, res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    sendJson(res, 503, { error: message });
  }
}

export async function handleLexiconByForm(formKey: string, res: ServerResponse): Promise<void> {
  try {
    const upstream = await proxyAdminLexiconRequest(`/by-form/${encodeURIComponent(formKey)}`, {
      method: 'GET',
    });
    await forwardLexiconResponse(upstream, res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    sendJson(res, 503, { error: message });
  }
}

export async function handleLexiconBatchGet(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const body = await readJsonBody<unknown>(req);
    const upstream = await proxyAdminLexiconRequest('/batch-get', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    await forwardLexiconResponse(upstream, res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    sendJson(res, 503, { error: message });
  }
}

export function handleGetPackLexicon(packId: string, res: ServerResponse): void {
  const resolved = resolveSourceDir(packId);
  if (!resolved.ok) {
    sendJson(res, resolved.status, { error: resolved.message });
    return;
  }

  const lexiconPath = join(resolved.path, 'lexicon.json');
  try {
    const raw = readFileSync(lexiconPath, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    const entries = lexiconEntrySchema.array().parse(parsed);
    sendJson(res, 200, { entries });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    sendJson(res, 500, { error: `读取 lexicon.json 失败：${message}` });
  }
}

export async function handleSavePackLexicon(
  packId: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const resolved = resolveSourceDir(packId);
  if (!resolved.ok) {
    sendJson(res, resolved.status, { error: resolved.message });
    return;
  }

  try {
    const body = await readJsonBody<{ entries?: unknown }>(req);
    const entries = lexiconEntrySchema.array().parse(body.entries);
    const lexiconPath = join(resolved.path, 'lexicon.json');
    writeFileSync(lexiconPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
    sendJson(res, 200, { ok: true, count: entries.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    sendJson(res, 400, { error: message });
  }
}
