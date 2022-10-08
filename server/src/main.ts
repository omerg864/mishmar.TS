import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from "express";


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: {
    allowedHeaders: ['content-type', 'authorization'],
    origin: 'http://localhost:3000',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true
   }});
  await app.listen(process.env.PORT);
}
bootstrap();
