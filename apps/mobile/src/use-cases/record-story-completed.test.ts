import { describe, it } from 'vitest';

/**
 * TODO(ADR-0014): 当 story reader 暴露完课信号后，在此写入 story_completed 事件。
 * 当前 reader 尚无稳定完课回调，P1 跳过实现。
 */
describe('recordStoryCompleted', () => {
  it.skip('writes story_completed when lesson fully listened', () => {});
});
