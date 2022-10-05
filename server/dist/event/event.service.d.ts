import { Model } from 'mongoose';
import { EventInterface } from './event.model';
export declare class EventService {
    private readonly eventModel;
    constructor(eventModel: Model<EventInterface>);
    getAll(): Promise<EventInterface[]>;
    getEvent(id: string): Promise<EventInterface>;
    deleteEvent(eventId: string): Promise<string>;
    createEvent(event: EventInterface): Promise<EventInterface>;
    updateEvent(event: EventInterface): Promise<EventInterface>;
}
