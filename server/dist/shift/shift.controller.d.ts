import { Shift } from './shift.model';
import { ShiftService } from './shift.service';
export declare class ShiftController {
    private readonly shiftService;
    constructor(shiftService: ShiftService);
    getAll(): Promise<Shift[]>;
    getShift(id: string): Promise<Shift>;
    addShift(shift: Shift): Promise<Shift>;
    deleteShift(id: string): Promise<string>;
    patchShift(shift: Shift): Promise<Shift>;
}
