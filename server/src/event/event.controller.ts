import { UserID } from 'src/middleware/auth.middlware';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { User } from 'src/user/user.model';
import { EventInterface } from './event.model';
import { EventService } from './event.service';

@Controller('api/events')
export class EventController {

    constructor(private readonly eventService: EventService) { }


    @Get('all')
    async getAllEvents(@Query() query: {page?: number}): Promise<{events: EventInterface[], users: User[], pages: number}> {
        return this.eventService.getAll(query);
    }

    @Get('schedule/:scheduleId')
    async getUserEventsSchedule(@Param('scheduleId') scheduleId: string, @UserID() userId: string): Promise<EventInterface[]> {
        return await this.eventService.getUserEventsSchedule(scheduleId, userId);
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
