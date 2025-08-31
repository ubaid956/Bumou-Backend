"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: ['log', 'error', 'warn', 'debug', 'verbose'],
        });
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true }));
        const configService = app.get(config_1.ConfigService);
        app.enableCors();
        console.log(`Listening on port ${process.env.PORT || 3000}`);
        const PORT = process.env.PORT || 3000;
        await app.listen(PORT, '0.0.0.0');
        console.log('Application started successfully.');
    }
    catch (error) {
        console.error('Error starting application:', error);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map