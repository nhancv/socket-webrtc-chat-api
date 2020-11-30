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
var HistoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const history_schema_1 = require("./schemas/history.schema");
const MAX_HISTORY_COUNTER = 10;
let HistoriesService = HistoriesService_1 = class HistoriesService {
    constructor(connection, historyModel) {
        this.connection = connection;
        this.historyModel = historyModel;
        this.logger = new common_1.Logger(HistoriesService_1.name);
    }
    async getHistories(uid) {
        return this.historyModel.find({ uid: uid }, { '_id': 0, '__v': 0 }).exec();
    }
    async getHistory(uid, friendId) {
        return this.historyModel.findOne({ uid: uid, friend_id: friendId }, { '_id': 0, '__v': 0 }).exec();
    }
    async createHistory(uid, createHistoryDto) {
        const fullHistoryDto = Object.assign(Object.assign({}, createHistoryDto), { uid: uid });
        const historyModel = new this.historyModel(fullHistoryDto);
        const history = await historyModel.save();
        if (history) {
            return this.getHistory(uid, history.friend_id);
        }
        return null;
    }
    async updateHistory(uid, createHistoryDto) {
        const fullHistoryDto = Object.assign(Object.assign({}, createHistoryDto), { uid: uid });
        const res = await this.historyModel.updateOne({ uid: uid, friend_id: createHistoryDto.friend_id }, Object.assign(Object.assign({}, fullHistoryDto), { updated_at: Date.now() }), { upsert: true });
        if (res && res.n > 0) {
            return this.getHistory(uid, fullHistoryDto.friend_id);
        }
        else {
            return null;
        }
    }
    async deleteGuest(uid) {
        await this.historyModel.deleteMany({
            $or: [{ uid: uid }, { friend_id: uid }]
        }).exec();
    }
    async deleteHistory(uid, friendId) {
        const res = await this.historyModel.deleteMany({ uid: uid, friend_id: friendId }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async uniqueInsertHistory(uid, friendId) {
        const history = await this.getHistory(uid, friendId);
        if (!history) {
            const count = await this.historyModel.countDocuments({ uid: uid }).exec();
            if (count >= MAX_HISTORY_COUNTER) {
                await this.historyModel.findOneAndDelete({ uid: uid }, { sort: { created_at: 1 } });
            }
            await this.createHistory(uid, { friend_id: friendId });
        }
        else {
            await this.updateHistory(uid, { friend_id: friendId });
        }
    }
};
HistoriesService = HistoriesService_1 = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectConnection()),
    __param(1, mongoose_1.InjectModel(history_schema_1.History.name)),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        mongoose_2.Model])
], HistoriesService);
exports.HistoriesService = HistoriesService;
//# sourceMappingURL=histories.service.js.map