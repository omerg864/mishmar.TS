import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Schedule } from './schedule.model';
import { ScheduleService } from './schedule.service';

@Controller('api/schedules')
export class ScheduleController {

    constructor(private readonly scheduleService: ScheduleService) {}


    @Get('all')
    async getAllSchedules(): Promise<Schedule[]> {
        return await this.scheduleService.getAll();
    }

    @Get('last/data')
    async getLastDataSchedule(): Promise<Schedule> {
        return await this.scheduleService.getLastData();
    }

    @Get('last')
    async getLastSchedule(): Promise<Schedule> {
        return await this.scheduleService.getLast();
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
    async deleteSchedule(@Param('id') id: string): Promise<string> {
        return await this.scheduleService.delete(id);
    }

    @Patch()
    async updateSchedule(@Body() schedule: Schedule): Promise<Schedule> {
        return await this.scheduleService.update(schedule);
    }
}
