import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserID } from 'src/middleware/auth.middlware';
import { Schedule } from 'src/schedule/schedule.model';
import { Shift } from './shift.model';

@Injectable()
export class ShiftService {

    constructor(@InjectModel('Shift') private readonly shiftModel: Model<Shift>, @InjectModel('Schedule') private readonly scheduleModel: Model<Schedule>) {}


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
            let weeks: {morning: boolean[], noon: boolean[], night: boolean[], pull: boolean[], reinforcement: boolean[], notes: string[]}[] = [];
            let schedule = await this.scheduleModel.findById(scheduleId);
            for (let i = 0; i < schedule.num_weeks; i++) {
                weeks.push({
                    morning: [false, false, false, false, false, false, false],
                    noon: [false, false, false, false, false, false, false],
                    night: [false, false, false, false, false, false, false],
                    pull: [true, true, true, true, true, true, true],
                    reinforcement: [false, false, false, false, false, false, false],
                    notes: ["", "", "", "", "", "", ""]
                });
            }
            let newShift = new this.shiftModel({ userId: userId, scheduleId: scheduleId, weeks});
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
