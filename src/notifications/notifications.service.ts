import {Injectable, Logger} from '@nestjs/common';
import {InjectConnection, InjectModel} from "@nestjs/mongoose";
import {Connection, Model} from "mongoose";
import {Notification} from "./schemas/notification.schema";
import {CreateNotificationDto} from "./dto/create-notification.dto";
import {FullNotificationDto} from "./dto/full-notification.dto";
import * as admin from 'firebase-admin';

export enum NotificationType {
    FRIEND_ACCEPTED_LEFT = 'FRIEND_ACCEPTED_LEFT',
    FRIEND_ACCEPTED_RIGHT = 'FRIEND_ACCEPTED_RIGHT',
    NEW_FRIEND_REQUEST = 'NEW_FRIEND_REQUEST',
    NEW_MESSAGE = 'NEW_MESSAGE',
    NEW_OFFER = 'NEW_OFFER',
}

@Injectable()
export class NotificationsService {

    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(Notification.name) private notificationModel: Model<Notification>,) {
    }

    async getNotification(uid: string, deviceId: string): Promise<Notification | null> {
        return this.notificationModel.findOne({uid: uid, device_id: deviceId}, {'_id': 0, '__v': 0}).exec();
    }

    async getNotifications(uid: string): Promise<Notification[]> {
        return this.notificationModel.find({uid: uid}, {'_id': 0, '__v': 0}).exec();
    }

    async createNotification(uid: string, createNotificationDto: CreateNotificationDto): Promise<Notification | null> {
        const fullNotificationDto: FullNotificationDto = {
            ...createNotificationDto,
            uid: uid
        }
        const notificationModel = new this.notificationModel(fullNotificationDto);
        const user = await notificationModel.save();
        if (user) {
            return this.getNotification(uid, user.device_id);
        }
        return null;
    }

    async updateNotification(uid: string, createNotificationDto: CreateNotificationDto): Promise<Notification | null> {
        const fullNotificationDto: FullNotificationDto = {
            ...createNotificationDto,
            uid: uid
        }
        const res = await this.notificationModel.updateOne({uid: uid, device_id: createNotificationDto.device_id}, {
            ...fullNotificationDto,
            updated_at: Date.now()
        }, {upsert: true});
        if (res && res.n > 0) {
            return this.getNotification(uid, fullNotificationDto.device_id);
        } else {
            return null;
        }
    }

    async deleteNotification(uid: string, deviceId: string): Promise<boolean> {
        const res = await this.notificationModel.deleteOne({uid: uid, device_id: deviceId}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    async deleteDuplicationNotifications(deviceId: string, fcmToken: string): Promise<boolean> {
        const res = await this.notificationModel.deleteMany({device_id: deviceId, fcm_token: fcmToken}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    async deleteNotificationsByUid(uid: string): Promise<boolean> {
        const res = await this.notificationModel.deleteMany({uid: uid}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    async pushNotificationToUid(type: NotificationType, uid: string, title: string, body: string, bundle: object = {}): Promise<void> {
        const devices: Notification[] = await this.getNotifications(uid);
        for (let i = 0; i < devices.length; i++) {
            const notification = devices[i];
            const fcmToken = notification.fcm_token;
            const message: admin.messaging.Message = {
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
                // Attach data
                // "data must only contain string values"
                data: {
                    ...(bundle ?? {}),
                    noty_type: `${type}`
                },
                token: fcmToken
            }

            await this.firebaseSendMessage(uid, notification.device_id, message);

        }

    }

    async clearNotificationToUid(uid: string): Promise<void> {
        const devices: Notification[] = await this.getNotifications(uid);
        for (let i = 0; i < devices.length; i++) {
            const notification = devices[i];
            const fcmToken = notification.fcm_token;
            const message: admin.messaging.Message = {
                apns: {
                    payload: {
                        aps: {
                            badge: 0
                        }
                    },
                },
                token: fcmToken
            }

            await this.firebaseSendMessage(uid, notification.device_id, message);
        }
    }

    async firebaseSendMessage(uid: string, deviceId: string, message: admin.messaging.Message): Promise<void> {
        try {
            await admin.messaging().send(message);
        } catch (e) {
            if (e.errorInfo && (e.errorInfo.code === 'messaging/invalid-argument' ||
                e.errorInfo.code === 'messaging/registration-token-not-registered')) {
                await this.deleteNotification(uid, deviceId);
            } else {
                const error = {
                    message: message,
                    error: e
                }
                this.logger.error(error);
            }
        }
    }
}
