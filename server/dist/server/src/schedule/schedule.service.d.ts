import { Schedule } from './../../../client/src/types/types';
import { Model } from 'mongoose';
import { Structure } from 'src/structure/structure.model';
export declare class ScheduleService {
    private readonly scheduleModel;
    private readonly structureModel;
    constructor(scheduleModel: Model<Schedule>, structureModel: Model<Structure>);
    populateSchedule(schedule: Schedule): Promise<Schedule>;
    getAll(): Promise<Schedule[]>;
    addDays: (date: Date, days: number) => Date;
    calculateDays(schedule: Schedule): Date[][];
    getSchedule(id: string): Promise<Schedule>;
    create(schedule: Schedule): Promise<Schedule>;
    update(schedule: Schedule): Promise<Schedule>;
    delete(id: string): Promise<string>;
}
