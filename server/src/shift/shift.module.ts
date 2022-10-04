import { Module } from '@nestjs/common';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';

@Module({
  controllers: [ShiftController],
  providers: [ShiftService]
})
export class ShiftModule {}
