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
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ScheduleService = class ScheduleService {
    constructor(scheduleModel) {
        this.scheduleModel = scheduleModel;
    }
    async getAll() {
        return await this.scheduleModel.find();
    }
    async getSchedule(id) {
        const schedule = await this.scheduleModel.findById(id);
        if (!schedule) {
            throw new common_1.NotFoundException('Schedule not found');
        }
        return schedule;
    }
    async create(schedule) {
        return await this.scheduleModel.create(schedule);
    }
    async update(schedule) {
        const scheduleFound = await this.scheduleModel.findById(schedule.id);
        if (!scheduleFound) {
            throw new common_1.NotFoundException('Schedule not found');
        }
        return await this.scheduleModel.findByIdAndUpdate(schedule.id, schedule, { new: true });
    }
    async delete(id) {
        const schedule = await this.scheduleModel.findById(id);
        if (!schedule) {
            throw new common_1.NotFoundException('Schedule not found');
        }
        await schedule.remove();
        return schedule._id.toString();
    }
};
ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Schedule')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ScheduleService);
exports.ScheduleService = ScheduleService;
//# sourceMappingURL=schedule.service.js.map