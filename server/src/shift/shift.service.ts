import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserID } from 'src/middleware/auth.middlware';
import { Shift } from './shift.model';

@Injectable()
export class ShiftService {

    constructor(@InjectModel('Shift') private readonly shiftModel: Model<Shift>) {}


    async getAll(): Promise<Shift[]> {
        return await this.shiftModel.find();
    }

    async getShift(id: string): Promise<Shift> {
        const shift = await this.shiftModel.findById(id);
        if (!shift) {
            throw new NotFoundException('Shift not found');
        }
        return shift;
    }

    async getUserScheduleShift(userId: string, scheduleId: string): Promise<Shift> {
        let shiftFound = await this.shiftModel.findOne( { userId: userId, scheduleId: scheduleId});
        if (!shiftFound) {
            let weeks: {morning: boolean, noon: boolean, night: boolean, pull: boolean, reinforcement: boolean, notes: string}[] = [];
            
            let newShift = new this.shiftModel({ userId: userId, scheduleId: scheduleId});
            await newShift.save();
            return newShift;
        }
        return shiftFound;
    }

    async create(shift: Shift): Promise<Shift> {
        return await this.shiftModel.create(shift);
    }

    async update(shift: Shift): Promise<Shift> {
        const shiftFound = await this.shiftModel.findById(shift._id);
        if (!shiftFound) {
            throw new NotFoundException('Shift not found');
        }
        return await this.shiftModel.findByIdAndUpdate(shift._id, shift, { new: true });
    }

    async delete(id: string): Promise<string> {
        const shiftFound = await this.shiftModel.findById(id);
        if (!shiftFound) {
            throw new NotFoundException('Shift not found');
        }
        await this.shiftModel.findByIdAndRemove(id);
        return shiftFound._id.toString();
    }

}
