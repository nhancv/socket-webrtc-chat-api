import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from "@nestjs/mongoose";
import {Connection, Model} from "mongoose";
import {UserContent} from "./schemas/user-content.schema";
import {UserNotification} from "./schemas/user-notification.schema";
import {UserBlock} from "./schemas/user-block.schema";
import {UserBlockDto} from "./dto/user-block.dto";
import {UserNotificationDto} from "./dto/user-notification.dto";
import {UserContentDto} from "./dto/user-content.dto";

@Injectable()
export class UserSettingsService {

    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(UserContent.name) private userContentModel: Model<UserContent>,
        @InjectModel(UserNotification.name) private userNotificationModel: Model<UserNotification>,
        @InjectModel(UserBlock.name) private userBlockModel: Model<UserBlock>,
    ) {
    }

    // User block
    async findBlockers(uid: string): Promise<UserBlock[]> {
        return await this.userBlockModel.find({uid: uid}, {'_id': 0, '__v': 0}).exec();
    }

    async findBlocker(uid: string, blockUid: string): Promise<UserBlock | null> {
        return await this.userBlockModel.findOne({uid: uid, block_uid: blockUid}, {'_id': 0, '__v': 0}).exec();
    }

    async deleteBlock(uid: string, blockUid: string): Promise<boolean> {
        const res = await this.userBlockModel.deleteOne({uid: uid, block_uid: blockUid}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    async createBlock(uid: string, userBlockDto: UserBlockDto): Promise<UserBlock | null> {
        const userBlockModel = new this.userBlockModel({
            ...userBlockDto,
            uid: uid
        });
        const userBlock = await userBlockModel.save();
        if (userBlock) {
            return this.findBlocker(uid, userBlockDto.block_uid);
        }
        return null;
    }

    async updateBlock(uid: string, userBlockDto: UserBlockDto): Promise<UserBlock | null> {
        const blockUid = userBlockDto.block_uid;
        const res = await this.userBlockModel.updateOne({uid: uid, block_uid: blockUid}, {
            ...userBlockDto,
            uid: uid,
            updated_at: Date.now()
        });
        if (res && res.n > 0) {
            return this.findBlocker(uid, blockUid);
        } else {
            return null;
        }
    }

    // User notification
    async findNotification(uid: string): Promise<UserNotification | null> {
        return await this.userNotificationModel.findOne({uid: uid}, {'_id': 0, '__v': 0}).exec();
    }

    async createNotification(uid: string, userNotificationDto: UserNotificationDto): Promise<UserNotification | null> {
        const model = new this.userNotificationModel({
            ...userNotificationDto,
            uid: uid
        });
        const res = await model.save();
        if (res) {
            return this.findNotification(uid);
        }
        return null;
    }

    async updateNotification(uid: string, userNotificationDto: UserNotificationDto): Promise<UserNotification | null> {
        const res = await this.userNotificationModel.updateOne({uid: uid}, {
            ...userNotificationDto,
            uid: uid,
            updated_at: Date.now()
        });
        if (res && res.n > 0) {
            return this.findNotification(uid);
        } else {
            return null;
        }
    }

    // User content
    async findContent(uid: string): Promise<UserContent | null> {
        return await this.userContentModel.findOne({uid: uid}, {'_id': 0, '__v': 0}).exec();
    }

    async createContent(uid: string, userContentDto: UserContentDto): Promise<UserContent | null> {
        const model = new this.userContentModel({
            ...userContentDto,
            uid: uid
        });
        const res = await model.save();
        if (res) {
            return this.findContent(uid);
        }
        return null;
    }

    async updateContent(uid: string, userContentDto: UserContentDto): Promise<UserContent | null> {
        const res = await this.userContentModel.updateOne({uid: uid}, {
            ...userContentDto,
            uid: uid,
            updated_at: Date.now()
        });
        if (res && res.n > 0) {
            return this.findContent(uid);
        } else {
            return null;
        }
    }

    async deleteGuest(uid: string): Promise<void> {
        await this.userBlockModel.deleteMany({uid: uid}).exec();
        await this.userContentModel.deleteMany({uid: uid}).exec();
        await this.userNotificationModel.deleteMany({uid: uid}).exec();
    }


}
