/// <reference types="multer" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
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
    }, userId: string): Promise<{
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
    getScheduleShifts(id: string): Promise<{
        schedule: {
            weeks: {
                shift: string | import("mongoose").Schema.Types.ObjectId | import("../structure/structure.model").Structure;
                days: string[];
            }[][];
            num_weeks: number;
            date: Date;
            days: Date[][];
        };
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
