import { Model } from 'mongoose';
import { Shift } from './shift.model';
export declare class ShiftService {
    private readonly shiftModel;
    constructor(shiftModel: Model<Shift>);
    getAll(): Promise<Shift[]>;
    getShift(id: string): Promise<Shift>;
    create(shift: Shift): Promise<Shift>;
    update(shift: Shift): Promise<Shift>;
    delete(id: string): Promise<string>;
}
