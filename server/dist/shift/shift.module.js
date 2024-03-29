"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftModule = void 0;
const settings_model_1 = require("../settings/settings.model");
const schedule_model_1 = require("./../schedule/schedule.model");
const auth_middleware_1 = require("../middleware/auth.middleware");
const shift_model_1 = require("./shift.model");
const common_1 = require("@nestjs/common");
const shift_controller_1 = require("./shift.controller");
const shift_service_1 = require("./shift.service");
const mongoose_1 = require("@nestjs/mongoose");
const user_model_1 = require("../user/user.model");
const auth_middleware_2 = require("../middleware/auth.middleware");
let ShiftModule = class ShiftModule {
    configure(consumer) {
        consumer
            .apply(auth_middleware_2.SiteManagerMiddleware)
            .forRoutes({ path: 'api/shifts/all', method: common_1.RequestMethod.GET });
        consumer
            .apply(auth_middleware_2.SiteManagerMiddleware)
            .forRoutes({
            path: 'api/shifts/user/:userId/:scheduleId/manager',
            method: common_1.RequestMethod.GET,
        });
        consumer
            .apply(auth_middleware_2.SiteManagerMiddleware)
            .forRoutes({
            path: 'api/shifts/schedule/:id',
            method: common_1.RequestMethod.GET,
        });
        consumer
            .apply(auth_middleware_2.SiteManagerMiddleware)
            .forRoutes({ path: 'api/shifts/excel', method: common_1.RequestMethod.PUT });
        consumer
            .apply(auth_middleware_2.AuthMiddleware)
            .forRoutes({ path: 'api/shifts', method: common_1.RequestMethod.PATCH });
        consumer
            .apply(auth_middleware_2.AuthMiddleware)
            .forRoutes({
            path: 'api/shifts/user/:scheduleId',
            method: common_1.RequestMethod.GET,
        });
        consumer
            .apply(auth_middleware_1.AdminManagerMiddleware)
            .forRoutes({ path: 'api/shifts/*', method: common_1.RequestMethod.DELETE });
    }
};
ShiftModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'Shift', schema: shift_model_1.ShiftScheme },
                { name: 'Settings', schema: settings_model_1.SettingsScheme },
                { name: 'Schedule', schema: schedule_model_1.ScheduleScheme },
                { name: 'User', schema: user_model_1.UserScheme },
            ]),
        ],
        controllers: [shift_controller_1.ShiftController],
        providers: [shift_service_1.ShiftService],
    })
], ShiftModule);
exports.ShiftModule = ShiftModule;
//# sourceMappingURL=shift.module.js.map