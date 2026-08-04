import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import {
  readRequestId,
  requestIdMiddleware,
  type RequestWithId,
} from './request-id.middleware.js';

describe('requestIdMiddleware', () => {
  it('沿用客户端 X-Request-Id', () => {
    const request = {
      header: vi.fn().mockReturnValue('test-req-1'),
    } as unknown as Request;
    const response = {
      setHeader: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    requestIdMiddleware(request, response, next);

    expect((request as RequestWithId).requestId).toBe('test-req-1');
    expect(response.setHeader).toHaveBeenCalledWith('X-Request-Id', 'test-req-1');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('无请求头时生成 UUID', () => {
    const request = {
      header: vi.fn().mockReturnValue(undefined),
    } as unknown as Request;

    const requestId = readRequestId(request);
    expect(requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
