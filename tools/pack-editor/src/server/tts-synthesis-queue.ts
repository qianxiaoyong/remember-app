export interface TtsQueueJobSnapshot {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}

export interface TtsQueueStatus {
  pending: number;
  running: boolean;
  jobs: TtsQueueJobSnapshot[];
}

let tail: Promise<void> = Promise.resolve();
let running = false;
let pendingCount = 0;
const recentJobs: TtsQueueJobSnapshot[] = [];
const MAX_RECENT_JOBS = 20;

function pushJobSnapshot(job: TtsQueueJobSnapshot): void {
  recentJobs.unshift(job);
  if (recentJobs.length > MAX_RECENT_JOBS) {
    recentJobs.length = MAX_RECENT_JOBS;
  }
}

export function readTtsQueueStatus(): TtsQueueStatus {
  return {
    pending: pendingCount,
    running,
    jobs: [...recentJobs],
  };
}

export function enqueueTtsSynthesis<T>(label: string, task: () => Promise<T>): Promise<T> {
  const jobId = `${String(Date.now())}-${String(Math.random()).slice(2, 8)}`;
  pendingCount += 1;
  pushJobSnapshot({ id: jobId, label, status: 'pending' });

  const run = tail.then(async () => {
    pendingCount = Math.max(0, pendingCount - 1);
    running = true;
    pushJobSnapshot({ id: jobId, label, status: 'running' });
    try {
      const result = await task();
      pushJobSnapshot({ id: jobId, label, status: 'completed' });
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      pushJobSnapshot({ id: jobId, label, status: 'failed', error: message });
      throw error;
    } finally {
      running = false;
    }
  });

  tail = run.then(
    () => undefined,
    () => undefined,
  );

  return run;
}
