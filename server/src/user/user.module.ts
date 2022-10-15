import { UserController } from './user.controller';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserScheme } from './user.model';
import { AuthMiddleware, SiteManagerMiddleware } from 'src/middleware/auth.middlware';
import { SettingsScheme } from 'src/settings/settings.model';

@Module({
  imports: [MongooseModule.forFeature([{name: 'User',  schema: UserScheme}, {name: 'Settings', schema: SettingsScheme}])],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({path: 'api/users', method: RequestMethod.PATCH});
    consumer.apply(AuthMiddleware).forRoutes({path: 'api/users/auth', method: RequestMethod.GET});
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'api/users/manager', method: RequestMethod.PATCH});
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'api/users/:id', method: RequestMethod.DELETE});
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'api/users/many', method: RequestMethod.PATCH});
    consumer.apply(SiteManagerMiddleware).forRoutes('api/users/all');
  }
}
