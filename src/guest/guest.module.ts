import {Module} from '@nestjs/common';
import {GuestService} from './guest.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Guest, GuestSchema} from "./schemas/guest.schema";
import {UsersModule} from "../users/users.module";
import {FriendsModule} from "../friends/friends.module";
import {HistoriesModule} from "../histories/histories.module";
import {UserSettingsModule} from "../user-settings/user-settings.module";
import {NotificationsModule} from "../notifications/notifications.module";

@Module({
    imports: [
        UsersModule,
        FriendsModule,
        HistoriesModule,
        UserSettingsModule,
        NotificationsModule,
        MongooseModule.forFeature([
            {name: Guest.name, schema: GuestSchema},
        ])
    ],
    providers: [GuestService],
    exports: [GuestService]
})
export class GuestModule {

}
