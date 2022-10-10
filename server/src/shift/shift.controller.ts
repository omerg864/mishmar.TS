import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserID } from 'src/middleware/auth.middlware';
import { Shift, ShiftScheduleWeek } from './shift.model';
import { ShiftService } from './shift.service';

@Controller('shift')
export class ShiftController {

    constructor(private readonly shiftService: ShiftService) {}


    @Get('all')
    async getAll(@Query() query: {userId: string, scheduleId: string}): Promise<Shift[]> {
        return this.shiftService.getAll(query);
    }

    @Get('schedule/:id')
    async scheduleShifts(@Param('id') id: string): Promise<{weeks: ShiftScheduleWeek[], users: {nickname: string, id: string}[], noUsers: {nickname: string, id: string }[], minUsers: {nickname: string, id: string, morning: number[], noon: number[] }[]}> {
        return await this.shiftService.scheduleShifts(id);
    }

    @Get('user/:userId/:scheduleId/manager')
    async getUserScheduleShiftManager(@Param('userId') userId: string, @Param('scheduleId') scheduleId: string): Promise<Shift> {
        return this.shiftService.getUserScheduleShift(userId, scheduleId);
    }

    @Get('user/:scheduleId')
    async getUserScheduleShift(@UserID() userId: string, @Param('scheduleId') scheduleId: string): Promise<Shift> {
        return this.shiftService.getUserScheduleShift(userId, scheduleId);
    }

    @Get(':id')
    async getShift(@Param('id') id: string): Promise<Shift> {
        return this.shiftService.getShift(id);
    }

    @Post()
    async addShift(@Body() shift: Shift): Promise<Shift> {
        return this.shiftService.create(shift);
    }

    @Delete(':id')
    async deleteShift(@Param('id') id: string): Promise<string> {
        return this.shiftService.delete(id);
    }

    @Patch()
    async patchShift(@Body() shift: Shift): Promise<Shift> {
        return this.shiftService.update(shift);
    }
}
