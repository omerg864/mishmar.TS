"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureModule = void 0;
const structure_model_1 = require("./structure.model");
const mongoose_1 = require("@nestjs/mongoose");
const common_1 = require("@nestjs/common");
const structure_controller_1 = require("./structure.controller");
const structure_service_1 = require("./structure.service");
const user_model_1 = require("../user/user.model");
const auth_middlware_1 = require("../middleware/auth.middlware");
let StructureModule = class StructureModule {
    configure(consumer) {
        consumer.apply(auth_middlware_1.SiteManagerMiddleware).forRoutes(structure_controller_1.StructureController);
    }
};
StructureModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: 'Structure', schema: structure_model_1.StructureScheme }, { name: 'User', schema: user_model_1.UserScheme }])],
        controllers: [structure_controller_1.StructureController],
        providers: [structure_service_1.StructureService]
    })
], StructureModule);
exports.StructureModule = StructureModule;
//# sourceMappingURL=structure.module.js.map