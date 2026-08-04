import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

export interface RequestWithId extends Request {
  requestId: string;
}

export function readRequestId(request: Request): string {
  const fromHeader = request.header(REQUEST_ID_HEADER)?.trim();
  if (fromHeader) {
    return fromHeader;
  }
  return randomUUID();
}

export function requestIdMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const requestId = readRequestId(request);
  (request as RequestWithId).requestId = requestId;
  response.setHeader('X-Request-Id', requestId);
  next();
}
