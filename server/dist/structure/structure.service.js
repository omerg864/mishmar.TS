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
exports.StructureService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("@nestjs/mongoose");
let StructureService = class StructureService {
    constructor(structureModel) {
        this.structureModel = structureModel;
    }
    async createStructure(structure) {
        return this.structureModel.create(structure);
    }
    async updateStructure(structure) {
        const structureFound = this.structureModel.findById(structure.id);
        if (!structureFound) {
            throw new common_1.NotFoundException('Structure not found');
        }
        return this.structureModel.findByIdAndUpdate(structure.id, structure, { new: true });
    }
    async deleteStructure(id) {
        const structure = await this.structureModel.findById(id);
        if (!structure) {
            throw new common_1.NotFoundException('Structure not found');
        }
        await structure.remove();
        return structure.id.toString();
    }
    async getAll() {
        return this.structureModel.find();
    }
    async getStructure(id) {
        return this.structureModel.findById(id);
    }
};
StructureService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)('Structure')),
    __metadata("design:paramtypes", [mongoose_1.Model])
], StructureService);
exports.StructureService = StructureService;
//# sourceMappingURL=structure.service.js.map