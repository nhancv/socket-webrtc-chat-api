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
exports.UsersService = void 0;
const mongoose_1 = require("mongoose");
const common_1 = require("@nestjs/common");
const mongoose_2 = require("@nestjs/mongoose");
const user_schema_1 = require("./schemas/user.schema");
let UsersService = class UsersService {
    constructor(connection, userModel) {
        this.connection = connection;
        this.userModel = userModel;
    }
    async findUserByUid(uid) {
        return await this.userModel.findOne({ uid: uid }, { '_id': 0, '__v': 0 }).exec();
    }
    async findUserByUsername(username) {
        return await this.userModel.findOne({ username: username }, { '_id': 0, '__v': 0 }).exec();
    }
    async searchUsersByUsername(username) {
        return await this.userModel.find({ username: new RegExp('^' + username, 'i') }, { '_id': 0, '__v': 0 }).exec();
    }
    async deleteUser(uid) {
        const res = await this.userModel.deleteOne({ uid: uid }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async updateUser(uid, createUserDto) {
        const fullUserDto = Object.assign(Object.assign({}, createUserDto), { uid: uid });
        const res = await this.userModel.updateOne({ uid: uid }, Object.assign(Object.assign({}, fullUserDto), { updated_at: Date.now() }), { upsert: true });
        if (res && res.n > 0) {
            return this.findUserByUid(uid);
        }
        else {
            return null;
        }
    }
    async createUser(uid, createUserDto) {
        const fullUserDto = Object.assign(Object.assign({}, createUserDto), { uid: uid });
        const userModel = new this.userModel(fullUserDto);
        const user = await userModel.save();
        if (user) {
            return this.findUserByUid(uid);
        }
        return null;
    }
    async updateAvatar(uid, userAvatar) {
        return this.userModel.updateOne({ uid: uid }, userAvatar, { upsert: false });
    }
    async findAll() {
        return this.userModel.find({}, { '_id': 0, '__v': 0 }).exec();
    }
    async findAllInList(uids) {
        return this.userModel.find({ uid: { '$in': uids } }, { '_id': 0, '__v': 0 }).exec();
    }
    async findAllGuest() {
        return this.userModel.find({ uid: /guest_/ }, { '_id': 0, '__v': 0 }).exec();
    }
};
UsersService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_2.InjectConnection()),
    __param(1, mongoose_2.InjectModel(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_1.Connection,
        mongoose_1.Model])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map