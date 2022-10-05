import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule } from './schedule.model';

@Injectable()
export class ScheduleService {

    constructor(@InjectModel('Schedule') private readonly scheduleModel: Model<Schedule>) {}


    async getAll(): Promise<Schedule[]> {
        return await this.scheduleModel.find();
    }

    async getSchedule(id: string): Promise<Schedule> {
        const schedule = await this.scheduleModel.findById(id);
        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }
        return schedule;
    }

    async create(schedule: Schedule): Promise<Schedule> {
        return await this.scheduleModel.create(schedule);
    }

    async update(schedule: Schedule): Promise<Schedule> {
        const scheduleFound = await this.scheduleModel.findById(schedule.id);
        if (!scheduleFound) {
            throw new NotFoundException('Schedule not found');
        }
        return await this.scheduleModel.findByIdAndUpdate(schedule.id, schedule, { new: true });
    }

    async delete(id: string): Promise<string> {
        const schedule = await this.scheduleModel.findById(id);
        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }
        await schedule.remove();
        return schedule._id.toString();
    }
}
