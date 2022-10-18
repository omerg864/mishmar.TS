import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true});
  if (process.env.NODE_ENV === 'production') {
    console.log(`Server is running on production mode`);
  }
  await app.listen(process.env.PORT);
}
bootstrap();
