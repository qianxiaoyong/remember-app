import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { readPort } from './config/read-port.js';

async function startApi(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  const port = readPort(process.env.PORT);
  await app.listen(port, '0.0.0.0');
}

await startApi();
