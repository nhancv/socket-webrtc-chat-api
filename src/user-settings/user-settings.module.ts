import {forwardRef, Module} from '@nestjs/common';
import {UserSettingsService} from './user-settings.service';
import {UserSettingsController} from './user-settings.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {UserContent, UserContentSchema} from "./schemas/user-content.schema";
import {UserNotification, UserNotificationSchema} from "./schemas/user-notification.schema";
import {UserBlock, UserBlockSchema} from "./schemas/user-block.schema";
import {UsersModule} from "../users/users.module";

@Module({
    imports: [
        forwardRef(() => UsersModule),
        MongooseModule.forFeature([
            {name: UserContent.name, schema: UserContentSchema},
            {name: UserNotification.name, schema: UserNotificationSchema},
            {name: UserBlock.name, schema: UserBlockSchema},
        ])
    ],
    providers: [UserSettingsService],
    controllers: [UserSettingsController],
    exports: [UserSettingsService]
})
export class UserSettingsModule {
}
