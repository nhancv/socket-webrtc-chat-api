import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {AppConfigService} from "../app-config/app-config.service";
import {MigrationService_1_0_16} from "./migration-service_1_0_16.service";
import {AdminsService} from "../admins/admins.service";
import {AppConfig} from "../app-config/schemas/app-config.schema";
import {MigrationService_1_0_19} from "./migration-service_1_0_19.service";
import {GuestSchema} from "../guest/schemas/guest.schema";
import {UserSchema} from "../users/schemas/user.schema";
import {UserNotificationSchema} from "../user-settings/schemas/user-notification.schema";
import {UserContentSchema} from "../user-settings/schemas/user-content.schema";
import {UserBlockSchema} from "../user-settings/schemas/user-block.schema";
import {NotificationSchema} from "../notifications/schemas/notification.schema";
import {MessageSchema} from "../messages/schemas/message.schema";
import {HistorySchema} from "../histories/schemas/history.schema";
import {FriendFavoriteSchema} from "../friends/schemas/friend-favorite.schema";
import {FriendRequestSchema} from "../friends/schemas/friend-request.schema";
import {FriendSchema} from "../friends/schemas/friend.schema";
import {ROLE_SYSTEM} from "../admins/dto/admin.roles";

@Injectable()
export class MigrationService {
    private readonly logger = new Logger(MigrationService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly appConfigService: AppConfigService,
        private readonly adminsService: AdminsService,
        private readonly migrationService_1_0_16: MigrationService_1_0_16,
        private readonly migrationService_1_0_19: MigrationService_1_0_19,
    ) {
    }

    // Clone data from source to another connector
    async cloneDatabaseFromSource() {
        const sourceConnection = '';
        const targetConnection = '';
        if(!sourceConnection || sourceConnection === '' ||
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
            {name: 'friends', schema: FriendSchema},
            {name: 'friendfavorites', schema: FriendFavoriteSchema},
            {name: 'friendrequests', schema: FriendRequestSchema},
            {name: 'guests', schema: GuestSchema},
            {name: 'histories', schema: HistorySchema},
            {name: 'messages', schema: MessageSchema},
            {name: 'notifications', schema: NotificationSchema},
            {name: 'userblocks', schema: UserBlockSchema},
            {name: 'usercontents', schema: UserContentSchema},
            {name: 'usernotifications', schema: UserNotificationSchema},
            {name: 'users', schema: UserSchema},
        ];
        for (let i = 0; i < initTables.length; i++) {
            const table = initTables[i];
            console.log(`Import table "${table.name}"`);
            const sourceM  = sourceMongoose.model(table.name, table.schema);
            const targetM = targetMongoose.model(table.name, table.schema);
            // Clear target
            const clearRes = await targetM.deleteMany({});
            console.log(`clear target: ${clearRes && clearRes.n > 0}`);
            // Import
            const allRow = await sourceM.find();
            let successCount = 0;
            for(let r = 0; r < allRow.length; r++) {
                const m = allRow[r].toObject();
                const res = await targetM.create(m);
                if(res) {
                    successCount ++;
                }
            }
            console.log(`imported, success ${successCount}/${allRow.length}`);
        }
        // Done
        console.log('DONE');
    }

    async migrate() {
        // Init collection
        await this.initAdminCollection();
        // Init app config version
        let appConfig = await this.initAppConfigCollection();
        const buildVersion = process.env.npm_package_version;

        // Migrate
        if (appConfig && buildVersion) {
            const appVersion = appConfig.version;
            this.logger.debug(`App version: ${appVersion} - build version: ${buildVersion}`);

            let nextVersion: string;
            switch (appConfig.version) {
                case '1.0.16' :
                    await this.migrationService_1_0_16.migrate(appConfig);
                case '1.0.17' :
                case '1.0.18' :
                case '1.0.19' :
                    await this.migrationService_1_0_19.migrate(appConfig);
                case '1.0.20' :
                case '1.0.21' :
                case '1.0.22' :
                case '1.0.23' :
                case '1.0.24' :
                default:
                    nextVersion = '1.0.25';
                    break;
            }
            // Update to next version
            if (nextVersion !== appConfig.version) {
                await this.appConfigService.putAppConfig({
                    version: nextVersion
                });
            }
        }
    }

    async initAppConfigCollection(): Promise<AppConfig | null> {
        let appConfig = await this.appConfigService.getAppConfig();
        // Init app config version
        if (!appConfig || !appConfig.version) {
            appConfig = await this.appConfigService.putAppConfig({
                version: '0.0.0',
                ios_version: 0,
                ad_version: 0
            });
        }
        if(appConfig && (!appConfig.ios_version || !appConfig.ad_version)) {
            appConfig = await this.appConfigService.putAppConfig({
                version: appConfig.version,
                ios_version: !appConfig.ios_version ? 0 : appConfig.ios_version,
                ad_version: !appConfig.ad_version ? 0 : appConfig.ad_version
            });
        }
        return appConfig;
    }

    async initAdminCollection() {
        // Init admin collection
        const isAdminEmpty = await this.adminsService.isEmpty();
        if (isAdminEmpty) {
            await this.adminsService.createAdmin({
                role: ROLE_SYSTEM, uid: "-"
            });
        }
    }

}
