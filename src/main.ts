import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {AppModule} from './app.module';
import {AllExceptionsFilter} from "./utils/all-exceptions.filter";
import {Logger, ValidationPipe} from "@nestjs/common";
import {MigrationModule} from "./migration/migration.module";
import {MigrationService} from "./migration/migration.service";
// Disable face detect
// // https://github.com/justadudewhohacks/face-api.js/blob/master/examples/examples-nodejs/ageAndGenderRecognition.ts
// import * as faceapi from 'face-api.js';
// // Import a fetch implementation for Node.js
// import fetch from 'node-fetch';
// import {tinyFaceDetector} from "face-api.js";
// // implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
// const canvas = require('canvas')
// // patch nodejs environment, we need to provide an implementation of
// // HTMLCanvasElement and HTMLImageElement
// const { Canvas, Image, ImageData } = canvas
// faceapi.env.monkeyPatch({ Canvas, Image, ImageData, fetch })
// // Config model
// // const faceDetectionNet = faceapi.nets.ssdMobilenetv1
// export const faceDetectionNet = faceapi.nets.tinyFaceDetector
// // SsdMobilenetv1Options
// const minConfidence = 0.6
// // TinyFaceDetectorOptions
// const inputSize = 320
// const scoreThreshold = 0.6
// function getFaceDetectorOptions(net: faceapi.NeuralNetwork<any>) {
//     return net === faceapi.nets.ssdMobilenetv1
//         ? new faceapi.SsdMobilenetv1Options({ minConfidence })
//         : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
// }
// export const faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet);

async function bootstrap() {

    // Disable face detect
    // // Load pre-model to face-api
    // await faceDetectionNet.loadFromDisk('weights')
    // await faceapi.nets.faceLandmark68Net.loadFromDisk('weights')
    // await faceapi.nets.ageGenderNet.loadFromDisk('weights')

    // const img = await canvas.loadImage('../images/bbt1.jpg')
    // const results = await faceapi.detectAllFaces(img, faceDetectionOptions)
    //     .withFaceLandmarks()
    //     .withAgeAndGender();
    // console.log(results);

    const logger = new Logger('main');
    const app = await NestFactory.create(AppModule, {cors: true});
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(new ValidationPipe());

    // Setup swagger
    // if (process.env.ENV == 'dev') {
        // Enable Swagger api docs module
        const changeLog =
            `
### Change log
- 
`;

        const options = new DocumentBuilder()
            .setVersion(process.env.npm_package_version ?? '')
            .setTitle('freehang api')
            .setDescription(changeLog)
            .addTag('default')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, options);
        SwaggerModule.setup('docs', app, document);
    // }

    // Get migration module: https://docs.nestjs.com/standalone-applications
    const migrationService = app.select(MigrationModule).get(MigrationService, {strict: true});
    // await migrationService.cloneDatabaseFromSource();
    await migrationService.migrate();

    // Start server
    const port: number = process.env.ENV === 'dev' ? 3001 : 3000;
    await app.listen(port, '0.0.0.0');
    logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap().then();
