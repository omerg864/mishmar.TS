import { StreamableFile } from '@nestjs/common';
import { EventInterface } from '../event/event.model';
import { Shift, ShiftScheduleWeek } from './shift.model';
import { ShiftService } from './shift.service';
export declare class ShiftController {
    private readonly shiftService;
    constructor(shiftService: ShiftService);
    getAll(query: {
        userId: string;
        scheduleId: string;
    }): Promise<Shift[]>;
    scheduleShifts(id: string): Promise<{
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
    getUserScheduleShiftManager(userId: string, scheduleId: string): Promise<Shift>;
    getUserScheduleShift(userId: string, scheduleId: string): Promise<Shift>;
    toExcel(weeks: ShiftScheduleWeek[], days: string[][], num_users: number, weeksNotes: string[], generalNotes: string, events: EventInterface[]): Promise<StreamableFile>;
    deleteShift(id: string): Promise<{
        id: string;
    }>;
    patchShift(shift: Shift, userId: string): Promise<Shift>;
}
