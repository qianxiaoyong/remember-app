import { describe, expect, it } from 'vitest';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('返回契约规定的健康状态', () => {
    expect(new HealthController().getHealth()).toEqual({ status: 'ok' });
  });
});
