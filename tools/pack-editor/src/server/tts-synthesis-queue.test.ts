import { describe, expect, it } from 'vitest';
import { enqueueTtsSynthesis } from './tts-synthesis-queue.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe('enqueueTtsSynthesis', () => {
  it('串行执行多个任务', async () => {
    const order: number[] = [];

    const first = enqueueTtsSynthesis('job-1', () =>
      sleep(30).then(() => {
        order.push(1);
      }),
    );
    const second = enqueueTtsSynthesis('job-2', () => {
      order.push(2);
      return Promise.resolve();
    });
    const third = enqueueTtsSynthesis('job-3', () => {
      order.push(3);
      return Promise.resolve();
    });

    await Promise.all([first, second, third]);
    expect(order).toEqual([1, 2, 3]);
  });

  it('失败任务不阻塞后续任务', async () => {
    const order: string[] = [];

    const failing = enqueueTtsSynthesis('fail', () => {
      order.push('fail');
      return Promise.reject(new Error('boom'));
    }).catch(() => undefined);

    const next = enqueueTtsSynthesis('ok', () => {
      order.push('ok');
      return Promise.resolve();
    });

    await Promise.all([failing, next]);
    expect(order).toEqual(['fail', 'ok']);
  });
});
