"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const functions_1 = require("../functions/functions");
let EventService = class EventService {
    constructor(eventModel, ScheduleModel, userModel) {
        this.eventModel = eventModel;
        this.ScheduleModel = ScheduleModel;
        this.userModel = userModel;
    }
    async getAll(query) {
        if (!query.page || query.page <= 0) {
            query.page = 0;
        }
        else {
            query.page -= 1;
        }
        const eventCount = await this.eventModel.find().count();
        const pages = eventCount > 0 ? Math.ceil(eventCount / 4) : 1;
        const events = await this.eventModel.find().sort({ date: -1 }).skip(query.page * 4).limit(4);
        const users = await this.userModel.find();
        return { events, users, pages };
    }
    async getUserEventsSchedule(scheduleId, userId) {
        const schedule = await this.ScheduleModel.findById(scheduleId);
        const events = await this.eventModel.find({ users: userId, date: { $gte: schedule.date, $lte: (0, functions_1.addDays)(schedule.date, schedule.num_weeks * 7) } }).sort({ date: -1 });
        return events;
    }
    async getEvent(id) {
        const event = await this.eventModel.findById(id);
        if (!event) {
            throw new common_1.NotFoundException('אירוע לא נמצא');
        }
        return event;
    }
    async deleteEvent(eventId) {
        const event = await this.eventModel.findById(eventId);
        if (!event) {
            throw new common_1.NotFoundException('אירוע לא נמצא');
        }
        await this.eventModel.deleteOne({ _id: event._id });
        return { id: event._id.toString() };
    }
    async createEvent(event) {
        try {
            const eventModel = await this.eventModel.create(event);
            return eventModel;
        }
        catch (e) {
            throw new common_1.BadRequestException(e);
        }
    }
    async updateManyEvents(events) {
        let events_temp = [];
        for (let i = 0; i < events.length; i++) {
            const eventFound = await this.eventModel.findOne({ _id: events[i]._id });
            if (!eventFound) {
                throw new common_1.NotFoundException('אירוע לא נמצא');
            }
            events_temp.push(await this.eventModel.findByIdAndUpdate({ _id: events[i]._id }, events[i], { new: true }));
        }
        return events_temp;
    }
    async updateEvent(event) {
        const eventFound = await this.eventModel.findOne({ _id: event.id });
        if (!eventFound) {
            throw new common_1.NotFoundException('אירוע לא נמצא');
        }
        return await this.eventModel.findByIdAndUpdate({ _id: event.id }, event, { new: true });
    }
};
EventService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Event')),
    __param(1, (0, mongoose_1.InjectModel)('Schedule')),
    __param(2, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model, mongoose_2.Model, mongoose_2.Model])
], EventService);
exports.EventService = EventService;
//# sourceMappingURL=event.service.js.map