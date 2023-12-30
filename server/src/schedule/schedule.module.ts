import { StructureScheme } from './../structure/structure.model';
import { ScheduleScheme } from './schedule.model';
import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
	Delete,
} from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserScheme } from '../user/user.model';
import {
	AuthMiddleware,
	SiteManagerMiddleware,
} from '../middleware/auth.middleware';
import { SettingsScheme } from '../settings/settings.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Schedule', schema: ScheduleScheme },
			{ name: 'User', schema: UserScheme },
			{ name: 'Structure', schema: StructureScheme },
			{ name: 'Settings', schema: SettingsScheme },
		]),
	],
	controllers: [ScheduleController],
	providers: [ScheduleService],
})
export class ScheduleModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(AuthMiddleware)
			.forRoutes({
				path: 'api/schedules/auth/*',
				method: RequestMethod.GET,
			});
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({
				path: 'api/schedules/:id',
				method: RequestMethod.GET,
			});
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({
				path: 'api/schedules/table/:id',
				method: RequestMethod.GET,
			});
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({ path: 'api/schedules/*', method: RequestMethod.PUT });
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({ path: 'api/schedules', method: RequestMethod.POST });
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({ path: 'api/schedules', method: RequestMethod.PATCH });
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({
				path: 'api/schedules/*',
				method: RequestMethod.DELETE,
			});
	}
}
