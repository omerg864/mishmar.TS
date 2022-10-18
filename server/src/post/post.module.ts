import { ShiftManagerMiddleware, AuthMiddleware } from './../middleware/auth.middlware';
import { PostScheme } from './post.model';
import { MiddlewareConsumer, Module, NestModule, RequestMethod, Delete } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserScheme } from '../user/user.model';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Post', schema: PostScheme}, {name: 'User', schema: UserScheme}])],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule implements NestModule {
  configure(consumer: MiddlewareConsumer){
    consumer.apply(ShiftManagerMiddleware).forRoutes({path: 'api/posts', method: RequestMethod.POST})
    consumer.apply(ShiftManagerMiddleware).forRoutes({path: 'api/posts/*', method: RequestMethod.DELETE})
    consumer.apply(ShiftManagerMiddleware).forRoutes({path: 'api/posts', method: RequestMethod.PATCH})
    consumer.apply(ShiftManagerMiddleware).forRoutes({path: 'api/posts/*', method: RequestMethod.GET})
    consumer.apply(AuthMiddleware).forRoutes({path: 'api/posts/all', method: RequestMethod.GET})
  }
}
