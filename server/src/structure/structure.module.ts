import { ScheduleScheme } from './../schedule/schedule.model';
import { StructureScheme } from './structure.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { StructureController } from './structure.controller';
import { StructureService } from './structure.service';
import { UserScheme } from '../user/user.model';
import { SiteManagerMiddleware } from '../middleware/auth.middleware';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Structure', schema: StructureScheme },
			{ name: 'Schedule', schema: ScheduleScheme },
			{ name: 'User', schema: UserScheme },
		]),
	],
	controllers: [StructureController],
	providers: [StructureService],
})
export class StructureModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(SiteManagerMiddleware).forRoutes(StructureController);
	}
}
