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
exports.UserSettingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_content_schema_1 = require("./schemas/user-content.schema");
const user_notification_schema_1 = require("./schemas/user-notification.schema");
const user_block_schema_1 = require("./schemas/user-block.schema");
let UserSettingsService = class UserSettingsService {
    constructor(connection, userContentModel, userNotificationModel, userBlockModel) {
        this.connection = connection;
        this.userContentModel = userContentModel;
        this.userNotificationModel = userNotificationModel;
        this.userBlockModel = userBlockModel;
    }
    async findBlockers(uid) {
        return await this.userBlockModel.find({ uid: uid }, { '_id': 0, '__v': 0 }).exec();
    }
    async findBlocker(uid, blockUid) {
        return await this.userBlockModel.findOne({ uid: uid, block_uid: blockUid }, { '_id': 0, '__v': 0 }).exec();
    }
    async deleteBlock(uid, blockUid) {
        const res = await this.userBlockModel.deleteOne({ uid: uid, block_uid: blockUid }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async createBlock(uid, userBlockDto) {
        const userBlockModel = new this.userBlockModel(Object.assign(Object.assign({}, userBlockDto), { uid: uid }));
        const userBlock = await userBlockModel.save();
        if (userBlock) {
            return this.findBlocker(uid, userBlockDto.block_uid);
        }
        return null;
    }
    async updateBlock(uid, userBlockDto) {
        const blockUid = userBlockDto.block_uid;
        const res = await this.userBlockModel.updateOne({ uid: uid, block_uid: blockUid }, Object.assign(Object.assign({}, userBlockDto), { uid: uid, updated_at: Date.now() }));
        if (res && res.n > 0) {
            return this.findBlocker(uid, blockUid);
        }
        else {
            return null;
        }
    }
    async findNotification(uid) {
        return await this.userNotificationModel.findOne({ uid: uid }, { '_id': 0, '__v': 0 }).exec();
    }
    async createNotification(uid, userNotificationDto) {
        const model = new this.userNotificationModel(Object.assign(Object.assign({}, userNotificationDto), { uid: uid }));
        const res = await model.save();
        if (res) {
            return this.findNotification(uid);
        }
        return null;
    }
    async updateNotification(uid, userNotificationDto) {
        const res = await this.userNotificationModel.updateOne({ uid: uid }, Object.assign(Object.assign({}, userNotificationDto), { uid: uid, updated_at: Date.now() }));
        if (res && res.n > 0) {
            return this.findNotification(uid);
        }
        else {
            return null;
        }
    }
    async findContent(uid) {
        return await this.userContentModel.findOne({ uid: uid }, { '_id': 0, '__v': 0 }).exec();
    }
    async createContent(uid, userContentDto) {
        const model = new this.userContentModel(Object.assign(Object.assign({}, userContentDto), { uid: uid }));
        const res = await model.save();
        if (res) {
            return this.findContent(uid);
        }
        return null;
    }
    async updateContent(uid, userContentDto) {
        const res = await this.userContentModel.updateOne({ uid: uid }, Object.assign(Object.assign({}, userContentDto), { uid: uid, updated_at: Date.now() }));
        if (res && res.n > 0) {
            return this.findContent(uid);
        }
        else {
            return null;
        }
    }
    async deleteGuest(uid) {
        await this.userBlockModel.deleteMany({ uid: uid }).exec();
        await this.userContentModel.deleteMany({ uid: uid }).exec();
        await this.userNotificationModel.deleteMany({ uid: uid }).exec();
    }
};
UserSettingsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectConnection()),
    __param(1, mongoose_1.InjectModel(user_content_schema_1.UserContent.name)),
    __param(2, mongoose_1.InjectModel(user_notification_schema_1.UserNotification.name)),
    __param(3, mongoose_1.InjectModel(user_block_schema_1.UserBlock.name)),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], UserSettingsService);
exports.UserSettingsService = UserSettingsService;
//# sourceMappingURL=user-settings.service.js.map