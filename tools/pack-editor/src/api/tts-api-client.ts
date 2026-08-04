export interface TtsSynthesizeInput {
  packId: string;
  text: string;
  relativePath: string;
  label?: string;
  voice?: string;
}

export interface TtsSynthesizeResult {
  ok: true;
  relativePath: string;
  sizeBytes: number;
}

export interface TtsQueueStatus {
  pending: number;
  running: boolean;
  jobs: {
    id: string;
    label: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    error?: string;
  }[];
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `请求失败 (${String(response.status)})`);
  }
  return response.json() as Promise<T>;
}

export async function synthesizeTts(input: TtsSynthesizeInput): Promise<TtsSynthesizeResult> {
  return readJson<TtsSynthesizeResult>(
    await fetch('/local-api/tts/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  );
}

export async function fetchTtsQueueStatus(): Promise<TtsQueueStatus> {
  return readJson<TtsQueueStatus>(await fetch('/local-api/tts/status'));
}
