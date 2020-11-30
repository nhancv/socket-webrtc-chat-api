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
var MessagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_schema_1 = require("./schemas/message.schema");
const MAX_MESSAGE_PAGING = 50;
let MessagesService = MessagesService_1 = class MessagesService {
    constructor(connection, messageModel) {
        this.connection = connection;
        this.messageModel = messageModel;
        this.logger = new common_1.Logger(MessagesService_1.name);
    }
    async getAllMessage() {
        return this.messageModel.find({}, { '__v': 0 }, {
            sort: { created_at: -1 }
        }).exec();
    }
    async putRawMessage(message, _id) {
        delete message._id;
        await this.messageModel.updateOne({ _id: _id }, Object.assign({}, message), { upsert: true }).exec();
    }
    async getMessages(left, right, fromIndex, toIndex) {
        const from = Math.abs(fromIndex !== null && fromIndex !== void 0 ? fromIndex : 0);
        const to = Math.abs(toIndex !== null && toIndex !== void 0 ? toIndex : MAX_MESSAGE_PAGING);
        const skip = Math.min(from, to);
        const limit = Math.min(MAX_MESSAGE_PAGING, Math.abs(to - from));
        return this.messageModel.find({
            $or: [
                { left: left, right: right, is_sender: true },
                { right: left, left: right, is_sender: false },
            ]
        }, { '__v': 0 }, {
            skip: skip,
            limit: limit,
            sort: { created_at: -1 }
        }).exec();
    }
    async getLastMessage(left, right) {
        return this.messageModel.findOne({
            $or: [
                { left: left, right: right, is_sender: true },
                { right: left, left: right, is_sender: false },
            ]
        }, { '__v': 0 }).sort({ _id: -1 }).limit(1).exec();
    }
    async getUnReadMessageCount(left, right) {
        return this.messageModel.countDocuments({
            $or: [
                { right: left, left: right, is_sender: false, read: false },
            ]
        }).exec();
    }
    async getMessage(_id) {
        return this.messageModel.findOne({ _id: new mongoose_2.mongo.ObjectId(_id) }, { '__v': 0 }).exec();
    }
    async createMessage(left, fullMessageDto) {
        if (left != fullMessageDto.left || left == fullMessageDto.right) {
            return null;
        }
        const cloneMessageModel = new this.messageModel(Object.assign(Object.assign({}, fullMessageDto), { left: left, is_sender: true }));
        const senderRes = await cloneMessageModel.save();
        const messageModel = new this.messageModel(Object.assign(Object.assign({}, fullMessageDto), { left: left, is_sender: false }));
        const cloneRes = await messageModel.save();
        return [senderRes, cloneRes];
    }
    async cloneRawMessageInstance() {
    }
    async updateMessage(_id, fullMessageDto) {
        const res = await this.messageModel.updateOne({ _id: new mongoose_2.mongo.ObjectId(_id) }, Object.assign(Object.assign({}, fullMessageDto), { updated_at: Date.now() }));
        if (res && res.n > 0) {
            return this.getMessage(_id);
        }
        else {
            return null;
        }
    }
    async updateMessageBody(_id, left, updateMessageBody) {
        const res = await this.messageModel.updateOne({ _id: new mongoose_2.mongo.ObjectId(_id), left: left }, Object.assign(Object.assign({}, updateMessageBody), { edited: true, updated_at: Date.now() }));
        if (res && res.n > 0) {
            return this.getMessage(_id);
        }
        else {
            return null;
        }
    }
    async updateAllMessageReceived(left) {
        const res = await this.messageModel.updateMany({
            $or: [
                { left: left },
                { right: left },
            ]
        }, {
            received: true,
            updated_at: Date.now()
        });
        return res && res.n > 0;
    }
    async updateMessageReceived(left, right) {
        const res = await this.messageModel.updateMany({
            $or: [
                { left: left, right: right },
                { left: right, right: left },
            ]
        }, {
            received: true,
            updated_at: Date.now()
        });
        return res && res.n > 0;
    }
    async updateMessageRead(left, right) {
        const res = await this.messageModel.updateMany({
            $or: [
                { left: right, right: left },
            ]
        }, {
            read: true,
            updated_at: Date.now()
        });
        return res && res.n > 0;
    }
    async updateAllMessageRead(left) {
        const res = await this.messageModel.updateMany({
            $or: [
                { right: left },
            ]
        }, {
            read: true,
            updated_at: Date.now()
        });
        return res && res.n > 0;
    }
    async deleteMessage(_id, left) {
        const res = await this.messageModel.deleteOne({ _id: new mongoose_2.mongo.ObjectId(_id), left: left }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async deleteConversation(left, right) {
        const res = await this.messageModel.deleteMany({
            $or: [
                { left: left, right: right, is_sender: true },
                { left: right, right: left, is_sender: false },
            ]
        }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async deleteMultiConversations(left, rightIds) {
        if (!rightIds || rightIds.length == 0)
            return false;
        const res = await this.messageModel.deleteMany({
            $or: [
                { left: left, right: { '$in': rightIds }, is_sender: true },
                { left: { '$in': rightIds }, right: left, is_sender: false },
            ]
        }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async deleteAllConversation(left) {
        const res = await this.messageModel.deleteMany({
            $or: [
                { left: left, is_sender: true },
                { right: left, is_sender: false },
            ]
        }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
};
MessagesService = MessagesService_1 = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectConnection()),
    __param(1, mongoose_1.InjectModel(message_schema_1.Message.name)),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        mongoose_2.Model])
], MessagesService);
exports.MessagesService = MessagesService;
//# sourceMappingURL=messages.service.js.map