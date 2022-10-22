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
exports.ShiftController = void 0;
const common_1 = require("@nestjs/common");
const auth_middlware_1 = require("../middleware/auth.middlware");
const shift_service_1 = require("./shift.service");
let ShiftController = class ShiftController {
    constructor(shiftService) {
        this.shiftService = shiftService;
    }
    async getAll(query) {
        return this.shiftService.getAll(query);
    }
    async scheduleShifts(id) {
        return await this.shiftService.scheduleShifts(id);
    }
    async getUserScheduleShiftManager(userId, scheduleId) {
        return this.shiftService.getUserScheduleShift(userId, scheduleId);
    }
    async getUserScheduleShift(userId, scheduleId) {
        return this.shiftService.getUserScheduleShift(userId, scheduleId);
    }
    async toExcel(weeks, days, num_users, weeksNotes, generalNotes, events) {
        return await this.shiftService.toExcel(weeks, days, num_users, weeksNotes, generalNotes, events);
    }
    async deleteShift(id) {
        return this.shiftService.delete(id);
    }
    async patchShift(shift, userId) {
        return this.shiftService.update(shift, userId);
    }
};
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('schedule/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "scheduleShifts", null);
__decorate([
    (0, common_1.Get)('user/:userId/:scheduleId/manager'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('scheduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "getUserScheduleShiftManager", null);
__decorate([
    (0, common_1.Get)('user/:scheduleId'),
    __param(0, (0, auth_middlware_1.UserID)()),
    __param(1, (0, common_1.Param)('scheduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "getUserScheduleShift", null);
__decorate([
    (0, common_1.Put)('excel'),
    __param(0, (0, common_1.Body)('weeks')),
    __param(1, (0, common_1.Body)('days')),
    __param(2, (0, common_1.Body)('num_users')),
    __param(3, (0, common_1.Body)('weeksNotes')),
    __param(4, (0, common_1.Body)('generalNotes')),
    __param(5, (0, common_1.Body)('events')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Array, Number, Array, String, Array]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "toExcel", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "deleteShift", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_middlware_1.UserID)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "patchShift", null);
ShiftController = __decorate([
    (0, common_1.Controller)('api/shifts'),
    __metadata("design:paramtypes", [shift_service_1.ShiftService])
], ShiftController);
exports.ShiftController = ShiftController;
//# sourceMappingURL=shift.controller.js.map