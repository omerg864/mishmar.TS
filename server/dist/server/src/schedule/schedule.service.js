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
    constructor(scheduleModel, structureModel) {
        this.scheduleModel = scheduleModel;
        this.structureModel = structureModel;
        this.addDays = (date, days) => {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        };
    }
    async populateSchedule(schedule) {
        let schedule_temp = Object.assign({}, schedule["_doc"]);
        let weeks_tmp = [];
        for (let i = 0; i < schedule.weeks.length; i++) {
            let week_tmp = new Map();
            for (let obj of schedule.weeks[i].keys()) {
                let model_obj = await this.structureModel.findById(schedule.weeks[i].get(obj).shift);
                week_tmp.set(obj, { shift: model_obj, value: schedule.weeks[i].get(obj).value });
            }
            weeks_tmp.push(Object.assign({}, ...Array.from(week_tmp.entries()).map(([k, v]) => ({ [k]: v }))));
        }
        schedule_temp.weeks = weeks_tmp;
        return schedule_temp;
    }
    async getAll() {
        let schedules = await this.scheduleModel.find().sort({ date: -1 });
        let schedules_temp = [];
        for (let j = 0; j < schedules.length; j++) {
            let schedule_temp = await this.populateSchedule(schedules[j]);
            schedules_temp.push(schedule_temp);
        }
        return schedules_temp;
    }
    calculateDays(schedule) {
        let days_tmp = [];
        let firstDate = new Date(schedule.date);
        for (let j = 0; j < schedule.num_weeks; j++) {
            days_tmp[j] = [];
            for (let i = j * 7; i < (j + 1) * 7; i++) {
                days_tmp[j].push(this.addDays(firstDate, i));
            }
        }
        return days_tmp;
    }
    async getSchedule(id) {
        let schedule = await this.scheduleModel.findById(id);
        if (!schedule) {
            throw new common_1.NotFoundException('Schedule not found');
        }
        schedule = await this.populateSchedule(schedule);
        console.log(schedule);
        let days = this.calculateDays(schedule);
        return Object.assign(Object.assign({}, schedule), { days });
    }
    async create(schedule) {
        const rows = await this.structureModel.find().sort({ shift: 1, index: 1 });
        let weeks = [];
        for (let i = 0; i < schedule.num_weeks; i++) {
            weeks[i] = new Map();
            for (let j = 0; j < rows.length; j++) {
                weeks[i].set(rows[j]._id.toString(), { shift: rows[j]._id.toString(), value: '' });
            }
        }
        return await this.scheduleModel.create(Object.assign(Object.assign({}, schedule), { weeks }));
    }
    async update(schedule) {
        let scheduleFound = await this.scheduleModel.findById(schedule.id);
        if (!scheduleFound) {
            throw new common_1.NotFoundException('Schedule not found');
        }
        scheduleFound: Schedule = this.scheduleModel.findByIdAndUpdate(schedule.id, schedule, { new: true });
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
    __param(1, (0, mongoose_1.InjectModel)('Structure')),
    __metadata("design:paramtypes", [mongoose_2.Model, mongoose_2.Model])
], ScheduleService);
exports.ScheduleService = ScheduleService;
//# sourceMappingURL=schedule.service.js.map