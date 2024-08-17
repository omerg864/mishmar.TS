import { ScheduleScheme } from './../schedule/schedule.model';
import { EventScheme } from './event.model';
import {
	Module,
	NestModule,
	MiddlewareConsumer,
	RequestMethod,
} from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserScheme } from '../user/user.model';
import {
	AuthMiddleware,
	SiteManagerMiddleware,
} from '../middleware/auth.middleware';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Event', schema: EventScheme },
			{ name: 'Schedule', schema: ScheduleScheme },
			{ name: 'User', schema: UserScheme },
		]),
	],
	controllers: [EventController],
	providers: [EventService],
})
export class EventModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({ path: 'api/events/*', method: RequestMethod.DELETE });
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({ path: 'api/events', method: RequestMethod.PATCH });
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({
				path: 'api/events/many',
				method: RequestMethod.PATCH,
			});
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({ path: 'api/events', method: RequestMethod.POST });
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({ path: 'api/events/:id', method: RequestMethod.GET });
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({
				path: 'api/events/manager/schedule/:scheduleId',
				method: RequestMethod.GET,
			});
		consumer
			.apply(AuthMiddleware)
			.forRoutes({
				path: 'api/events/schedule/*',
				method: RequestMethod.GET,
			});
	}
}
