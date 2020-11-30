import {forwardRef, Module} from '@nestjs/common';
import {MessagesController} from './messages.controller';
import {MessagesService} from './messages.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Message, MessageSchema} from "./schemas/message.schema";
import {RealtimeModule} from "../realtime/realtime.module";
import {AwsS3Module} from "../aws-s3/aws-s3.module";
import {MulterModule} from "@nestjs/platform-express";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {extname} from "path";
import { diskStorage } from "multer";

@Module({
    imports: [
        AwsS3Module,
        forwardRef(() => RealtimeModule),
        MongooseModule.forFeature([
            {name: Message.name, schema: MessageSchema},
        ]),
        MulterModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                dest: configService.get<string>('MULTER_DEST'),
                storage: diskStorage({
                    destination: configService.get<string>('MULTER_DEST'),
                    filename: (req, file, callback) => {
                        callback(null, `${Date.now()}${extname(file.originalname)}`);
                    }
                })
            }),
            inject: [ConfigService],
        })
    ],
    controllers: [MessagesController],
    providers: [MessagesService],
    exports: [MessagesService]
})
export class MessagesModule {
}
