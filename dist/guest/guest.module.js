"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestModule = void 0;
const common_1 = require("@nestjs/common");
const guest_service_1 = require("./guest.service");
const mongoose_1 = require("@nestjs/mongoose");
const guest_schema_1 = require("./schemas/guest.schema");
const users_module_1 = require("../users/users.module");
const friends_module_1 = require("../friends/friends.module");
const histories_module_1 = require("../histories/histories.module");
const user_settings_module_1 = require("../user-settings/user-settings.module");
const notifications_module_1 = require("../notifications/notifications.module");
let GuestModule = class GuestModule {
};
GuestModule = __decorate([
    common_1.Module({
        imports: [
            users_module_1.UsersModule,
            friends_module_1.FriendsModule,
            histories_module_1.HistoriesModule,
            user_settings_module_1.UserSettingsModule,
            notifications_module_1.NotificationsModule,
            mongoose_1.MongooseModule.forFeature([
                { name: guest_schema_1.Guest.name, schema: guest_schema_1.GuestSchema },
            ])
        ],
        providers: [guest_service_1.GuestService],
        exports: [guest_service_1.GuestService]
    })
], GuestModule);
exports.GuestModule = GuestModule;
//# sourceMappingURL=guest.module.js.map