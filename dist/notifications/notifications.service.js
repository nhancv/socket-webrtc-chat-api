"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = exports.NotificationType = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("./schemas/notification.schema");
const admin = __importStar(require("firebase-admin"));
var NotificationType;
(function (NotificationType) {
    NotificationType["FRIEND_ACCEPTED_LEFT"] = "FRIEND_ACCEPTED_LEFT";
    NotificationType["FRIEND_ACCEPTED_RIGHT"] = "FRIEND_ACCEPTED_RIGHT";
    NotificationType["NEW_FRIEND_REQUEST"] = "NEW_FRIEND_REQUEST";
    NotificationType["NEW_MESSAGE"] = "NEW_MESSAGE";
    NotificationType["NEW_OFFER"] = "NEW_OFFER";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(connection, notificationModel) {
        this.connection = connection;
        this.notificationModel = notificationModel;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async getNotification(uid, deviceId) {
        return this.notificationModel.findOne({ uid: uid, device_id: deviceId }, { '_id': 0, '__v': 0 }).exec();
    }
    async getNotifications(uid) {
        return this.notificationModel.find({ uid: uid }, { '_id': 0, '__v': 0 }).exec();
    }
    async createNotification(uid, createNotificationDto) {
        const fullNotificationDto = Object.assign(Object.assign({}, createNotificationDto), { uid: uid });
        const notificationModel = new this.notificationModel(fullNotificationDto);
        const user = await notificationModel.save();
        if (user) {
            return this.getNotification(uid, user.device_id);
        }
        return null;
    }
    async updateNotification(uid, createNotificationDto) {
        const fullNotificationDto = Object.assign(Object.assign({}, createNotificationDto), { uid: uid });
        const res = await this.notificationModel.updateOne({ uid: uid, device_id: createNotificationDto.device_id }, Object.assign(Object.assign({}, fullNotificationDto), { updated_at: Date.now() }), { upsert: true });
        if (res && res.n > 0) {
            return this.getNotification(uid, fullNotificationDto.device_id);
        }
        else {
            return null;
        }
    }
    async deleteNotification(uid, deviceId) {
        const res = await this.notificationModel.deleteOne({ uid: uid, device_id: deviceId }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async deleteDuplicationNotifications(deviceId, fcmToken) {
        const res = await this.notificationModel.deleteMany({ device_id: deviceId, fcm_token: fcmToken }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async deleteNotificationsByUid(uid) {
        const res = await this.notificationModel.deleteMany({ uid: uid }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async pushNotificationToUid(type, uid, title, body, bundle = {}) {
        const devices = await this.getNotifications(uid);
        for (let i = 0; i < devices.length; i++) {
            const notification = devices[i];
            const fcmToken = notification.fcm_token;
            const message = {
                notification: {
                    title: title,
                    body: body,
                },
                apns: {
                    payload: {
                        aps: {
                            badge: notification.unread
                        }
                    },
                },
                data: Object.assign(Object.assign({}, (bundle !== null && bundle !== void 0 ? bundle : {})), { noty_type: `${type}` }),
                token: fcmToken
            };
            await this.firebaseSendMessage(uid, notification.device_id, message);
        }
    }
    async clearNotificationToUid(uid) {
        const devices = await this.getNotifications(uid);
        for (let i = 0; i < devices.length; i++) {
            const notification = devices[i];
            const fcmToken = notification.fcm_token;
            const message = {
                apns: {
                    payload: {
                        aps: {
                            badge: 0
                        }
                    },
                },
                token: fcmToken
            };
            await this.firebaseSendMessage(uid, notification.device_id, message);
        }
    }
    async firebaseSendMessage(uid, deviceId, message) {
        try {
            await admin.messaging().send(message);
        }
        catch (e) {
            if (e.errorInfo && (e.errorInfo.code === 'messaging/invalid-argument' ||
                e.errorInfo.code === 'messaging/registration-token-not-registered')) {
                await this.deleteNotification(uid, deviceId);
            }
            else {
                const error = {
                    message: message,
                    error: e
                };
                this.logger.error(error);
            }
        }
    }
};
NotificationsService = NotificationsService_1 = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectConnection()),
    __param(1, mongoose_1.InjectModel(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        mongoose_2.Model])
], NotificationsService);
exports.NotificationsService = NotificationsService;
//# sourceMappingURL=notifications.service.js.map