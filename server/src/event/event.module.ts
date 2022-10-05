import { EventScheme } from './event.model';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserScheme } from 'src/user/user.model';
import { AuthMiddleware, SiteManagerMiddleware } from 'src/middleware/auth.middlware';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Event', schema: EventScheme}, {name: 'User', schema: UserScheme}])],
  controllers: [EventController],
  providers: [EventService]
})
export class EventModule implements NestModule{
  configure(consumer: MiddlewareConsumer){
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'event/*', method: RequestMethod.DELETE});
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'event', method: RequestMethod.PATCH});
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'event', method: RequestMethod.POST});
    consumer.apply(AuthMiddleware).forRoutes({path: 'event/*', method: RequestMethod.GET});
  }
}
