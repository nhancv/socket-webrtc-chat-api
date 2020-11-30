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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const receipt_schema_1 = require("./schemas/receipt.schema");
const minute_schema_1 = require("./schemas/minute.schema");
let PaymentService = class PaymentService {
    constructor(connection, receiptModel, minuteModel) {
        this.connection = connection;
        this.receiptModel = receiptModel;
        this.minuteModel = minuteModel;
    }
    async findReceipts(uid) {
        return await this.receiptModel.find({ uid: uid }, { '_id': 0, '__v': 0 }).exec();
    }
    async findReceipt(uid, receipt) {
        return await this.receiptModel.findOne({ uid: uid, receipt: receipt }, { '_id': 0, '__v': 0 }).exec();
    }
    async deleteReceipt(uid, receipt) {
        const res = await this.receiptModel.deleteOne({ uid: uid, receipt: receipt }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async createReceipt(uid, receiptDto) {
        const model = new this.receiptModel(Object.assign(Object.assign({}, receiptDto), { uid: uid }));
        const modelRes = await model.save();
        if (modelRes) {
            return this.findReceipt(uid, receiptDto.receipt);
        }
        return null;
    }
    async updateReceipt(uid, receiptDto) {
        const receipt = receiptDto.receipt;
        const res = await this.receiptModel.updateOne({ uid: uid, receipt: receipt }, Object.assign(Object.assign({}, receiptDto), { uid: uid, updated_at: Date.now() }));
        if (res && res.n > 0) {
            return this.findReceipt(uid, receipt);
        }
        else {
            return null;
        }
    }
    async findMinute(uid) {
        return await this.minuteModel.findOne({ uid: uid }, { '_id': 0, '__v': 0 }).exec();
    }
    async deleteMinute(uid) {
        const res = await this.minuteModel.deleteOne({ uid: uid }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async createMinute(uid, minuteDto) {
        const model = new this.minuteModel(Object.assign(Object.assign({}, minuteDto), { uid: uid }));
        const modelRes = await model.save();
        if (modelRes) {
            return this.findMinute(uid);
        }
        return null;
    }
    async updateMinute(uid, minuteDto) {
        const res = await this.minuteModel.updateOne({ uid: uid }, Object.assign(Object.assign({}, minuteDto), { uid: uid, updated_at: Date.now() }));
        if (res && res.n > 0) {
            return this.findMinute(uid);
        }
        else {
            return null;
        }
    }
};
PaymentService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectConnection()),
    __param(1, mongoose_1.InjectModel(receipt_schema_1.Receipt.name)),
    __param(2, mongoose_1.InjectModel(minute_schema_1.Minute.name)),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        mongoose_2.Model,
        mongoose_2.Model])
], PaymentService);
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map