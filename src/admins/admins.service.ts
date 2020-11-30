import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from "@nestjs/mongoose";
import {Connection, Model} from "mongoose";
import {Admin} from "./schemas/admin.schema";
import {AdminDto} from "./dto/admin.dto";

@Injectable()
export class AdminsService {

    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(Admin.name) private adminsModel: Model<Admin>,
    ) {
    }

    async findAdmin(uid: string): Promise<Admin | null> {
        return await this.adminsModel.findOne({uid: uid}, {'_id': 0, '__v': 0}).exec();
    }

    async isEmpty(): Promise<boolean> {
        return (await this.adminsModel.estimatedDocumentCount().exec()) == 0;
    }

    async findAllAdmins(): Promise<Admin[]> {
        return await this.adminsModel.find({}, {'_id': 0, '__v': 0}).exec();
    }

    async deleteAdmin(uid: string): Promise<boolean> {
        const res = await this.adminsModel.deleteOne({uid: uid}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    async createAdmin(adminDto: AdminDto): Promise<Admin | null> {
        const model = new this.adminsModel({
            ...adminDto
        });
        const modelRes = await model.save();
        if (modelRes) {
            return this.findAdmin(adminDto.uid);
        }
        return null;
    }

    async updateAdmin(adminDto: AdminDto): Promise<Admin | null> {
        const uid = adminDto.uid;
        const res = await this.adminsModel.updateOne({uid: uid}, {
            ...adminDto,
            updated_at: Date.now()
        });
        if (res && res.n > 0) {
            return this.findAdmin(uid);
        } else {
            return null;
        }
    }

}
