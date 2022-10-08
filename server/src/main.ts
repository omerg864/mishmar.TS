import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from "express";


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(process.env.PORT);
}
bootstrap();
