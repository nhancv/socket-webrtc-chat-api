import {forwardRef, Module} from '@nestjs/common';
import {HistoriesController} from './histories.controller';
import {HistoriesService} from './histories.service';
import {MongooseModule} from "@nestjs/mongoose";
import {History, HistorySchema} from "./schemas/history.schema";
import {UsersModule} from "../users/users.module";
import {FriendsModule} from "../friends/friends.module";
import {UserSettingsModule} from "../user-settings/user-settings.module";

@Module({
    imports: [
        UsersModule,
        FriendsModule,
        forwardRef(() => UserSettingsModule),
        MongooseModule.forFeature([
            {name: History.name, schema: HistorySchema},
        ])
    ],
    controllers: [HistoriesController],
    providers: [HistoriesService],
    exports: [HistoriesService]
})
export class HistoriesModule {
}
