import { UserScheme } from '../user/user.model';
import { MongooseModule } from '@nestjs/mongoose';
import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SettingsScheme } from './settings.model';
import {
	AuthMiddleware,
	SiteManagerMiddleware,
} from '../middleware/auth.middleware';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Settings', schema: SettingsScheme },
			{ name: 'User', schema: UserScheme },
		]),
	],
	controllers: [SettingsController],
	providers: [SettingsService],
})
export class SettingsModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({ path: 'api/settings', method: RequestMethod.PATCH });
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({ path: 'api/bfile', method: RequestMethod.POST });
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({ path: 'api/hfile', method: RequestMethod.POST });
		consumer
			.apply(SiteManagerMiddleware)
			.forRoutes({ path: 'api/settings', method: RequestMethod.GET });
	}
}
