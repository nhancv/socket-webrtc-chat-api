"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeModule = void 0;
const common_1 = require("@nestjs/common");
const realtime_gateway_1 = require("./realtime.gateway");
const auth_module_1 = require("../auth/auth.module");
const realtime_service_1 = require("./realtime.service");
const in_memory_db_1 = require("@nestjs-addons/in-memory-db");
const realtime_controller_1 = require("./realtime.controller");
const users_module_1 = require("../users/users.module");
const notifications_module_1 = require("../notifications/notifications.module");
const histories_module_1 = require("../histories/histories.module");
const messages_module_1 = require("../messages/messages.module");
const friends_module_1 = require("../friends/friends.module");
const guest_module_1 = require("../guest/guest.module");
const user_settings_module_1 = require("../user-settings/user-settings.module");
let RealtimeModule = class RealtimeModule {
};
RealtimeModule = __decorate([
    common_1.Module({
        imports: [
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            notifications_module_1.NotificationsModule,
            histories_module_1.HistoriesModule,
            messages_module_1.MessagesModule,
            friends_module_1.FriendsModule,
            guest_module_1.GuestModule,
            common_1.forwardRef(() => user_settings_module_1.UserSettingsModule),
            in_memory_db_1.InMemoryDBModule.forFeature('user', {}),
            in_memory_db_1.InMemoryDBModule.forFeature('host', {}),
            in_memory_db_1.InMemoryDBModule.forFeature('peer', {}),
        ],
        providers: [realtime_gateway_1.RealtimeGateway, realtime_service_1.RealtimeService],
        controllers: [realtime_controller_1.RealtimeController],
        exports: [realtime_service_1.RealtimeService],
    })
], RealtimeModule);
exports.RealtimeModule = RealtimeModule;
//# sourceMappingURL=realtime.module.js.map