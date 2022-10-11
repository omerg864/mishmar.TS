import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { User } from 'src/user/user.model';
import { EventInterface } from './event.model';
import { EventService } from './event.service';

@Controller('event')
export class EventController {

    constructor(private readonly eventService: EventService) { }


    @Get('all')
    async getAllEvents(): Promise<{events: EventInterface[], users: User[]}> {
        return this.eventService.getAll();
    }


    @Get(':id')
    async getEvent(@Param('id') id: string): Promise<EventInterface> {
        return this.eventService.getEvent(id);
    }

    @Post()
    async createEvent(@Body() body: EventInterface): Promise<EventInterface> {
        return this.eventService.createEvent(body);
    }

    @Patch('many')
    async patchManyEvents(@Body() body: EventInterface[]): Promise<EventInterface[]> {
        return this.eventService.updateManyEvents(body);
    }

    @Patch()
    async patchEvent(@Body() body: EventInterface): Promise<EventInterface> {
        return this.eventService.updateEvent(body);
    }

    @Delete(':id')
    async deleteEvent(@Param('id') id: string): Promise<{id : string}> {
        return this.eventService.deleteEvent(id);
    }
}
