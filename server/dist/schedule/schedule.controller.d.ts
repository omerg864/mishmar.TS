/// <reference types="multer" />
import { Schedule } from './schedule.model';
import { ScheduleService, Shift } from './schedule.service';
import { ReinforcementInterface } from '../reinforcement/reinforcement.model';
interface ShiftUser {
    nickname: string;
    morning: number;
    noon: number;
    night: number;
    friday_noon: number;
    weekend_night: number;
    weekend_day: number;
}
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
    uploadFile(files: Express.Multer.File[], scheduleId: string): Promise<{
        message: string;
    }>;
    scheduleValid(weeks: Shift[][]): Promise<string[]>;
    getScheduleTable(id: string): Promise<{
        counts: {
            name: string;
            night: number;
            weekend: number;
            [key: string]: number | string;
        }[];
        total: {
            night: number;
            weekend: number;
            [key: string]: number;
        };
        weeksKeys: string[];
    }>;
    getSchedule(id: string): Promise<{
        schedule: Schedule;
        reinforcements: ReinforcementInterface[][][];
    }>;
    getShifts(date: {
        month: number;
        year: number;
    }): Promise<{
        [key: string]: ShiftUser;
    }>;
    createSchedule(schedule: Schedule): Promise<Schedule>;
    deleteSchedule(id: string): Promise<{
        id: string;
    }>;
    updateSchedule(body: {
        schedule: Schedule;
        reinforcements: ReinforcementInterface[];
        deletedReinforcements: ReinforcementInterface[];
        reset: boolean;
    }): Promise<{
        success: boolean;
    }>;
}
export {};
