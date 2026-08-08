import { type ArgumentsHost, Catch, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { ZodError } from 'zod';
import { readRequestId, type RequestWithId } from './request-id.middleware.js';

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(error: ZodError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    response.status(400).json({
      code: 'VALIDATION_FAILED',
      message: error.issues[0]?.message ?? '请求参数无效',
      requestId: readRequestId(request),
    });
  }
}
