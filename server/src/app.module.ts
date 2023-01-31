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
import { ServeStaticModule } from '@nestjs/serve-static';
import { LogModule } from './log/log.module';
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
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
        `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.${process.env.DB_PORT}.mongodb.net/${process.env.DB_TYPE}?retryWrites=true&w=majority`
    ),
];

if (process.env.NODE_ENV === 'production') {
    imports.push(
        ServeStaticModule.forRoot({
            rootPath: path.join(__dirname, '../../client/build'),
        })
    );
}
@Module({
    imports,
    controllers: [],
    providers: [],
})
export class AppModule {}
