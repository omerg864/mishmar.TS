"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const user_controller_1 = require("./user.controller");
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const mongoose_1 = require("@nestjs/mongoose");
const user_model_1 = require("./user.model");
const auth_middlware_1 = require("../middleware/auth.middlware");
let UserModule = class UserModule {
    configure(consumer) {
        consumer.apply(auth_middlware_1.AuthMiddleware).forRoutes({ path: 'user', method: common_1.RequestMethod.PATCH });
        consumer.apply(auth_middlware_1.SiteManagerMiddleware).forRoutes({ path: 'user/:id', method: common_1.RequestMethod.DELETE });
        consumer.apply(auth_middlware_1.SiteManagerMiddleware).forRoutes('user/all');
    }
};
UserModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: 'User', schema: user_model_1.UserScheme }])],
        controllers: [user_controller_1.UserController],
        providers: [user_service_1.UserService]
    })
], UserModule);
exports.UserModule = UserModule;
//# sourceMappingURL=user.module.js.map