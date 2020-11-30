"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSettingsModule = void 0;
const common_1 = require("@nestjs/common");
const user_settings_service_1 = require("./user-settings.service");
const user_settings_controller_1 = require("./user-settings.controller");
const mongoose_1 = require("@nestjs/mongoose");
const user_content_schema_1 = require("./schemas/user-content.schema");
const user_notification_schema_1 = require("./schemas/user-notification.schema");
const user_block_schema_1 = require("./schemas/user-block.schema");
const users_module_1 = require("../users/users.module");
let UserSettingsModule = class UserSettingsModule {
};
UserSettingsModule = __decorate([
    common_1.Module({
        imports: [
            common_1.forwardRef(() => users_module_1.UsersModule),
            mongoose_1.MongooseModule.forFeature([
                { name: user_content_schema_1.UserContent.name, schema: user_content_schema_1.UserContentSchema },
                { name: user_notification_schema_1.UserNotification.name, schema: user_notification_schema_1.UserNotificationSchema },
                { name: user_block_schema_1.UserBlock.name, schema: user_block_schema_1.UserBlockSchema },
            ])
        ],
        providers: [user_settings_service_1.UserSettingsService],
        controllers: [user_settings_controller_1.UserSettingsController],
        exports: [user_settings_service_1.UserSettingsService]
    })
], UserSettingsModule);
exports.UserSettingsModule = UserSettingsModule;
//# sourceMappingURL=user-settings.module.js.map