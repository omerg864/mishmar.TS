import { Module } from '@nestjs/common';
import { LogController } from './log.controller';

@Module({
  controllers: [LogController],
  providers: []
})
export class LogModule {}
