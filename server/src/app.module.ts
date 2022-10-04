import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ShiftModule } from './shift/shift.module';
import { EventModule } from './event/event.module';
import { PostModule } from './post/post.module';
import { SettingsModule } from './settings/settings.module';
import { StructureModule } from './structure/structure.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [UserModule, ScheduleModule, ShiftModule, EventModule, PostModule, SettingsModule, StructureModule, ConfigModule.forRoot() , MongooseModule.forRoot(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.wkjalhp.mongodb.net/?retryWrites=true&w=majority`)],
  controllers: [],
  providers: [],
})
export class AppModule {}
