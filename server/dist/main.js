"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    if (process.env.NODE_ENV === 'production') {
        console.log(`Server is running on production mode`);
    }
    await app.listen(process.env.PORT);
}
bootstrap();
//# sourceMappingURL=main.js.map