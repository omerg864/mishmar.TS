"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const sanitize_middleware_js_1 = __importDefault(require("./middleware/sanitize.middleware.js"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: {
            origin: process.env.SITE_ADDRESS,
            credentials: true,
        },
        logger: ['error', 'warn', 'log'],
    });
    app.use((0, express_mongo_sanitize_1.default)());
    app.use(sanitize_middleware_js_1.default);
    app.use((0, cookie_parser_1.default)());
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