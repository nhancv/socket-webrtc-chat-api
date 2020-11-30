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
exports.SupportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const support_schema_1 = require("./schemas/support.schema");
const ticket_schema_1 = require("./schemas/ticket.schema");
let SupportsService = class SupportsService {
    constructor(connection, supportModel, ticketModel) {
        this.connection = connection;
        this.supportModel = supportModel;
        this.ticketModel = ticketModel;
    }
    async findSupports(client) {
        return await this.supportModel.find({ client_id: client }, { '_id': 0, '__v': 0 }).exec();
    }
    async findSupport(client, supporter) {
        return await this.supportModel.findOne({ client_id: client, supporter_id: supporter }, { '_id': 0, '__v': 0 }).exec();
    }
    async deleteSupport(client, supporter) {
        const res = await this.supportModel.deleteOne({ client_id: client, supporter_id: supporter }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async createSupport(client, supportDto) {
        const model = new this.supportModel(Object.assign(Object.assign({}, supportDto), { client: client }));
        const modelRes = await model.save();
        if (modelRes) {
            return this.findSupport(client, supportDto.supporter_id);
        }
        return null;
    }
    async updateSupport(client, supportDto) {
        const supporter = supportDto.supporter_id;
        const res = await this.supportModel.updateOne({ client_id: client, supporter_id: supporter }, Object.assign(Object.assign({}, supportDto), { client_id: client, updated_at: Date.now() }));
        if (res && res.n > 0) {
            return this.findSupport(client, supporter);
        }
        else {
            return null;
        }
    }
    async findTickets(ticketId) {
        return await this.ticketModel.find({ ticket_id: ticketId }, { '_id': 0, '__v': 0 }).exec();
    }
    async findTicket(_id) {
        return await this.ticketModel.findOne({ _id: _id }, { '_id': 0, '__v': 0 }).exec();
    }
    async deleteTicket(_id) {
        const res = await this.ticketModel.deleteOne({ _id: _id }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async createTicket(ticketDto) {
        const model = new this.ticketModel(Object.assign({}, ticketDto));
        const modelRes = await model.save();
        if (modelRes) {
            return this.findTicket(modelRes._id);
        }
        return null;
    }
    async updateTicket(_id, ticketDto) {
        const res = await this.ticketModel.updateOne({ _id: _id }, Object.assign(Object.assign({}, ticketDto), { updated_at: Date.now() }));
        if (res && res.n > 0) {
            return this.findTicket(_id);
        }
        else {
            return null;
        }
    }
};
SupportsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectConnection()),
    __param(1, mongoose_1.InjectModel(support_schema_1.Support.name)),
    __param(2, mongoose_1.InjectModel(ticket_schema_1.Ticket.name)),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        mongoose_2.Model,
        mongoose_2.Model])
], SupportsService);
exports.SupportsService = SupportsService;
//# sourceMappingURL=supports.service.js.map