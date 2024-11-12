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
/// <reference types="mongoose/types/inferschematype" />
import { Model } from 'mongoose';
import { Structure } from '../structure/structure.model';
import { Schedule } from './schedule.model';
import * as XLSX from 'xlsx';
import { User } from '../user/user.model';
import { Settings } from '../settings/settings.model';
import { ReinforcementInterface } from '../reinforcement/reinforcement.model';
export type Shift = {
    shift: string | Structure;
    days: string[];
};
type dayShifts = 'morning' | 'noon' | 'night';
type ExcelWeeksData = {
    morning: {
        name: string;
        pull: boolean;
        seq: false;
    }[];
    noon: {
        name: string;
        pull: boolean;
        seq: false;
    }[];
    night: {
        name: string;
        pull: boolean;
        seq: false;
    }[];
}[][];
export declare class ScheduleService {
    private readonly scheduleModel;
    private readonly structureModel;
    private readonly userModel;
    private readonly settingsModel;
    private readonly reinforcementModel;
    constructor(scheduleModel: Model<Schedule>, structureModel: Model<Structure>, userModel: Model<User>, settingsModel: Model<Settings>, reinforcementModel: Model<ReinforcementInterface>);
    sortStructures: (a: Shift, b: Shift) => 1 | 0 | -1;
    populateSchedule(schedule: Schedule): Promise<Schedule>;
    getScheduleShiftData(id: string): Promise<{
        schedule: {
            weeks: {
                shift: string | import("mongoose").Schema.Types.ObjectId | Structure;
                days: string[];
            }[][];
            num_weeks: number;
            date: Date;
            _id: string | import("mongoose").Schema.Types.ObjectId;
            days: Date[][];
        };
    }>;
    getViewSchedule(query: {
        page?: number;
    }, userId: string): Promise<{
        schedule: Schedule;
        pages: number;
        reinforcements: ReinforcementInterface[][][];
        events: any[];
    }>;
    getEvents(schedule: Schedule, reinforcements: ReinforcementInterface[][][], nickname: string): Promise<any[]>;
    numberToShift(num: number): string;
    shiftToStartTime(num: number): string;
    shiftToEndTime(num: number): string;
    getReinforcement(schedule: Schedule): Promise<ReinforcementInterface[][][]>;
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
    getEndShiftExcel(ws: XLSX.WorkSheet, cell: {
        v?: string;
    } | undefined, index: number, stop: string): {
        cell: {
            v?: string;
        } | undefined;
        index: number;
    };
    getEmptyWeeksArrayShifts(num_weeks: number): ExcelWeeksData;
    searchExcelShift(ws: XLSX.WorkSheet, start: number, end: number, column: number, week: number, day: number, extractedData: ExcelWeeksData, shift: dayShifts): ExcelWeeksData;
    extractDataFromExcel(file: Express.Multer.File, num_weeks: number): ExcelWeeksData;
    assignToShifts(shiftType: dayShifts, shifts: Shift[], data: ExcelWeeksData, inShift: string[], day: number, week: number, managers_names: string[], weeks_tmp: Shift[][], settings: Settings): {
        data: ExcelWeeksData;
        inShift: string[];
        weeks_tmp: Shift[][];
    };
    excelToSchedule(files: Express.Multer.File[], scheduleId: string): Promise<{
        message: string;
    }>;
    scheduleTable(id: string): Promise<{
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
    scheduleValid(weeks: Shift[][]): Promise<string[]>;
    getSchedule(id: string): Promise<{
        schedule: Schedule;
        reinforcements: ReinforcementInterface[][][];
    }>;
    getShifts(date: {
        month: number;
        year: number;
    }): Promise<{}>;
    create(schedule: Schedule): Promise<Schedule>;
    update(schedule: Schedule, reinforcements: ReinforcementInterface[], deletedReinforcements: ReinforcementInterface[], reset: boolean): Promise<{
        success: boolean;
        reinforcements: ReinforcementInterface[];
    }>;
    createAndUpdateReinforcements(reinforcements: ReinforcementInterface[], schedule: Schedule): Promise<{
        success: boolean;
    }>;
    deleteReinforcements(reinforcements: ReinforcementInterface[]): Promise<{
        success: boolean;
    }>;
    updateReinforcement(reinforcement: ReinforcementInterface): Promise<{
        success: boolean;
    }>;
    createReinforcement(reinforcement: ReinforcementInterface, schedule: Schedule): Promise<ReinforcementInterface>;
    delete(id: string): Promise<{
        id: string;
    }>;
}
export {};
