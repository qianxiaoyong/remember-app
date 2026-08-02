export const packErrorCodes = [
  'PACK_ARCHIVE_INVALID',
  'PACK_MANIFEST_INVALID',
  'PACK_PROTOCOL_UNSUPPORTED',
  'PACK_INTEGRITY_FAILED',
  'PACK_SIGNATURE_INVALID',
  'PACK_KEY_UNKNOWN',
  'PACK_SIZE_EXCEEDED',
  'PACK_SCHEMA_INVALID',
  'PACK_CONTENT_INVALID',
  'PACK_UNSUPPORTED_CARD_TYPE',
] as const;

export type PackErrorCode = (typeof packErrorCodes)[number];

export class PackVerificationError extends Error {
  readonly code: PackErrorCode;

  constructor(code: PackErrorCode, message: string) {
    super(message);
    this.name = 'PackVerificationError';
    this.code = code;
  }
}
