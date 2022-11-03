/// <reference types="multer" />
import { Model } from 'mongoose';
import { Structure } from '../structure/structure.model';
import { Schedule } from './schedule.model';
import * as XLSX from 'xlsx';
import { User } from '../user/user.model';
import { Settings } from '../settings/settings.model';
export declare type Shift = {
    shift: string | Structure;
    days: string[];
};
declare type dayShifts = "morning" | "noon" | "night";
declare type ExcelWeeksData = {
    morning: {
        name: string;
        pull: boolean;
    }[];
    noon: {
        name: string;
        pull: boolean;
    }[];
    night: {
        name: string;
        pull: boolean;
    }[];
}[][];
export declare class ScheduleService {
    private readonly scheduleModel;
    private readonly structureModel;
    private readonly userModel;
    private readonly settingsModel;
    constructor(scheduleModel: Model<Schedule>, structureModel: Model<Structure>, userModel: Model<User>, settingsModel: Model<Settings>);
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
    getSchedule(id: string): Promise<Schedule>;
    create(schedule: Schedule): Promise<Schedule>;
    update(schedule: Schedule): Promise<Schedule>;
    delete(id: string): Promise<{
        id: string;
    }>;
}
export {};
