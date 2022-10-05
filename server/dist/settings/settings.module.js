"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModule = void 0;
const user_model_1 = require("../user/user.model");
const mongoose_1 = require("@nestjs/mongoose");
const common_1 = require("@nestjs/common");
const settings_controller_1 = require("./settings.controller");
const settings_service_1 = require("./settings.service");
const settings_model_1 = require("./settings.model");
const auth_middlware_1 = require("../middleware/auth.middlware");
let SettingsModule = class SettingsModule {
    configure(consumer) {
        consumer.apply(auth_middlware_1.SiteManagerMiddleware).forRoutes({ path: 'settings', method: common_1.RequestMethod.PATCH });
        consumer.apply(auth_middlware_1.AuthMiddleware).forRoutes({ path: 'settings', method: common_1.RequestMethod.GET });
    }
};
SettingsModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: 'Settings', schema: settings_model_1.SettingsScheme }, { name: 'User', schema: user_model_1.UserScheme }])],
        controllers: [settings_controller_1.SettingsController],
        providers: [settings_service_1.SettingsService]
    })
], SettingsModule);
exports.SettingsModule = SettingsModule;
//# sourceMappingURL=settings.module.js.map