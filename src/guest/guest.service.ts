import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from "@nestjs/mongoose";
import {Connection, Model} from "mongoose";
import {Guest} from "./schemas/guest.schema";
import {GuestDto} from "./dto/guest.dto";
import {UsersService} from "../users/users.service";
import {FriendsService} from "../friends/friends.service";
import {HistoriesService} from "../histories/histories.service";
import {UserSettingsService} from "../user-settings/user-settings.service";
import {NotificationsService} from "../notifications/notifications.service";

@Injectable()
export class GuestService {

    constructor(
        private usersService: UsersService,
        private notificationsService: NotificationsService,
        private friendsService: FriendsService,
        private historiesService: HistoriesService,
        private userSettingsService: UserSettingsService,
        @InjectConnection() private connection: Connection,
        @InjectModel(Guest.name) private guestModel: Model<Guest>,
    ) {
    }

    async findGuest(uid: string): Promise<Guest | null> {
        return await this.guestModel.findOne({uid: uid}, {'_id': 0, '__v': 0}).exec();
    }

    async findGuestByDevice(deviceId: string): Promise<Guest | null> {
        return await this.guestModel.findOne({device_id: deviceId}, {'_id': 0, '__v': 0}).exec();
    }

    async deleteGuest(uid: string): Promise<boolean> {
        const res = await this.guestModel.deleteMany({uid: uid}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    async createGuest(uid: string, guestDto: GuestDto): Promise<Guest | null> {
        const model = new this.guestModel({
            ...guestDto,
            uid: uid
        });
        const res = await model.save();
        if (res) {
            return this.findGuest(uid);
        }
        return null;
    }

    async updateGuest(uid: string, guestDto: GuestDto): Promise<Guest | null> {
        const res = await this.guestModel.updateOne({uid: uid}, {
            ...guestDto,
            updated_at: Date.now()
        });
        if (res && res.n > 0) {
            return this.findGuest(uid);
        } else {
            return null;
        }
    }

    // Increase connection count in call
    async increaseConnectionCount(uid: string): Promise<void> {
        await this.guestModel.updateOne({uid: uid}, {
            $inc: {connection_count: 1},
            $set: {updated_at: Date.now()}
        });
    }

    // 0: not found
    // 1: valid
    // 2: not valid
    async isGuestValid(uid: string): Promise<number> {
        const guest = await this.findGuest(uid);
        if(guest) {
            const guestMaxConnection = parseInt(process.env.GUEST_CONNECTION_LIMIT ?? '0');
            return (guest.connection_count <= guestMaxConnection ? 1 : 2);
        }
        return 0;
    }

    async deleteAllGuestInstance(uid: string): Promise<void> {
        await this.deleteGuest(uid);
        await this.usersService.deleteUser(uid);
        await this.notificationsService.deleteNotificationsByUid(uid);
        await this.friendsService.deleteAllGuestByUid(uid);
        await this.historiesService.deleteGuest(uid);
        await this.userSettingsService.deleteGuest(uid);

    }
}
