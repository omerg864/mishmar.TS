import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule } from 'src/schedule/schedule.model';
import { User } from 'src/user/user.model';
import { EventInterface } from './event.model';

@Injectable()
export class EventService {

    constructor(@InjectModel('Event') private readonly eventModel: Model<EventInterface>, @InjectModel('Schedule') private readonly ScheduleModel: Model<Schedule>, @InjectModel('User') private readonly userModel: Model<User>) {}

    async getAll(query: {page?: number}): Promise<{events: EventInterface[], users: User[], pages: number}> {
        if (!query.page || query.page <= 0 ) {
            query.page = 0
        } else {
            query.page -= 1;
        }
        const eventCount = await this.eventModel.find().count();
        const pages = eventCount > 0 ? Math.ceil(eventCount / 4) : 1;
        const events = await this.eventModel.find().sort( { date: -1}).skip(query.page * 4).limit(4);
        const users = await this.userModel.find();
        return {events, users, pages};
    }

    addDays = (date: Date, days: number): Date => {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    async getUserEventsSchedule(scheduleId: string, userId: string): Promise<EventInterface[]> {
        const schedule = await this.ScheduleModel.findById(scheduleId);
        const events = await this.eventModel.find({users: userId, date: { $gte : schedule.date, $lte: this.addDays(schedule.date, schedule.num_weeks * 7)}}).sort( { date: -1});
        return events;
    }

    async getEvent(id: string): Promise<EventInterface> {
        const event = await this.eventModel.findById(id);
        if (!event){
            throw new NotFoundException('Event not found');
        }
        return event;
    }

    async deleteEvent(eventId: string): Promise<{id : string}> {
        const event = await this.eventModel.findById(eventId);
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        await this.eventModel.deleteOne({ _id: event._id });
        return { id: event._id.toString() };
    }

    async createEvent(event: EventInterface): Promise<EventInterface> {
        const eventModel = await this.eventModel.create(event);
        return eventModel;
    }

    async updateManyEvents(events: EventInterface[]): Promise<EventInterface[]> {
        let events_temp: EventInterface[] = [];
        for (let i = 0; i < events.length; i++) {
            const eventFound = await this.eventModel.findOne({ _id: events[i]._id });
            if (!eventFound) {
                throw new NotFoundException('Event not found');
            }
            events_temp.push(await this.eventModel.findByIdAndUpdate({ _id: events[i]._id }, events[i], { new: true }));
        }
        return events_temp;
    }

    async updateEvent(event: EventInterface): Promise<EventInterface> {
        const eventFound = await this.eventModel.findOne({ _id: event.id });
        if (!eventFound) {
            throw new NotFoundException('Event not found');
        }
        return await this.eventModel.findByIdAndUpdate({ _id: event.id }, event, { new: true });
    }
}
