import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { Schedule } from './schedule.model';
import { ScheduleService, Shift } from './schedule.service';

@Controller('api/schedules')
export class ScheduleController {

    constructor(private readonly scheduleService: ScheduleService) {}


    @Get('auth/all')
    async getAllSchedules(): Promise<Schedule[]> {
        return await this.scheduleService.getAll();
    }

    @Get('auth/last/data')
    async getLastDataSchedule(): Promise<Schedule> {
        return await this.scheduleService.getLastData();
    }

    @Get('auth/last')
    async getLastSchedule(): Promise<Schedule> {
        return await this.scheduleService.getLast();
    }

    @Put('check')
    async scheduleValid(@Body() weeks: Shift[][]): Promise<string[]> {
        return await this.scheduleService.scheduleValid(weeks);
    }

    @Get(':id')
    async getSchedule(@Param('id') id: string): Promise<Schedule> {
        return await this.scheduleService.getSchedule(id);
    }

    @Post()
    async createSchedule(@Body() schedule: Schedule): Promise<Schedule> {
        return await this.scheduleService.create(schedule);
    }

    @Delete(':id')
    async deleteSchedule(@Param('id') id: string): Promise<{id: string}> {
        return await this.scheduleService.delete(id);
    }

    @Patch()
    async updateSchedule(@Body() schedule: Schedule): Promise<Schedule> {
        return await this.scheduleService.update(schedule);
    }
}
