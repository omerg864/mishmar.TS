import { StructureScheme } from './structure.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { StructureController } from './structure.controller';
import { StructureService } from './structure.service';
import { UserScheme } from 'src/user/user.model';
import { SiteManagerMiddleware } from 'src/middleware/auth.middlware';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Structure', schema: StructureScheme}, {name: 'User', schema: UserScheme}])],
  controllers: [StructureController],
  providers: [StructureService]
})
export class StructureModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SiteManagerMiddleware).forRoutes(StructureController);
  }
}
