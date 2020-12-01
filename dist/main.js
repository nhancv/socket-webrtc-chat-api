"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./utils/all-exceptions.filter");
const common_1 = require("@nestjs/common");
const migration_module_1 = require("./migration/migration.module");
const migration_service_1 = require("./migration/migration.service");
async function bootstrap() {
    var _a;
    const logger = new common_1.Logger('main');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalPipes(new common_1.ValidationPipe());
    if (process.env.ENV == 'dev') {
        const changeLog = `
### Change log
- 
`;
        const options = new swagger_1.DocumentBuilder()
            .setVersion((_a = process.env.npm_package_version) !== null && _a !== void 0 ? _a : '')
            .setTitle('freehang api')
            .setDescription(changeLog)
            .addTag('default')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, options);
        swagger_1.SwaggerModule.setup('docs', app, document);
    }
    const migrationService = app.select(migration_module_1.MigrationModule).get(migration_service_1.MigrationService, { strict: true });
    await migrationService.migrate();
    const port = process.env.ENV === 'dev' ? 3001 : 3000;
    await app.listen(port, '0.0.0.0');
    logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().then();
//# sourceMappingURL=main.js.map