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
exports.StructureController = void 0;
const common_1 = require("@nestjs/common");
const structure_service_1 = require("./structure.service");
let StructureController = class StructureController {
    constructor(structureService) {
        this.structureService = structureService;
    }
    async createStructure(strucure, scheduleAdd) {
        return this.structureService.createStructure(strucure, scheduleAdd);
    }
    async deleteStructure(id) {
        return this.structureService.deleteStructure(id);
    }
    async updateStructure(structure) {
        return this.structureService.updateStructure(structure);
    }
    async updateManyStructures(structures) {
        return this.structureService.updateManyStructures(structures);
    }
    async getAll() {
        return this.structureService.getAll();
    }
    async getStructure(id) {
        return this.structureService.getStructure(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('structure')),
    __param(1, (0, common_1.Body)('scheduleAdd')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", Promise)
], StructureController.prototype, "createStructure", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StructureController.prototype, "deleteStructure", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StructureController.prototype, "updateStructure", null);
__decorate([
    (0, common_1.Patch)('many'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], StructureController.prototype, "updateManyStructures", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StructureController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StructureController.prototype, "getStructure", null);
StructureController = __decorate([
    (0, common_1.Controller)('api/structures'),
    __metadata("design:paramtypes", [structure_service_1.StructureService])
], StructureController);
exports.StructureController = StructureController;
//# sourceMappingURL=structure.controller.js.map