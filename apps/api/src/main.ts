import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureHttp } from './common/configure-http.js';
import { readPort } from './config/read-port.js';

async function startApi(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureHttp(app);
  app.setGlobalPrefix('api/v1');
  const port = readPort(process.env.PORT);
  await app.listen(port, '0.0.0.0');
}

await startApi();
