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
exports.AdminsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const admin_schema_1 = require("./schemas/admin.schema");
let AdminsService = class AdminsService {
    constructor(connection, adminsModel) {
        this.connection = connection;
        this.adminsModel = adminsModel;
    }
    async findAdmin(uid) {
        return await this.adminsModel.findOne({ uid: uid }, { '_id': 0, '__v': 0 }).exec();
    }
    async isEmpty() {
        return (await this.adminsModel.estimatedDocumentCount().exec()) == 0;
    }
    async findAllAdmins() {
        return await this.adminsModel.find({}, { '_id': 0, '__v': 0 }).exec();
    }
    async deleteAdmin(uid) {
        const res = await this.adminsModel.deleteOne({ uid: uid }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async createAdmin(adminDto) {
        const model = new this.adminsModel(Object.assign({}, adminDto));
        const modelRes = await model.save();
        if (modelRes) {
            return this.findAdmin(adminDto.uid);
        }
        return null;
    }
    async updateAdmin(adminDto) {
        const uid = adminDto.uid;
        const res = await this.adminsModel.updateOne({ uid: uid }, Object.assign(Object.assign({}, adminDto), { updated_at: Date.now() }));
        if (res && res.n > 0) {
            return this.findAdmin(uid);
        }
        else {
            return null;
        }
    }
};
AdminsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectConnection()),
    __param(1, mongoose_1.InjectModel(admin_schema_1.Admin.name)),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        mongoose_2.Model])
], AdminsService);
exports.AdminsService = AdminsService;
//# sourceMappingURL=admins.service.js.map