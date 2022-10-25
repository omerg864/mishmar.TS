import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Schedule } from './schedule.model';
import { ScheduleService, Shift } from './schedule.service';

@Controller('api/schedules')
export class ScheduleController {

    constructor(private readonly scheduleService: ScheduleService) {}


    @Get('auth/all')
    async getAllSchedules(@Query() query: {page?: number}): Promise<{schedules: Schedule[], pages: number}> {
        return await this.scheduleService.getAll(query);
    }

    @Get('auth/view')
    async getViewSchedule(@Query() query: {page?: number}): Promise<{schedule: Schedule, pages: number}> {
        return await this.scheduleService.getViewSchedule(query);
    }

    @Get('auth/last/data')
    async getLastDataSchedule(): Promise<Schedule> {
        return await this.scheduleService.getLastData();
    }

    @Get('auth/last')
    async getLastSchedule(): Promise<Schedule> {
        return await this.scheduleService.getLast();
    }

    @Put('upload')
    @UseInterceptors(FilesInterceptor('file'))
    async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
        return await this.scheduleService.excelToSchedule(files);
    }

    @Put('check')
    async scheduleValid(@Body() weeks: Shift[][]): Promise<string[]> {
        return await this.scheduleService.scheduleValid(weeks);
    }

    @Get('table/:id')
    async getScheduleTable(@Param('id') id: string): Promise<{counts: {name: string, night: number, weekend: number, [key: string]: number|string}[], total: {night: number, weekend: number, [key: string]: number}, weeksKeys: string[]}> {
        return await this.scheduleService.scheduleTable(id);
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
