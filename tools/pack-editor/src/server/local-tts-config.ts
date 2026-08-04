export interface LocalTtsConfig {
  baseUrl: string;
  voice: string | null;
  format: 'mp3' | 'wav';
  requestTimeoutMs: number;
}

export function readLocalTtsConfig(): LocalTtsConfig {
  const baseUrl = process.env.LOCAL_TTS_BASE_URL?.trim() ?? 'http://127.0.0.1:7860';
  const voiceRaw = process.env.LOCAL_TTS_VOICE?.trim();
  const formatRaw = process.env.LOCAL_TTS_FORMAT?.trim().toLowerCase();
  const format = formatRaw === 'wav' ? 'wav' : 'mp3';
  const timeoutRaw = process.env.LOCAL_TTS_TIMEOUT_MS?.trim();
  const parsedTimeout = timeoutRaw ? Number.parseInt(timeoutRaw, 10) : 120_000;
  const requestTimeoutMs =
    Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 120_000;

  return {
    baseUrl: baseUrl.replace(/\/+$/, ''),
    voice: voiceRaw && voiceRaw.length > 0 ? voiceRaw : null,
    format,
    requestTimeoutMs,
  };
}
