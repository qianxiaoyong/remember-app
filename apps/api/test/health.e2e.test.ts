import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { configureHttp } from '../src/common/configure-http.js';

describe('GET /api/v1/health', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureHttp(app);
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('返回严格匹配契约的健康状态', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server).get('/api/v1/health').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('回显 X-Request-Id 响应头', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server)
      .get('/api/v1/health')
      .set('X-Request-Id', 'test-req-1')
      .expect(200);
    expect(response.headers['x-request-id']).toBe('test-req-1');
  });

  it('HttpException 响应包含 requestId', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server)
      .post('/api/v1/packs/remember-test-pack/download-authorization')
      .set('X-Request-Id', 'test-req-1')
      .expect(401);
    expect(response.body).toMatchObject({
      code: 'SESSION_MISSING',
      requestId: 'test-req-1',
    });
  });
});
