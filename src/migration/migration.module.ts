import {Module} from '@nestjs/common';
import {MigrationService} from "./migration.service";
import {AppConfigModule} from "../app-config/app-config.module";
import {MessagesModule} from "../messages/messages.module";
import {AdminsModule} from "../admins/admins.module";
import {MigrationService_1_0_16} from "./migration-service_1_0_16.service";
import {MigrationService_1_0_19} from "./migration-service_1_0_19.service";

@Module({
    imports: [
        AppConfigModule,
        MessagesModule,
        AdminsModule
    ],
    providers: [
        MigrationService,
        MigrationService_1_0_16,
        MigrationService_1_0_19,
    ],
    exports: [MigrationService]
})
export class MigrationModule {

}
