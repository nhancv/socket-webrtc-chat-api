"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.faceDetectionOptions = exports.faceDetectionNet = void 0;
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./utils/all-exceptions.filter");
const common_1 = require("@nestjs/common");
const migration_module_1 = require("./migration/migration.module");
const migration_service_1 = require("./migration/migration.service");
const faceapi = __importStar(require("face-api.js"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData, fetch: node_fetch_1.default });
exports.faceDetectionNet = faceapi.nets.tinyFaceDetector;
const minConfidence = 0.6;
const inputSize = 320;
const scoreThreshold = 0.6;
function getFaceDetectorOptions(net) {
    return net === faceapi.nets.ssdMobilenetv1
        ? new faceapi.SsdMobilenetv1Options({ minConfidence })
        : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
}
exports.faceDetectionOptions = getFaceDetectorOptions(exports.faceDetectionNet);
async function bootstrap() {
    var _a;
    await exports.faceDetectionNet.loadFromDisk('weights');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('weights');
    await faceapi.nets.ageGenderNet.loadFromDisk('weights');
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
            .setTitle('Flirtbees api')
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