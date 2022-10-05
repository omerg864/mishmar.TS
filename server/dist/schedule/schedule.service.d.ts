import { Model } from 'mongoose';
import { Schedule } from './schedule.model';
export declare class ScheduleService {
    private readonly scheduleModel;
    constructor(scheduleModel: Model<Schedule>);
    getAll(): Promise<Schedule[]>;
    getSchedule(id: string): Promise<Schedule>;
    create(schedule: Schedule): Promise<Schedule>;
    update(schedule: Schedule): Promise<Schedule>;
    delete(id: string): Promise<string>;
}
