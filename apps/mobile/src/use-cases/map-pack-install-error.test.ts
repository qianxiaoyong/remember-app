import { describe, expect, it } from 'vitest';
import { PackVerificationError } from '@remember/contracts';
import { mapPackInstallError } from './map-pack-install-error.js';

describe('mapPackInstallError', () => {
  it('maps PACK_PROTOCOL_UNSUPPORTED to user-facing message', () => {
    const mapped = mapPackInstallError(
      new PackVerificationError('PACK_PROTOCOL_UNSUPPORTED', 'protocol 2'),
    );
    expect(mapped.message).toContain('升级');
  });

  it('passes through generic errors', () => {
    const original = new Error('network');
    expect(mapPackInstallError(original)).toBe(original);
  });
});
