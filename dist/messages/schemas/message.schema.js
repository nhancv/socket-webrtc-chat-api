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
exports.MessageSchema = exports.Message = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
let Message = class Message extends mongoose_2.Document {
    constructor(left, right, body, device_id, read, received, system, color, edited, is_sender, created_at, updated_at) {
        super();
        this.left = left;
        this.right = right;
        this.body = body;
        this.device_id = device_id;
        this.read = read;
        this.received = received;
        this.system = system;
        this.color = color;
        this.edited = edited;
        this.is_sender = is_sender;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
};
__decorate([
    mongoose_1.Prop({ required: true }),
    swagger_1.ApiProperty({ description: 'sender uid' }),
    __metadata("design:type", String)
], Message.prototype, "left", void 0);
__decorate([
    mongoose_1.Prop({ required: true }),
    swagger_1.ApiProperty({ description: 'recipient uid' }),
    __metadata("design:type", String)
], Message.prototype, "right", void 0);
__decorate([
    mongoose_1.Prop({ required: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], Message.prototype, "body", void 0);
__decorate([
    mongoose_1.Prop({ required: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], Message.prototype, "device_id", void 0);
__decorate([
    mongoose_1.Prop({ default: false }),
    swagger_1.ApiProperty({ description: 'The message from server delivered to B device' }),
    __metadata("design:type", Boolean)
], Message.prototype, "received", void 0);
__decorate([
    mongoose_1.Prop({ default: false }),
    swagger_1.ApiProperty({ description: 'The message from B device was read by user' }),
    __metadata("design:type", Boolean)
], Message.prototype, "read", void 0);
__decorate([
    mongoose_1.Prop({ default: false }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], Message.prototype, "edited", void 0);
__decorate([
    mongoose_1.Prop({ default: false }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], Message.prototype, "system", void 0);
__decorate([
    mongoose_1.Prop({ default: -1 }),
    swagger_1.ApiProperty({ description: '-1: default, 0: green, 1: red' }),
    __metadata("design:type", Number)
], Message.prototype, "color", void 0);
__decorate([
    mongoose_1.Prop(),
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], Message.prototype, "is_sender", void 0);
__decorate([
    mongoose_1.Prop({ type: Date, default: Date.now }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], Message.prototype, "created_at", void 0);
__decorate([
    mongoose_1.Prop({ type: Date, default: Date.now }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], Message.prototype, "updated_at", void 0);
Message = __decorate([
    mongoose_1.Schema(),
    __metadata("design:paramtypes", [String, String, String, String, Boolean, Boolean, Boolean, Number, Boolean, Boolean, Number, Number])
], Message);
exports.Message = Message;
exports.MessageSchema = mongoose_1.SchemaFactory.createForClass(Message);
//# sourceMappingURL=message.schema.js.map