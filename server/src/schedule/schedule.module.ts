import { ScheduleScheme } from './schedule.model';
import { MiddlewareConsumer, Module, NestModule, RequestMethod, Delete } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserScheme } from 'src/user/user.model';
import { AuthMiddleware, SiteManagerMiddleware } from 'src/middleware/auth.middlware';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Schedule', schema: ScheduleScheme}, { name: 'User', schema: UserScheme}])],
  controllers: [ScheduleController],
  providers: [ScheduleService]
})
export class ScheduleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({path: 'schedule/*', method: RequestMethod.GET});
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'schedule', method: RequestMethod.POST});
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'schedule', method: RequestMethod.PATCH});
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'schedule/*', method: RequestMethod.DELETE});
  }
}
