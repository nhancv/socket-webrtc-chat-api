/*
 * MIT License
 *
 * Copyright (c) 2020 Nhan Cao
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import {forwardRef, Module} from '@nestjs/common';
import {RealtimeGateway} from "./realtime.gateway";
import {AuthModule} from "../auth/auth.module";
import {RealtimeService} from './realtime.service';
import {InMemoryDBModule} from "@nestjs-addons/in-memory-db";
import { RealtimeController } from './realtime.controller';
import {UsersService} from "../users/users.service";
import {UsersModule} from "../users/users.module";
import {NotificationsModule} from "../notifications/notifications.module";
import {HistoriesModule} from "../histories/histories.module";
import {MessagesModule} from "../messages/messages.module";
import {FriendsModule} from "../friends/friends.module";
import {GuestModule} from "../guest/guest.module";
import {UserSettingsModule} from "../user-settings/user-settings.module";

@Module({
    imports: [
        AuthModule,
        UsersModule,
        NotificationsModule,
        HistoriesModule,
        MessagesModule,
        FriendsModule,
        GuestModule,
        forwardRef(() => UserSettingsModule),
        InMemoryDBModule.forFeature('user', {}),
        InMemoryDBModule.forFeature('host', {}),
        InMemoryDBModule.forFeature('peer', {}),
    ],
    providers: [RealtimeGateway, RealtimeService],
    controllers: [RealtimeController],
    exports: [RealtimeService],
})
export class RealtimeModule {
}
