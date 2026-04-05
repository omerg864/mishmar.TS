import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import sanitizeMiddleware from './middleware/sanitize.middleware.js';
import cookieParser from 'cookie-parser';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

export const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    cors: {
      origin: process.env.SITE_ADDRESS,
      credentials: true,
    },
    logger: ['error', 'warn', 'log'],
  });
  app.use(ExpressMongoSanitize());
  app.use(sanitizeMiddleware);
  app.use(cookieParser());
  await app.init();
};

bootstrap();

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server is running on dev mode on port ${port}`);
  });
}

export default server;


