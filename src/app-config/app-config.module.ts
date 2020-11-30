import { Module } from '@nestjs/common';
import {AppConfigService} from "./app-config.service";
import {MongooseModule} from "@nestjs/mongoose";
import {Notification, NotificationSchema} from "../notifications/schemas/notification.schema";
import {AppConfig, AppConfigSchema} from "./schemas/app-config.schema";
import { AppConfigController } from './app-config.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: AppConfig.name, schema: AppConfigSchema},
        ])
    ],
    providers: [AppConfigService],
    exports: [AppConfigService],
    controllers: [AppConfigController]
})
export class AppConfigModule {

}
