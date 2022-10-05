import { EventInterface } from './event.model';
import { EventService } from './event.service';
export declare class EventController {
    private readonly eventService;
    constructor(eventService: EventService);
    getAllEvents(): Promise<EventInterface[]>;
    getEvent(id: string): Promise<EventInterface>;
    createEvent(body: EventInterface): Promise<EventInterface>;
    patchEvent(body: EventInterface): Promise<EventInterface>;
    deleteEvent(id: string): Promise<string>;
}
