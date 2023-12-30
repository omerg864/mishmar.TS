"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModule = void 0;
const schedule_model_1 = require("./../schedule/schedule.model");
const event_model_1 = require("./event.model");
const common_1 = require("@nestjs/common");
const event_controller_1 = require("./event.controller");
const event_service_1 = require("./event.service");
const mongoose_1 = require("@nestjs/mongoose");
const user_model_1 = require("../user/user.model");
const auth_middleware_1 = require("../middleware/auth.middleware");
let EventModule = class EventModule {
    configure(consumer) {
        consumer
            .apply(auth_middleware_1.SiteManagerMiddleware)
            .forRoutes({ path: 'api/events/*', method: common_1.RequestMethod.DELETE });
        consumer
            .apply(auth_middleware_1.SiteManagerMiddleware)
            .forRoutes({ path: 'api/events', method: common_1.RequestMethod.PATCH });
        consumer
            .apply(auth_middleware_1.SiteManagerMiddleware)
            .forRoutes({
            path: 'api/events/many',
            method: common_1.RequestMethod.PATCH,
        });
        consumer
            .apply(auth_middleware_1.SiteManagerMiddleware)
            .forRoutes({ path: 'api/events', method: common_1.RequestMethod.POST });
        consumer
            .apply(auth_middleware_1.SiteManagerMiddleware)
            .forRoutes({ path: 'api/events/:id', method: common_1.RequestMethod.GET });
        consumer
            .apply(auth_middleware_1.SiteManagerMiddleware)
            .forRoutes({
            path: 'api/events/manager/schedule/:scheduleId',
            method: common_1.RequestMethod.GET,
        });
        consumer
            .apply(auth_middleware_1.AuthMiddleware)
            .forRoutes({
            path: 'api/events/schedule/*',
            method: common_1.RequestMethod.GET,
        });
    }
};
EventModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'Event', schema: event_model_1.EventScheme },
                { name: 'Schedule', schema: schedule_model_1.ScheduleScheme },
                { name: 'User', schema: user_model_1.UserScheme },
            ]),
        ],
        controllers: [event_controller_1.EventController],
        providers: [event_service_1.EventService],
    })
], EventModule);
exports.EventModule = EventModule;
//# sourceMappingURL=event.module.js.map