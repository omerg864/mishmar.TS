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
exports.ShiftService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ShiftService = class ShiftService {
    constructor(shiftModel) {
        this.shiftModel = shiftModel;
    }
    async getAll() {
        return await this.shiftModel.find();
    }
    async getShift(id) {
        const shift = await this.shiftModel.findById(id);
        if (!shift) {
            throw new common_1.NotFoundException('Shift not found');
        }
        return shift;
    }
    async create(shift) {
        return await this.shiftModel.create(shift);
    }
    async update(shift) {
        const shiftFound = await this.shiftModel.findById(shift.id);
        if (!shiftFound) {
            throw new common_1.NotFoundException('Shift not found');
        }
        return await this.shiftModel.findByIdAndUpdate(shift.id, shift, { new: true });
    }
    async delete(id) {
        const shiftFound = await this.shiftModel.findById(id);
        if (!shiftFound) {
            throw new common_1.NotFoundException('Shift not found');
        }
        await this.shiftModel.findByIdAndRemove(id);
        return shiftFound._id.toString();
    }
};
ShiftService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Shift')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ShiftService);
exports.ShiftService = ShiftService;
//# sourceMappingURL=shift.service.js.map