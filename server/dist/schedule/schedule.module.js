"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleModule = void 0;
const structure_model_1 = require("./../structure/structure.model");
const schedule_model_1 = require("./schedule.model");
const common_1 = require("@nestjs/common");
const schedule_controller_1 = require("./schedule.controller");
const schedule_service_1 = require("./schedule.service");
const mongoose_1 = require("@nestjs/mongoose");
const user_model_1 = require("../user/user.model");
const auth_middleware_1 = require("../middleware/auth.middleware");
const settings_model_1 = require("../settings/settings.model");
const reinforcement_model_1 = require("../reinforcement/reinforcement.model");
let ScheduleModule = class ScheduleModule {
    configure(consumer) {
        consumer
            .apply(auth_middleware_1.AuthMiddleware)
            .forRoutes({
            path: 'api/schedules/auth/*',
            method: common_1.RequestMethod.GET,
        });
        consumer
            .apply(auth_middleware_1.SiteManagerMiddleware)
            .forRoutes({
            path: 'api/schedules/:id',
            method: common_1.RequestMethod.GET,
        });
        consumer
            .apply(auth_middleware_1.SiteManagerMiddleware)
            .forRoutes({
            path: 'api/schedules/table/:id',
            method: common_1.RequestMethod.GET,
        });
        consumer
            .apply(auth_middleware_1.SiteManagerMiddleware)
            .forRoutes({ path: 'api/schedules/*', method: common_1.RequestMethod.PUT });
        consumer
            .apply(auth_middleware_1.SiteManagerMiddleware)
            .forRoutes({ path: 'api/schedules', method: common_1.RequestMethod.POST });
        consumer
            .apply(auth_middleware_1.SiteManagerMiddleware)
            .forRoutes({ path: 'api/schedules/shifts', method: common_1.RequestMethod.POST });
        consumer
            .apply(auth_middleware_1.SiteManagerMiddleware)
            .forRoutes({ path: 'api/schedules', method: common_1.RequestMethod.PATCH });
        consumer
            .apply(auth_middleware_1.SiteManagerMiddleware)
            .forRoutes({
            path: 'api/schedules/*',
            method: common_1.RequestMethod.DELETE,
        });
    }
};
ScheduleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'Schedule', schema: schedule_model_1.ScheduleScheme },
                { name: 'User', schema: user_model_1.UserScheme },
                { name: 'Structure', schema: structure_model_1.StructureScheme },
                { name: 'Settings', schema: settings_model_1.SettingsScheme },
                { name: 'Reinforcement', schema: reinforcement_model_1.ReinforcementScheme },
            ]),
        ],
        controllers: [schedule_controller_1.ScheduleController],
        providers: [schedule_service_1.ScheduleService],
    })
], ScheduleModule);
exports.ScheduleModule = ScheduleModule;
//# sourceMappingURL=schedule.module.js.map