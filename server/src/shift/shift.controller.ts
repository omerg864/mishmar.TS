import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, StreamableFile } from '@nestjs/common';
import { EventInterface } from '../event/event.model';
import { UserID } from '../middleware/auth.middlware';
import { Shift, ShiftScheduleWeek } from './shift.model';
import { ShiftService } from './shift.service';

@Controller('api/shifts')
export class ShiftController {

    constructor(private readonly shiftService: ShiftService) {}


    @Get('all')
    async getAll(@Query() query: {userId: string, scheduleId: string}): Promise<Shift[]> {
        return this.shiftService.getAll(query);
    }

    @Get('schedule/:id')
    async scheduleShifts(@Param('id') id: string): Promise<{weeks: ShiftScheduleWeek[],weeksNotes: string[], generalNotes: string, users: {nickname: string, id: string}[], noUsers: {nickname: string, id: string }[], minUsers: {nickname: string, id: string, morning: number[], noon: number[] }[]}> {
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

    @Put('excel')
    async toExcel(@Body('weeks') weeks: ShiftScheduleWeek[], @Body('days') days: string[][], @Body('num_users') num_users: number
    , @Body('weeksNotes') weeksNotes: string[], @Body('generalNotes') generalNotes: string, @Body('events') events: EventInterface[]): Promise<StreamableFile> {
        return await this.shiftService.toExcel(weeks, days, num_users, weeksNotes, generalNotes, events);
    }

    @Delete(':id')
    async deleteShift(@Param('id') id: string): Promise<{id: string}> {
        return this.shiftService.delete(id);
    }

    @Patch()
    async patchShift(@Body() shift: Shift, @UserID() userId: string): Promise<Shift> {
        return this.shiftService.update(shift, userId);
    }
}
