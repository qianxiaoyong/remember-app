export const MANIFEST_VERSION = 1 as const;
export const PROTOCOL_VERSION = 1 as const;
export const SUPPORTED_PROTOCOL_VERSIONS = [PROTOCOL_VERSION] as const;
export const SUPPORTED_MANIFEST_VERSIONS = [MANIFEST_VERSION] as const;

export const CARD_TYPE_VOCABULARY = 'vocabulary' as const;
export const SUPPORTED_CARD_TYPES = [CARD_TYPE_VOCABULARY] as const;

export const MAX_PACK_ZIP_BYTES = 200 * 1024 * 1024;
export const MAX_PACK_FILE_BYTES = MAX_PACK_ZIP_BYTES;

export const TEST_PACK_KEY_ID = 'test-v1' as const;

/** 与 TEST 私钥（RFC 8032 seed，经 @noble/ed25519 推导）配对的公钥 hex */
export const TEST_PACK_PUBLIC_KEY_HEX =
  '5ec0ac9c532b057b9d9d2c41f6ea3a23a9e65f7b59128ec2f3967789ba77932c';
