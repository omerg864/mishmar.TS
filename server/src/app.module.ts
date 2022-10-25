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
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

var imports =[]
console.log(join(__dirname, '..', '..', 'client', 'build'));
if (process.env.NODE_ENV === 'production') {
  imports = [ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', '..', 'client', 'build'),
  }) ,UserModule, ScheduleModule, ShiftModule, EventModule, PostModule, SettingsModule, StructureModule, ConfigModule.forRoot() , MongooseModule.forRoot(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.wkjalhp.mongodb.net/${process.env.DB_TYPE}?retryWrites=true&w=majority`)]
} else {
  imports = [UserModule, ScheduleModule, ShiftModule, EventModule, PostModule, SettingsModule, StructureModule, ConfigModule.forRoot() , MongooseModule.forRoot(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.wkjalhp.mongodb.net/${process.env.DB_TYPE}?retryWrites=true&w=majority`)]
}

@Module({
  imports,
  controllers: [],
  providers: [],
})
export class AppModule {}
