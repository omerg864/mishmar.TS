import { Model } from 'mongoose';
import { Schedule } from '../schedule/schedule.model';
import { User } from '../user/user.model';
import { EventInterface } from './event.model';
export declare class EventService {
    private readonly eventModel;
    private readonly ScheduleModel;
    private readonly userModel;
    constructor(eventModel: Model<EventInterface>, ScheduleModel: Model<Schedule>, userModel: Model<User>);
    getAll(query: {
        page?: number;
    }): Promise<{
        events: EventInterface[];
        users: User[];
        pages: number;
    }>;
    getUserEventsSchedule(scheduleId: string, userId: string): Promise<EventInterface[]>;
    getEvent(id: string): Promise<EventInterface>;
    deleteEvent(eventId: string): Promise<{
        id: string;
    }>;
    createEvent(event: EventInterface): Promise<EventInterface>;
    updateManyEvents(events: EventInterface[]): Promise<EventInterface[]>;
    updateEvent(event: EventInterface): Promise<EventInterface>;
}
