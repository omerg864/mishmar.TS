import { AdminManagerMiddleware } from './../middleware/auth.middlware';
import { ShiftScheme } from './shift.model';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserScheme } from 'src/user/user.model';
import { AuthMiddleware, SiteManagerMiddleware } from 'src/middleware/auth.middlware';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Shift', schema: ShiftScheme}, {name: 'User', schema: UserScheme}])],
  controllers: [ShiftController],
  providers: [ShiftService]
})
export class ShiftModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SiteManagerMiddleware).forRoutes({path: 'shift/all', method: RequestMethod.GET});
    consumer.apply(AuthMiddleware).forRoutes({path: 'shift/user/:scheduleId', method: RequestMethod.GET});
    consumer.apply(AuthMiddleware).forRoutes({path: 'shift/:id', method: RequestMethod.GET});
    consumer.apply(AuthMiddleware).forRoutes({path: 'shift', method: RequestMethod.POST});
    consumer.apply(AuthMiddleware).forRoutes({path: 'shift', method: RequestMethod.PATCH});
    consumer.apply(AdminManagerMiddleware).forRoutes({path: 'shift/*', method: RequestMethod.DELETE});
  }
}
