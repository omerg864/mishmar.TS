import { UserController } from './user.controller';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserScheme } from './user.model';
import { AuthMiddleware, SiteManagerMiddleware } from 'src/middleware/auth.middlware';

@Module({
  imports: [MongooseModule.forFeature([{name: 'User',  schema: UserScheme}])],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({path: 'user', method: RequestMethod.PATCH});
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'user/:id', method: RequestMethod.DELETE});
    consumer.apply(SiteManagerMiddleware).forRoutes('user/all');
  }
}
