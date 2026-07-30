import { Injectable } from '@nestjs/common';

export interface RedemptionConfig {
  codePepper: string;
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

@Injectable()
export class RedemptionConfigService {
  read(): RedemptionConfig {
    return {
      codePepper: requireEnv('REDEMPTION_CODE_PEPPER'),
    };
  }
}
