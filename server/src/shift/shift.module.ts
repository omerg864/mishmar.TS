import { SettingsScheme } from '../settings/settings.model';
import { ScheduleScheme } from './../schedule/schedule.model';
import { AdminManagerMiddleware } from './../middleware/auth.middlware';
import { ShiftScheme } from './shift.model';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserScheme } from '../user/user.model';
import { AuthMiddleware, SiteManagerMiddleware } from '../middleware/auth.middlware';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Shift', schema: ShiftScheme},{ name: 'Settings', schema: SettingsScheme}, {name: 'Schedule', schema: ScheduleScheme}, {name: 'User', schema: UserScheme}])],
  controllers: [ShiftController],
  providers: [ShiftService]
})
export class ShiftModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'api/shifts/all', method: RequestMethod.GET});
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'api/shifts/user/:userId/:scheduleId/manager', method: RequestMethod.GET});
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'api/shifts/schedule/:id', method: RequestMethod.GET});
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'api/shifts/excel', method: RequestMethod.PUT});
    consumer.apply(AuthMiddleware).forRoutes({path: 'api/shifts', method: RequestMethod.PATCH});
    consumer.apply(AuthMiddleware).forRoutes({path: 'api/shifts/user/:scheduleId', method: RequestMethod.GET});
    consumer.apply(AdminManagerMiddleware).forRoutes({path: 'api/shifts/*', method: RequestMethod.DELETE});
  }
}
