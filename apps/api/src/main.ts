import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { readPort } from './config/read-port.js';

async function startApi(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  await app.listen(readPort(process.env.PORT));
}

await startApi();
