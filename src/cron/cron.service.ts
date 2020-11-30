import {Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {UsersService} from "../users/users.service";
import {User} from "../users/schemas/user.schema";
import moment from "moment";
import {AppService} from "../app.service";
import {RealtimeService} from "../realtime/realtime.service";
import {NotificationsService} from "../notifications/notifications.service";
import {FriendsService} from "../friends/friends.service";
import {GuestService} from "../guest/guest.service";

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);

    constructor(
        private appService: AppService,
        private usersService: UsersService,
        private realtimeService: RealtimeService,
        private guestService: GuestService,
    ) {
    }

    // Called every minutes
    @Cron(CronExpression.EVERY_MINUTE)
    // @Cron(CronExpression.EVERY_5_SECONDS)
    async cleanGuestUserCron() {
        const allGuests: User[] = await this.usersService.findAllGuest()
        for (let i = 0; i < allGuests.length; i++) {
            const user: User = allGuests[i];
            const guestExpiresMinute = this.appService.getConfigService().get('GUEST_EXPIRES_MINUTE');
            const now = moment();
            const createdAt = moment(user.created_at);
            const expiresExpected = createdAt.add(guestExpiresMinute, 'minutes');
            if (expiresExpected.isBefore(now)) {
                this.realtimeService.disconnectSocketWithUid(user.uid);
                await this.guestService.deleteAllGuestInstance(user.uid);
            }
        }
    }
}
