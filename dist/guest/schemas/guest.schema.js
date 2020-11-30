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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestSchema = exports.Guest = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
let Guest = class Guest extends mongoose_2.Document {
    constructor(uid, device_id, connection_count, created_at, updated_at) {
        super();
        this.uid = uid;
        this.device_id = device_id;
        this.connection_count = connection_count;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
};
__decorate([
    mongoose_1.Prop({ required: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], Guest.prototype, "uid", void 0);
__decorate([
    mongoose_1.Prop({ required: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], Guest.prototype, "device_id", void 0);
__decorate([
    mongoose_1.Prop({ default: 0 }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], Guest.prototype, "connection_count", void 0);
__decorate([
    mongoose_1.Prop({ type: Date, default: Date.now }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], Guest.prototype, "created_at", void 0);
__decorate([
    mongoose_1.Prop({ type: Date, default: Date.now }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], Guest.prototype, "updated_at", void 0);
Guest = __decorate([
    mongoose_1.Schema(),
    __metadata("design:paramtypes", [String, String, Number, Number, Number])
], Guest);
exports.Guest = Guest;
exports.GuestSchema = mongoose_1.SchemaFactory.createForClass(Guest);
//# sourceMappingURL=guest.schema.js.map