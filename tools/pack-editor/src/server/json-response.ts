import type { IncomingMessage, ServerResponse } from 'node:http';

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

export async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    if (Buffer.isBuffer(chunk)) {
      chunks.push(chunk);
      continue;
    }
    if (typeof chunk === 'string') {
      chunks.push(Buffer.from(chunk));
    }
  }
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) {
    return {} as T;
  }
  return JSON.parse(text) as T;
}
