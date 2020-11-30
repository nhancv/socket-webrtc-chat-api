import {Injectable, Logger} from '@nestjs/common';
import {InjectConnection, InjectModel} from "@nestjs/mongoose";
import {Connection, Model, mongo} from "mongoose";
import {Message} from "./schemas/message.schema";
import {FullMessageDto} from "./dto/full-message.dto";
import {UpdateMessageDto} from "./dto/update-message.dto";

const MAX_MESSAGE_PAGING = 50;

@Injectable()
export class MessagesService {
    private logger: Logger = new Logger(MessagesService.name);

    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(Message.name) private messageModel: Model<Message>,
    ) {
    }

    // For migration
    async getAllMessage(): Promise<Message[]> {
        return this.messageModel.find({}, {'__v': 0}, {
            sort: {created_at: -1}
        }).exec();
    }

    // _id = new mongo.ObjectId()
    async putRawMessage(message: Message, _id: any): Promise<void> {
        delete message._id;
        await this.messageModel.updateOne({_id: _id}, {
            ...message
        }, {upsert: true}).exec();
    }

    // Get all messages I sent
    // Get all messages I received
    async getMessages(left: string, right: string, fromIndex?: number, toIndex?: number): Promise<Message[]> {
        const from = Math.abs(fromIndex ?? 0);
        const to = Math.abs(toIndex ?? MAX_MESSAGE_PAGING);
        const skip = Math.min(from, to);
        const limit = Math.min(MAX_MESSAGE_PAGING, Math.abs(to - from));
        return this.messageModel.find({
            $or: [
                {left: left, right: right, is_sender: true},
                {right: left, left: right, is_sender: false},
            ]
        }, {'__v': 0}, {
            skip: skip,
            limit: limit,
            sort: {created_at: -1}
        }).exec();
    }

    async getLastMessage(left: string, right: string): Promise<Message | null> {
        return this.messageModel.findOne({
            $or: [
                {left: left, right: right, is_sender: true},
                {right: left, left: right, is_sender: false},
            ]
        }, {'__v': 0}).sort({_id: -1}).limit(1).exec();
    }

    async getUnReadMessageCount(left: string, right: string): Promise<number> {
        // Condition to get message of Left (left send or left receive)
        // $or: [
        //     {left: left, right: right, is_sender: true},
        //     {right: left, left: right, is_sender: false},
        // ]

        // Condition to get message of Left in receive mode only
        // $or: [
        //     {right: left, left: right, is_sender: false},
        // ]

        return this.messageModel.countDocuments({
            $or: [
                {right: left, left: right, is_sender: false, read: false},
            ]
        }).exec();
    }

    async getMessage(_id: string): Promise<Message | null> {
        return this.messageModel.findOne({_id: new mongo.ObjectId(_id)}, {'__v': 0}).exec();
    }

    async createMessage(left: string, fullMessageDto: FullMessageDto): Promise<Message[] | null> {
        if (left != fullMessageDto.left || left == fullMessageDto.right) {
            return null;
        }

        // Duplicate message for receiver
        const cloneMessageModel = new this.messageModel({
            ...fullMessageDto,
            left: left,
            is_sender: true
        });
        const senderRes = await cloneMessageModel.save();

        const messageModel = new this.messageModel({
            ...fullMessageDto,
            left: left,
            is_sender: false
        });
        const cloneRes = await messageModel.save();

        return [senderRes, cloneRes];
    }

    async cloneRawMessageInstance() {

    }

    // Owner can update
    // This function auto called internally to update message status flag
    // Not require left like controller
    async updateMessage(_id: string, fullMessageDto: FullMessageDto): Promise<Message | null> {
        const res = await this.messageModel.updateOne({_id: new mongo.ObjectId(_id)}, {
            ...fullMessageDto,
            updated_at: Date.now()
        });
        if (res && res.n > 0) {
            return this.getMessage(_id);
        } else {
            return null;
        }
    }

    // Owner can edit body
    // Need verify left also, to void cross update hacking in controller
    async updateMessageBody(_id: string, left: string, updateMessageBody: UpdateMessageDto): Promise<Message | null> {
        const res = await this.messageModel.updateOne({_id: new mongo.ObjectId(_id), left: left}, {
            ...updateMessageBody,
            edited: true,
            updated_at: Date.now()
        });
        if (res && res.n > 0) {
            return this.getMessage(_id);
        } else {
            return null;
        }
    }

    // For receiver update flag
    // After get message list, client call this api
    // Update all message of right to received
    async updateAllMessageReceived(left: string): Promise<boolean> {
        const res = await this.messageModel.updateMany({
            $or: [
                // {left: left, is_sender: true},
                // {right: left, is_sender: false},

                {left: left},
                {right: left},
            ]
        }, {
            received: true,
            updated_at: Date.now()
        });
        return res && res.n > 0;
    }

    // For receiver update flag
    // After user select specific chat section with rightId
    // Client call this api
    // Update message of left to right to read
    async updateMessageReceived(left: string, right: string): Promise<boolean> {
        const res = await this.messageModel.updateMany({
                $or: [
                    // {left: left, right: right, is_sender: true},
                    // {left: right, right: left, is_sender: false},

                    {left: left, right: right},
                    {left: right, right: left},
                ]
            }, {
            received: true,
            updated_at: Date.now()
        });
        return res && res.n > 0;
    }

    // Update read conversation
    // Left read right's messages
    // => Update messages which sent by right to read status
    async updateMessageRead(left: string, right: string): Promise<boolean> {
        const res = await this.messageModel.updateMany({
            $or: [
                {left: right, right: left},
            ]
        }, {
            read: true,
            updated_at: Date.now()
        });
        return res && res.n > 0;
    }

    // Update read all messages
    // Left read right's messages
    // => Update messages which received by left to read status
    async updateAllMessageRead(left: string): Promise<boolean> {
        const res = await this.messageModel.updateMany({
            $or: [
                {right: left},
            ]
        }, {
            read: true,
            updated_at: Date.now()
        });
        return res && res.n > 0;
    }

    // Owner can delete
    // Need verify left also, to void cross update hacking in controller
    async deleteMessage(_id: string, left: string): Promise<boolean> {
        const res = await this.messageModel.deleteOne({_id: new mongo.ObjectId(_id), left: left}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    // Delete conversation
    async deleteConversation(left: string, right: string): Promise<boolean> {
        const res = await this.messageModel.deleteMany({
            $or: [
                {left: left, right: right, is_sender: true},
                {left: right, right: left, is_sender: false},
            ]
        }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    // Delete conversations
    async deleteMultiConversations(left: string, rightIds: string[]): Promise<boolean> {
        if(!rightIds || rightIds.length == 0) return false;

        const res = await this.messageModel.deleteMany({
            $or: [
                {left: left, right: {'$in': rightIds}, is_sender: true},
                {left: {'$in': rightIds}, right: left, is_sender: false},
            ]
        }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    // Delete all conversation
    async deleteAllConversation(left: string): Promise<boolean> {
        const res = await this.messageModel.deleteMany({
            $or: [
                {left: left, is_sender: true},
                {right: left, is_sender: false},
            ]
        }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

}
