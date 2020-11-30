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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const guest_schema_1 = require("./schemas/guest.schema");
const users_service_1 = require("../users/users.service");
const friends_service_1 = require("../friends/friends.service");
const histories_service_1 = require("../histories/histories.service");
const user_settings_service_1 = require("../user-settings/user-settings.service");
const notifications_service_1 = require("../notifications/notifications.service");
let GuestService = class GuestService {
    constructor(usersService, notificationsService, friendsService, historiesService, userSettingsService, connection, guestModel) {
        this.usersService = usersService;
        this.notificationsService = notificationsService;
        this.friendsService = friendsService;
        this.historiesService = historiesService;
        this.userSettingsService = userSettingsService;
        this.connection = connection;
        this.guestModel = guestModel;
    }
    async findGuest(uid) {
        return await this.guestModel.findOne({ uid: uid }, { '_id': 0, '__v': 0 }).exec();
    }
    async findGuestByDevice(deviceId) {
        return await this.guestModel.findOne({ device_id: deviceId }, { '_id': 0, '__v': 0 }).exec();
    }
    async deleteGuest(uid) {
        const res = await this.guestModel.deleteMany({ uid: uid }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async createGuest(uid, guestDto) {
        const model = new this.guestModel(Object.assign(Object.assign({}, guestDto), { uid: uid }));
        const res = await model.save();
        if (res) {
            return this.findGuest(uid);
        }
        return null;
    }
    async updateGuest(uid, guestDto) {
        const res = await this.guestModel.updateOne({ uid: uid }, Object.assign(Object.assign({}, guestDto), { updated_at: Date.now() }));
        if (res && res.n > 0) {
            return this.findGuest(uid);
        }
        else {
            return null;
        }
    }
    async increaseConnectionCount(uid) {
        await this.guestModel.updateOne({ uid: uid }, {
            $inc: { connection_count: 1 },
            $set: { updated_at: Date.now() }
        });
    }
    async isGuestValid(uid) {
        var _a;
        const guest = await this.findGuest(uid);
        if (guest) {
            const guestMaxConnection = parseInt((_a = process.env.GUEST_CONNECTION_LIMIT) !== null && _a !== void 0 ? _a : '0');
            return (guest.connection_count <= guestMaxConnection ? 1 : 2);
        }
        return 0;
    }
    async deleteAllGuestInstance(uid) {
        await this.deleteGuest(uid);
        await this.usersService.deleteUser(uid);
        await this.notificationsService.deleteNotificationsByUid(uid);
        await this.friendsService.deleteAllGuestByUid(uid);
        await this.historiesService.deleteGuest(uid);
        await this.userSettingsService.deleteGuest(uid);
    }
};
GuestService = __decorate([
    common_1.Injectable(),
    __param(5, mongoose_1.InjectConnection()),
    __param(6, mongoose_1.InjectModel(guest_schema_1.Guest.name)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        notifications_service_1.NotificationsService,
        friends_service_1.FriendsService,
        histories_service_1.HistoriesService,
        user_settings_service_1.UserSettingsService,
        mongoose_2.Connection,
        mongoose_2.Model])
], GuestService);
exports.GuestService = GuestService;
//# sourceMappingURL=guest.service.js.map