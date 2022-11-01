"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express_1 = require("express");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: true
    });
    if (process.env.NODE_ENV === 'production') {
        app.use(express_1.default.static((0, path_1.join)(__dirname, '..', '..', 'client', 'build')));
    }
    await app.listen(process.env.PORT || 3000, () => {
        if (process.env.NODE_ENV === 'production') {
            console.log(`Server is running on production mode`);
        }
        else {
            console.log(`Server is running on dev mode`);
        }
    });
}
bootstrap();
//# sourceMappingURL=main.js.map