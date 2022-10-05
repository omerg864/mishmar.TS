import { ShiftManagerMiddleware, AuthMiddleware } from './../middleware/auth.middlware';
import { PostScheme } from './post.model';
import { MiddlewareConsumer, Module, NestModule, RequestMethod, Delete } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserScheme } from 'src/user/user.model';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Post', schema: PostScheme}, {name: 'User', schema: UserScheme}])],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule implements NestModule {
  configure(consumer: MiddlewareConsumer){
    consumer.apply(ShiftManagerMiddleware).forRoutes({path: 'post', method: RequestMethod.POST})
    consumer.apply(ShiftManagerMiddleware).forRoutes({path: 'post/*', method: RequestMethod.DELETE})
    consumer.apply(ShiftManagerMiddleware).forRoutes({path: 'post', method: RequestMethod.PATCH})
    consumer.apply(AuthMiddleware).forRoutes({path: 'post/*', method: RequestMethod.GET})
  }
}
