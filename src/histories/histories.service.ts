import {Injectable, Logger} from '@nestjs/common';
import {InjectConnection, InjectModel} from "@nestjs/mongoose";
import {Connection, Model} from "mongoose";
import {History} from "./schemas/history.schema";
import {FullHistoryDto} from "./dto/full-history.dto";
import {CreateHistoryDto} from "./dto/create-history.dto";

const MAX_HISTORY_COUNTER = 10;

@Injectable()
export class HistoriesService {
    private readonly logger = new Logger(HistoriesService.name);

    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(History.name) private historyModel: Model<History>,
    ) {
    }

    async getHistories(uid: string): Promise<History[]> {
        return this.historyModel.find({uid: uid}, {'_id': 0, '__v': 0}).exec();
    }

    async getHistory(uid: string, friendId: string): Promise<History | null> {
        return this.historyModel.findOne({uid: uid, friend_id: friendId}, {'_id': 0, '__v': 0}).exec();
    }

    async createHistory(uid: string, createHistoryDto: CreateHistoryDto): Promise<History | null> {
        const fullHistoryDto: FullHistoryDto = {
            ...createHistoryDto,
            uid: uid
        }
        const historyModel = new this.historyModel(fullHistoryDto);
        const history = await historyModel.save();
        if (history) {
            return this.getHistory(uid, history.friend_id);
        }
        return null;
    }

    async updateHistory(uid: string, createHistoryDto: CreateHistoryDto): Promise<History | null> {
        const fullHistoryDto: FullHistoryDto = {
            ...createHistoryDto,
            uid: uid
        }
        const res = await this.historyModel.updateOne({uid: uid, friend_id: createHistoryDto.friend_id}, {
            ...fullHistoryDto,
            updated_at: Date.now()
        }, {upsert: true});
        if (res && res.n > 0) {
            return this.getHistory(uid, fullHistoryDto.friend_id);
        } else {
            return null;
        }
    }

    async deleteGuest(uid: string): Promise<void> {
        await this.historyModel.deleteMany({
            $or: [{uid: uid}, {friend_id: uid}]
        }).exec();
    }

    async deleteHistory(uid: string, friendId: string): Promise<boolean> {
        const res = await this.historyModel.deleteMany({uid: uid, friend_id: friendId}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    async uniqueInsertHistory(uid: string, friendId: string): Promise<void> {
        const history = await this.getHistory(uid, friendId);
        if (!history) {
            // Count histories with uid
            const count = await this.historyModel.countDocuments({uid: uid}).exec();
            // Delete the oldest one if count reached max history
            if (count >= MAX_HISTORY_COUNTER) {
                // Find all histories of uid, sort asc by date, remove the first one
                await this.historyModel.findOneAndDelete({uid: uid}, {sort: {created_at: 1}});
            }

            // Insert new one
            await this.createHistory(uid, {friend_id: friendId});
        } else {
            // Update history
            await this.updateHistory(uid, {friend_id: friendId});
        }
    }
}
