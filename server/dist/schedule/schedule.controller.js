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
exports.ScheduleController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const schedule_service_1 = require("./schedule.service");
let ScheduleController = class ScheduleController {
    constructor(scheduleService) {
        this.scheduleService = scheduleService;
    }
    async getAllSchedules(query) {
        return await this.scheduleService.getAll(query);
    }
    async getViewSchedule(query) {
        return await this.scheduleService.getViewSchedule(query);
    }
    async getLastDataSchedule() {
        return await this.scheduleService.getLastData();
    }
    async getLastSchedule() {
        return await this.scheduleService.getLast();
    }
    async uploadFile(files, scheduleId) {
        return await this.scheduleService.excelToSchedule(files, scheduleId);
    }
    async scheduleValid(weeks) {
        return await this.scheduleService.scheduleValid(weeks);
    }
    async getScheduleTable(id) {
        return await this.scheduleService.scheduleTable(id);
    }
    async getSchedule(id) {
        return await this.scheduleService.getSchedule(id);
    }
    async getShifts(date) {
        return await this.scheduleService.getShifts(date);
    }
    async createSchedule(schedule) {
        return await this.scheduleService.create(schedule);
    }
    async deleteSchedule(id) {
        return await this.scheduleService.delete(id);
    }
    async updateSchedule(body) {
        const { schedule, reinforcements, reset, deletedReinforcements } = body;
        return await this.scheduleService.update(schedule, reinforcements, deletedReinforcements, reset);
    }
};
__decorate([
    (0, common_1.Get)('auth/all'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getAllSchedules", null);
__decorate([
    (0, common_1.Get)('auth/view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getViewSchedule", null);
__decorate([
    (0, common_1.Get)('auth/last/data'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getLastDataSchedule", null);
__decorate([
    (0, common_1.Get)('auth/last'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getLastSchedule", null);
__decorate([
    (0, common_1.Put)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('file')),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)('scheduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Put)('check'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "scheduleValid", null);
__decorate([
    (0, common_1.Get)('table/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getScheduleTable", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Post)('shifts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getShifts", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "createSchedule", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "deleteSchedule", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "updateSchedule", null);
ScheduleController = __decorate([
    (0, common_1.Controller)('api/schedules'),
    __metadata("design:paramtypes", [schedule_service_1.ScheduleService])
], ScheduleController);
exports.ScheduleController = ScheduleController;
//# sourceMappingURL=schedule.controller.js.map