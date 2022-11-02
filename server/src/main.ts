import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
     cors: true 
    });
  if (process.env.NODE_ENV === 'production') {
    app.use('/' ,express.static(join(__dirname, "../../client/build")))
  }
  await app.listen(process.env.PORT || 3000, () => {
    if (process.env.NODE_ENV === 'production') {
      console.log(`Server is running on production mode`);
    } else {
      console.log(`Server is running on dev mode`);
    }
  });
}
bootstrap();
