"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReinforcementModule = void 0;
const common_1 = require("@nestjs/common");
const reinforcement_controller_1 = require("./reinforcement.controller");
const reinforcement_service_1 = require("./reinforcement.service");
const mongoose_1 = require("@nestjs/mongoose");
const reinforcement_model_1 = require("./reinforcement.model");
let ReinforcementModule = class ReinforcementModule {
};
ReinforcementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'Reinforcement', schema: reinforcement_model_1.ReinforcementScheme },
            ]),
        ],
        controllers: [reinforcement_controller_1.ReinforcementController],
        providers: [reinforcement_service_1.ReinforcementService]
    })
], ReinforcementModule);
exports.ReinforcementModule = ReinforcementModule;
//# sourceMappingURL=reinforcement.module.js.map