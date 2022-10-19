import { Model } from 'mongoose';
import { Structure } from '../structure/structure.model';
import { Schedule } from './schedule.model';
export declare type Shift = {
    shift: string | Structure;
    days: string[];
};
export declare class ScheduleService {
    private readonly scheduleModel;
    private readonly structureModel;
    constructor(scheduleModel: Model<Schedule>, structureModel: Model<Structure>);
    sortStructures: (a: Shift, b: Shift) => 0 | 1 | -1;
    populateSchedule(schedule: Schedule): Promise<Schedule>;
    getViewSchedule(query: {
        page?: number;
    }): Promise<{
        schedule: Schedule;
        pages: number;
    }>;
    getAll(query: {
        page?: number;
    }): Promise<{
        schedules: Schedule[];
        pages: number;
    }>;
    getLast(): Promise<Schedule>;
    getLastData(): Promise<Schedule>;
    calculateDays(schedule: Schedule): Date[][];
    arrayDuplicates: (arr: string[]) => string[];
    toShiftNamesArray: (shifts: Shift[], day: number) => string[];
    compareTwoArrays(arr1: string[], arr2: string[]): string[];
    scheduleValid(weeks: Shift[][]): Promise<string[]>;
    getSchedule(id: string): Promise<Schedule>;
    create(schedule: Schedule): Promise<Schedule>;
    update(schedule: Schedule): Promise<Schedule>;
    delete(id: string): Promise<{
        id: string;
    }>;
}
