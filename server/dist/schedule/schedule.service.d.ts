/// <reference types="multer" />
import { Model } from 'mongoose';
import { Structure } from '../structure/structure.model';
import { Schedule } from './schedule.model';
import * as XLSX from 'xlsx';
import { User } from 'src/user/user.model';
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
    constructor(scheduleModel: Model<Schedule>, structureModel: Model<Structure>, userModel: Model<User>);
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
    excelToSchedule(files: Express.Multer.File[], scheduleId: string): Promise<void>;
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
