export interface CosConfig {
  enabled: boolean;
  secretId: string;
  secretKey: string;
  region: string;
  bucket: string;
  presignTtlSeconds: number;
}

export interface CosConfigDisabled {
  enabled: false;
}

export type ReadCosConfigResult = CosConfig | CosConfigDisabled;

function readBooleanEnv(name: string): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  return raw === 'true' || raw === '1';
}

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set when COS is enabled`);
  }
  return value;
}

function readPresignTtlSeconds(): number {
  const raw = process.env.COS_PRESIGN_TTL_SECONDS?.trim();
  if (!raw) {
    return 900;
  }

  const seconds = Number(raw);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error('COS_PRESIGN_TTL_SECONDS must be a positive number');
  }

  return seconds;
}

export function readCosConfig(): ReadCosConfigResult {
  if (!readBooleanEnv('COS_ENABLED')) {
    return { enabled: false };
  }

  return {
    enabled: true,
    secretId: readRequiredEnv('COS_SECRET_ID'),
    secretKey: readRequiredEnv('COS_SECRET_KEY'),
    region: readRequiredEnv('COS_REGION'),
    bucket: readRequiredEnv('COS_BUCKET'),
    presignTtlSeconds: readPresignTtlSeconds(),
  };
}

export function assertCosConfigEnabled(config: ReadCosConfigResult): asserts config is CosConfig {
  if (!config.enabled) {
    throw new Error('COS is not enabled');
  }
}
