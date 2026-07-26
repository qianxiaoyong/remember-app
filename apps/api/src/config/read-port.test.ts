import { describe, expect, it } from 'vitest';
import { readPort } from './read-port.js';

describe('readPort', () => {
  it('未配置时使用本地端口3000', () => {
    expect(readPort(undefined)).toBe(3000);
  });

  it.each(['', 'abc', '0', '65536', '1.5'])('拒绝非法端口 %s', (value) => {
    expect(() => readPort(value)).toThrow('PORT必须是1至65535之间的整数');
  });
});
