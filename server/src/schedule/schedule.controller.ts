import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
	Query,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Schedule } from './schedule.model';
import { ScheduleService, Shift } from './schedule.service';
import { ReinforcementInterface } from '../reinforcement/reinforcement.model';
import { UserID } from '../middleware/auth.middleware';


interface ShiftUser {
	nickname: string;
	morning: number;
	noon: number;
	night: number;
	friday_noon: number;
	weekend_night: number;
	weekend_day: number;
}

@Controller('api/schedules')
export class ScheduleController {
	constructor(private readonly scheduleService: ScheduleService) {}


	@Get('auth/all')
	async getAllSchedules(
		@Query() query: { page?: number }
	): Promise<{ schedules: Schedule[]; pages: number }> {
		return await this.scheduleService.getAll(query);
	}

	@Get('auth/view')
	async getViewSchedule(
		@Query() query: { page?: number },
		@UserID() userId: string,
	): Promise<{ schedule: Schedule; pages: number }> {
		return await this.scheduleService.getViewSchedule(query, userId);
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
	async uploadFile(
		@UploadedFiles() files: Express.Multer.File[],
		@Body('scheduleId') scheduleId: string
	) {
		return await this.scheduleService.excelToSchedule(files, scheduleId);
	}

	@Put('check')
	async scheduleValid(@Body() weeks: Shift[][]): Promise<string[]> {
		return await this.scheduleService.scheduleValid(weeks);
	}

	@Get('table/:id')
	async getScheduleTable(
		@Param('id') id: string
	): Promise<{
		counts: {
			name: string;
			night: number;
			weekend: number;
			[key: string]: number | string;
		}[];
		total: { night: number; weekend: number; [key: string]: number };
		weeksKeys: string[];
	}> {
		return await this.scheduleService.scheduleTable(id);
	}

	@Get(':id')
	async getSchedule(@Param('id') id: string): Promise<{schedule: Schedule, reinforcements: ReinforcementInterface[][][]}> {
		return await this.scheduleService.getSchedule(id);
	}

	@Post('shifts')
	async getShifts(@Body() date: { month: number, year: number}): Promise<{ [key: string] :ShiftUser}> {
		return await this.scheduleService.getShifts(date);
	}

	@Post()
	async createSchedule(@Body() schedule: Schedule): Promise<Schedule> {
		return await this.scheduleService.create(schedule);
	}

	@Delete(':id')
	async deleteSchedule(@Param('id') id: string): Promise<{ id: string }> {
		return await this.scheduleService.delete(id);
	}

	@Patch()
	async updateSchedule(
		@Body() body: {
			schedule: Schedule;
			reinforcements: ReinforcementInterface[];
			deletedReinforcements: ReinforcementInterface[];
			reset: boolean;
		}
	): Promise<{ success: boolean }> {
		const { schedule, reinforcements, reset, deletedReinforcements } = body;
		return await this.scheduleService.update(schedule, reinforcements, deletedReinforcements, reset);
	}
}
