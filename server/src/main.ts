/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import sanitizeMiddleware from './middleware/sanitize.middleware.js';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: true,
    });
    app.use(ExpressMongoSanitize());
    app.use(sanitizeMiddleware);
    app.use(cookieParser());
    await app.listen(process.env.PORT || 3000, () => {
        if (process.env.NODE_ENV === 'production') {
            console.log(`Server is running on production mode`);
        } else {
            console.log(`Server is running on dev mode`);
        }
    });
}
bootstrap();
