"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const ExpressMongoSanitize = require("express-mongo-sanitize");
const sanitize_middleware_js_1 = require("./middleware/sanitize.middleware.js");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: true,
    });
    app.use(ExpressMongoSanitize());
    app.use(sanitize_middleware_js_1.default);
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