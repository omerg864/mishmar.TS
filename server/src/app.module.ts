/* eslint-disable prettier/prettier */
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
import { LogModule } from './log/log.module';
import { ReinforcementModule } from './reinforcement/reinforcement.module';
import * as path from 'path';
import * as dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({
        path: path.resolve(__dirname, '../.env'),
    });
}

const imports = [
    UserModule,
    ScheduleModule,
    ShiftModule,
    EventModule,
    PostModule,
    SettingsModule,
    StructureModule,
    LogModule,
    ReinforcementModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(`${process.env.MONGODB}`),
];

@Module({
    imports,
    controllers: [],
    providers: [],
})
export class AppModule {}
