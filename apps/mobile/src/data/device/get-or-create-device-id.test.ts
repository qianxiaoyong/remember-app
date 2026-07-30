import { describe, expect, it } from 'vitest';
import { formatUuidV4 } from './format-uuid-v4';

describe('formatUuidV4', () => {
  it('格式符合 RFC 4122', () => {
    const bytes = new Uint8Array(16);
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = index;
    }

    const deviceId = formatUuidV4(bytes);
    expect(deviceId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
