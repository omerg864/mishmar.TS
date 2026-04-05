import { Settings } from '../settings/settings.model';
import { StreamableFile } from '@nestjs/common';
import { Model } from 'mongoose';
import { Schedule } from '../schedule/schedule.model';
import { User } from '../user/user.model';
import { Shift, ShiftScheduleWeek } from './shift.model';
import { EventInterface } from '../event/event.model';
export declare class ShiftService {
    private readonly shiftModel;
    private readonly userModel;
    private readonly scheduleModel;
    private readonly settingsModel;
    constructor(shiftModel: Model<Shift>, userModel: Model<User>, scheduleModel: Model<Schedule>, settingsModel: Model<Settings>);
    getAll(query: {
        userId: string;
        scheduleId: string;
    }): Promise<Shift[]>;
    scheduleShifts(scheduleId: string): Promise<{
        weeks: ShiftScheduleWeek[];
        weeksNotes: string[];
        generalNotes: string;
        users: {
            nickname: string;
            id: string;
        }[];
        noUsers: {
            nickname: string;
            id: string;
        }[];
        minUsers: {
            nickname: string;
            id: string;
            morning: number[];
            noon: number[];
        }[];
    }>;
    toExcel(weeks: ShiftScheduleWeek[], days: string[][], num_users: number, weeksNotes: string[], generalNotes: string, events: EventInterface[], scheduleId: string): Promise<StreamableFile>;
    createNewShift(userId: string, scheduleId: string): Promise<Shift>;
    getUserScheduleShift(userId: string, scheduleId: string): Promise<Shift>;
    update(shift: Shift, userId: string): Promise<Shift>;
    delete(id: string): Promise<{
        id: string;
    }>;
}
