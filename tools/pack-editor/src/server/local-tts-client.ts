import { readFile } from 'node:fs/promises';
import { readLocalTtsConfig } from './local-tts-config.js';

export interface LocalTtsSynthesizeInput {
  text: string;
  voice?: string;
}

export interface LocalTtsSynthesizeResult {
  audioBytes: Buffer;
  mimeType: string;
}

interface LocalTtsJsonResponse {
  audio_path?: string;
  output_path?: string;
  path?: string;
  audio_base64?: string;
  mime_type?: string;
}

function pickAudioPath(body: LocalTtsJsonResponse): string | null {
  return body.audio_path ?? body.output_path ?? body.path ?? null;
}

async function readAudioFromJson(
  body: LocalTtsJsonResponse,
): Promise<LocalTtsSynthesizeResult | null> {
  const audioPath = pickAudioPath(body);
  if (audioPath) {
    const audioBytes = await readFile(audioPath);
    return {
      audioBytes,
      mimeType: body.mime_type ?? guessMimeTypeFromPath(audioPath),
    };
  }

  if (body.audio_base64) {
    return {
      audioBytes: Buffer.from(body.audio_base64, 'base64'),
      mimeType: body.mime_type ?? 'audio/mpeg',
    };
  }

  return null;
}

function guessMimeTypeFromPath(filePath: string): string {
  if (filePath.toLowerCase().endsWith('.wav')) {
    return 'audio/wav';
  }
  return 'audio/mpeg';
}

export async function synthesizeWithLocalTts(
  input: LocalTtsSynthesizeInput,
): Promise<LocalTtsSynthesizeResult> {
  const config = readLocalTtsConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, config.requestTimeoutMs);

  try {
    const payload: Record<string, string> = {
      text: input.text,
      format: config.format,
    };
    const voice = input.voice ?? config.voice;
    if (voice) {
      payload.voice = voice;
    }

    const response = await fetch(`${config.baseUrl}/api/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        errorText.trim() ||
          `LocalTTS 请求失败 (${String(response.status)})，请确认服务已在 ${config.baseUrl} 运行`,
      );
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.startsWith('audio/')) {
      const arrayBuffer = await response.arrayBuffer();
      return {
        audioBytes: Buffer.from(arrayBuffer),
        mimeType: contentType.split(';')[0] ?? 'audio/mpeg',
      };
    }

    const body = (await response.json()) as LocalTtsJsonResponse;
    const fromJson = await readAudioFromJson(body);
    if (fromJson) {
      return fromJson;
    }

    throw new Error('LocalTTS 响应未包含音频数据');
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`LocalTTS 请求超时（${String(config.requestTimeoutMs)}ms）`, {
        cause: error,
      });
    }
    if (error instanceof TypeError) {
      throw new Error(`无法连接 LocalTTS（${config.baseUrl}），请确认服务已启动`, { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
