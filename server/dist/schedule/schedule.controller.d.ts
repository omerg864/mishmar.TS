import { Schedule } from './schedule.model';
import { ScheduleService, Shift } from './schedule.service';
export declare class ScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: ScheduleService);
    getAllSchedules(query: {
        page?: number;
    }): Promise<{
        schedules: Schedule[];
        pages: number;
    }>;
    getViewSchedule(query: {
        page?: number;
    }): Promise<{
        schedule: Schedule;
        pages: number;
    }>;
    getLastDataSchedule(): Promise<Schedule>;
    getLastSchedule(): Promise<Schedule>;
    scheduleValid(weeks: Shift[][]): Promise<string[]>;
    getSchedule(id: string): Promise<Schedule>;
    createSchedule(schedule: Schedule): Promise<Schedule>;
    deleteSchedule(id: string): Promise<{
        id: string;
    }>;
    updateSchedule(schedule: Schedule): Promise<Schedule>;
}