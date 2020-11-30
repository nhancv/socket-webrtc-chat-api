import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {Friend, FriendSchema} from "./schemas/friend.schema";
import {FriendRequest, FriendRequestSchema} from "./schemas/friend-request.schema";
import {FriendsController} from "./friends.controller";
import {FriendsService} from "./friends.service";
import {FriendFavorite, FriendFavoriteSchema} from "./schemas/friend-favorite.schema";
import {UsersModule} from "../users/users.module";
import {NotificationsModule} from "../notifications/notifications.module";
import {MessagesModule} from "../messages/messages.module";
import {UserSettingsModule} from "../user-settings/user-settings.module";

@Module({
    imports: [
        MessagesModule,
        NotificationsModule,
        forwardRef(() => UsersModule),
        forwardRef(() => UserSettingsModule),
        MongooseModule.forFeature([
            {name: Friend.name, schema: FriendSchema},
            {name: FriendRequest.name, schema: FriendRequestSchema},
            {name: FriendFavorite.name, schema: FriendFavoriteSchema},
        ])
    ],
    controllers: [FriendsController],
    providers: [FriendsService],
    exports: [FriendsService]
})
export class FriendsModule {

}
