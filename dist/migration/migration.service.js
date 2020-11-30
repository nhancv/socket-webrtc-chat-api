"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MigrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_config_service_1 = require("../app-config/app-config.service");
const migration_service_1_0_16_service_1 = require("./migration-service_1_0_16.service");
const admins_service_1 = require("../admins/admins.service");
const migration_service_1_0_19_service_1 = require("./migration-service_1_0_19.service");
const guest_schema_1 = require("../guest/schemas/guest.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const user_notification_schema_1 = require("../user-settings/schemas/user-notification.schema");
const user_content_schema_1 = require("../user-settings/schemas/user-content.schema");
const user_block_schema_1 = require("../user-settings/schemas/user-block.schema");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
const message_schema_1 = require("../messages/schemas/message.schema");
const history_schema_1 = require("../histories/schemas/history.schema");
const friend_favorite_schema_1 = require("../friends/schemas/friend-favorite.schema");
const friend_request_schema_1 = require("../friends/schemas/friend-request.schema");
const friend_schema_1 = require("../friends/schemas/friend.schema");
const admin_roles_1 = require("../admins/dto/admin.roles");
let MigrationService = MigrationService_1 = class MigrationService {
    constructor(configService, appConfigService, adminsService, migrationService_1_0_16, migrationService_1_0_19) {
        this.configService = configService;
        this.appConfigService = appConfigService;
        this.adminsService = adminsService;
        this.migrationService_1_0_16 = migrationService_1_0_16;
        this.migrationService_1_0_19 = migrationService_1_0_19;
        this.logger = new common_1.Logger(MigrationService_1.name);
    }
    async cloneDatabaseFromSource() {
        const sourceConnection = '';
        const targetConnection = '';
        if (!sourceConnection || sourceConnection === '' ||
            !targetConnection || targetConnection === '') {
            console.log('sourceConnection or targetConnection is null');
            return;
        }
        const mongoose = require('mongoose');
        const mongooseOption = {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        };
        const sourceMongoose = await mongoose.createConnection(sourceConnection, mongooseOption);
        const targetMongoose = await mongoose.createConnection(targetConnection, mongooseOption);
        const initTables = [
            { name: 'friends', schema: friend_schema_1.FriendSchema },
            { name: 'friendfavorites', schema: friend_favorite_schema_1.FriendFavoriteSchema },
            { name: 'friendrequests', schema: friend_request_schema_1.FriendRequestSchema },
            { name: 'guests', schema: guest_schema_1.GuestSchema },
            { name: 'histories', schema: history_schema_1.HistorySchema },
            { name: 'messages', schema: message_schema_1.MessageSchema },
            { name: 'notifications', schema: notification_schema_1.NotificationSchema },
            { name: 'userblocks', schema: user_block_schema_1.UserBlockSchema },
            { name: 'usercontents', schema: user_content_schema_1.UserContentSchema },
            { name: 'usernotifications', schema: user_notification_schema_1.UserNotificationSchema },
            { name: 'users', schema: user_schema_1.UserSchema },
        ];
        for (let i = 0; i < initTables.length; i++) {
            const table = initTables[i];
            console.log(`Import table "${table.name}"`);
            const sourceM = sourceMongoose.model(table.name, table.schema);
            const targetM = targetMongoose.model(table.name, table.schema);
            const clearRes = await targetM.deleteMany({});
            console.log(`clear target: ${clearRes && clearRes.n > 0}`);
            const allRow = await sourceM.find();
            let successCount = 0;
            for (let r = 0; r < allRow.length; r++) {
                const m = allRow[r].toObject();
                const res = await targetM.create(m);
                if (res) {
                    successCount++;
                }
            }
            console.log(`imported, success ${successCount}/${allRow.length}`);
        }
        console.log('DONE');
    }
    async migrate() {
        await this.initAdminCollection();
        let appConfig = await this.initAppConfigCollection();
        const buildVersion = process.env.npm_package_version;
        if (appConfig && buildVersion) {
            const appVersion = appConfig.version;
            this.logger.debug(`App version: ${appVersion} - build version: ${buildVersion}`);
            let nextVersion;
            switch (appConfig.version) {
                case '1.0.16':
                    await this.migrationService_1_0_16.migrate(appConfig);
                case '1.0.17':
                case '1.0.18':
                case '1.0.19':
                    await this.migrationService_1_0_19.migrate(appConfig);
                case '1.0.20':
                case '1.0.21':
                case '1.0.22':
                case '1.0.23':
                case '1.0.24':
                default:
                    nextVersion = '1.0.25';
                    break;
            }
            if (nextVersion !== appConfig.version) {
                await this.appConfigService.putAppConfig({
                    version: nextVersion
                });
            }
        }
    }
    async initAppConfigCollection() {
        let appConfig = await this.appConfigService.getAppConfig();
        if (!appConfig || !appConfig.version) {
            appConfig = await this.appConfigService.putAppConfig({
                version: '0.0.0',
                ios_version: 0,
                ad_version: 0
            });
        }
        if (appConfig && (!appConfig.ios_version || !appConfig.ad_version)) {
            appConfig = await this.appConfigService.putAppConfig({
                version: appConfig.version,
                ios_version: !appConfig.ios_version ? 0 : appConfig.ios_version,
                ad_version: !appConfig.ad_version ? 0 : appConfig.ad_version
            });
        }
        return appConfig;
    }
    async initAdminCollection() {
        const isAdminEmpty = await this.adminsService.isEmpty();
        if (isAdminEmpty) {
            await this.adminsService.createAdmin({
                role: admin_roles_1.ROLE_SYSTEM, uid: "-"
            });
        }
    }
};
MigrationService = MigrationService_1 = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        app_config_service_1.AppConfigService,
        admins_service_1.AdminsService,
        migration_service_1_0_16_service_1.MigrationService_1_0_16,
        migration_service_1_0_19_service_1.MigrationService_1_0_19])
], MigrationService);
exports.MigrationService = MigrationService;
//# sourceMappingURL=migration.service.js.map