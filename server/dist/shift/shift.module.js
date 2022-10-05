"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftModule = void 0;
const auth_middlware_1 = require("./../middleware/auth.middlware");
const shift_model_1 = require("./shift.model");
const common_1 = require("@nestjs/common");
const shift_controller_1 = require("./shift.controller");
const shift_service_1 = require("./shift.service");
const mongoose_1 = require("@nestjs/mongoose");
const user_model_1 = require("../user/user.model");
const auth_middlware_2 = require("../middleware/auth.middlware");
let ShiftModule = class ShiftModule {
    configure(consumer) {
        consumer.apply(auth_middlware_2.SiteManagerMiddleware).forRoutes({ path: 'shift/all', method: common_1.RequestMethod.GET });
        consumer.apply(auth_middlware_2.AuthMiddleware).forRoutes({ path: 'shift/:id', method: common_1.RequestMethod.GET });
        consumer.apply(auth_middlware_2.AuthMiddleware).forRoutes({ path: 'shift', method: common_1.RequestMethod.POST });
        consumer.apply(auth_middlware_2.AuthMiddleware).forRoutes({ path: 'shift', method: common_1.RequestMethod.PATCH });
        consumer.apply(auth_middlware_1.AdminManagerMiddleware).forRoutes({ path: 'shift/*', method: common_1.RequestMethod.DELETE });
    }
};
ShiftModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: 'Shift', schema: shift_model_1.ShiftScheme }, { name: 'User', schema: user_model_1.UserScheme }])],
        controllers: [shift_controller_1.ShiftController],
        providers: [shift_service_1.ShiftService]
    })
], ShiftModule);
exports.ShiftModule = ShiftModule;
//# sourceMappingURL=shift.module.js.map