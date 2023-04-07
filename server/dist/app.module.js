"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const user_module_1 = require("./user/user.module");
const schedule_module_1 = require("./schedule/schedule.module");
const shift_module_1 = require("./shift/shift.module");
const event_module_1 = require("./event/event.module");
const post_module_1 = require("./post/post.module");
const settings_module_1 = require("./settings/settings.module");
const structure_module_1 = require("./structure/structure.module");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const log_module_1 = require("./log/log.module");
const path = require("path");
const dotenv = require("dotenv");
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({
        path: path.resolve(__dirname, '../.env'),
    });
}
const imports = [
    user_module_1.UserModule,
    schedule_module_1.ScheduleModule,
    shift_module_1.ShiftModule,
    event_module_1.EventModule,
    post_module_1.PostModule,
    settings_module_1.SettingsModule,
    structure_module_1.StructureModule,
    log_module_1.LogModule,
    config_1.ConfigModule.forRoot(),
    mongoose_1.MongooseModule.forRoot(`${process.env.MONGODB}`),
];
if (process.env.NODE_ENV === 'production') {
    imports.push(serve_static_1.ServeStaticModule.forRoot({
        rootPath: path.join(__dirname, '../../client/build'),
    }));
}
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports,
        controllers: [],
        providers: [],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map