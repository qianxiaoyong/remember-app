import type { INestApplication } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { requestIdMiddleware } from './request-id.middleware.js';
import { ZodExceptionFilter } from './zod-exception.filter.js';

export function configureHttp(app: INestApplication): void {
  app.use(requestIdMiddleware);
  app.useGlobalFilters(new ZodExceptionFilter(), new HttpExceptionFilter());
}
