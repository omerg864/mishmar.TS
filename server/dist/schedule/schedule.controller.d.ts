import { Schedule } from './schedule.model';
import { ScheduleService } from './schedule.service';
export declare class ScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: ScheduleService);
    getAllSchedules(): Promise<Schedule[]>;
    getSchedule(id: string): Promise<Schedule>;
    createSchedule(schedule: Schedule): Promise<Schedule>;
    deleteSchedule(id: string): Promise<string>;
    updateSchedule(schedule: Schedule): Promise<Schedule>;
}
