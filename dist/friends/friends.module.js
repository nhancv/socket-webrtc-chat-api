"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const friend_schema_1 = require("./schemas/friend.schema");
const friend_request_schema_1 = require("./schemas/friend-request.schema");
const friends_controller_1 = require("./friends.controller");
const friends_service_1 = require("./friends.service");
const friend_favorite_schema_1 = require("./schemas/friend-favorite.schema");
const users_module_1 = require("../users/users.module");
const notifications_module_1 = require("../notifications/notifications.module");
const messages_module_1 = require("../messages/messages.module");
const user_settings_module_1 = require("../user-settings/user-settings.module");
let FriendsModule = class FriendsModule {
};
FriendsModule = __decorate([
    common_1.Module({
        imports: [
            messages_module_1.MessagesModule,
            notifications_module_1.NotificationsModule,
            common_1.forwardRef(() => users_module_1.UsersModule),
            common_1.forwardRef(() => user_settings_module_1.UserSettingsModule),
            mongoose_1.MongooseModule.forFeature([
                { name: friend_schema_1.Friend.name, schema: friend_schema_1.FriendSchema },
                { name: friend_request_schema_1.FriendRequest.name, schema: friend_request_schema_1.FriendRequestSchema },
                { name: friend_favorite_schema_1.FriendFavorite.name, schema: friend_favorite_schema_1.FriendFavoriteSchema },
            ])
        ],
        controllers: [friends_controller_1.FriendsController],
        providers: [friends_service_1.FriendsService],
        exports: [friends_service_1.FriendsService]
    })
], FriendsModule);
exports.FriendsModule = FriendsModule;
//# sourceMappingURL=friends.module.js.map