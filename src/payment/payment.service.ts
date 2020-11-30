import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from "@nestjs/mongoose";
import {Connection, Model} from "mongoose";
import {Receipt} from "./schemas/receipt.schema";
import {Minute} from "./schemas/minute.schema";
import {ReceiptDto} from "./dto/receipt.dto";
import {MinuteDto} from "./dto/minute.dto";

@Injectable()
export class PaymentService {

    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(Receipt.name) private receiptModel: Model<Receipt>,
        @InjectModel(Minute.name) private minuteModel: Model<Minute>,
    ) {
    }

    // Receipt
    async findReceipts(uid: string): Promise<Receipt[] | null> {
        return await this.receiptModel.find({uid: uid}, {'_id': 0, '__v': 0}).exec();
    }

    async findReceipt(uid: string, receipt: string): Promise<Receipt | null> {
        return await this.receiptModel.findOne({uid: uid, receipt: receipt}, {'_id': 0, '__v': 0}).exec();
    }

    async deleteReceipt(uid: string, receipt: string): Promise<boolean> {
        const res = await this.receiptModel.deleteOne({uid: uid, receipt: receipt}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    async createReceipt(uid: string, receiptDto: ReceiptDto): Promise<Receipt | null> {
        const model = new this.receiptModel({
            ...receiptDto,
            uid: uid
        });
        const modelRes = await model.save();
        if (modelRes) {
            return this.findReceipt(uid, receiptDto.receipt);
        }
        return null;
    }

    async updateReceipt(uid: string, receiptDto: ReceiptDto): Promise<Receipt | null> {
        const receipt = receiptDto.receipt;
        const res = await this.receiptModel.updateOne({uid: uid, receipt: receipt}, {
            ...receiptDto,
            uid: uid,
            updated_at: Date.now()
        });
        if (res && res.n > 0) {
            return this.findReceipt(uid, receipt);
        } else {
            return null;
        }
    }

    // Minute
    async findMinute(uid: string): Promise<Minute | null> {
        return await this.minuteModel.findOne({uid: uid}, {'_id': 0, '__v': 0}).exec();
    }

    async deleteMinute(uid: string): Promise<boolean> {
        const res = await this.minuteModel.deleteOne({uid: uid}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    async createMinute(uid: string, minuteDto: MinuteDto): Promise<Minute | null> {
        const model = new this.minuteModel({
            ...minuteDto,
            uid: uid
        });
        const modelRes = await model.save();
        if (modelRes) {
            return this.findMinute(uid);
        }
        return null;
    }

    async updateMinute(uid: string, minuteDto: MinuteDto): Promise<Minute | null> {
        const res = await this.minuteModel.updateOne({uid: uid}, {
            ...minuteDto,
            uid: uid,
            updated_at: Date.now()
        });
        if (res && res.n > 0) {
            return this.findMinute(uid);
        } else {
            return null;
        }
    }
}
