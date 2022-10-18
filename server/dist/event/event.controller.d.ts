import { User } from '../user/user.model';
import { EventInterface } from './event.model';
import { EventService } from './event.service';
export declare class EventController {
    private readonly eventService;
    constructor(eventService: EventService);
    getAllEvents(query: {
        page?: number;
    }): Promise<{
        events: EventInterface[];
        users: User[];
        pages: number;
    }>;
    getUserEventsSchedule(scheduleId: string, userId: string): Promise<EventInterface[]>;
    getEvent(id: string): Promise<EventInterface>;
    createEvent(body: EventInterface): Promise<EventInterface>;
    patchManyEvents(body: EventInterface[]): Promise<EventInterface[]>;
    patchEvent(body: EventInterface): Promise<EventInterface>;
    deleteEvent(id: string): Promise<{
        id: string;
    }>;
}
