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
exports.UserBlockSchema = exports.UserBlock = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
let UserBlock = class UserBlock extends mongoose_2.Document {
    constructor(uid, block_uid, created_at, updated_at) {
        super();
        this.uid = uid;
        this.block_uid = block_uid;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
};
__decorate([
    mongoose_1.Prop({ required: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], UserBlock.prototype, "uid", void 0);
__decorate([
    mongoose_1.Prop({ required: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], UserBlock.prototype, "block_uid", void 0);
__decorate([
    mongoose_1.Prop(),
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], UserBlock.prototype, "reason", void 0);
__decorate([
    mongoose_1.Prop({ type: Date, default: Date.now }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], UserBlock.prototype, "created_at", void 0);
__decorate([
    mongoose_1.Prop({ type: Date, default: Date.now }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], UserBlock.prototype, "updated_at", void 0);
UserBlock = __decorate([
    mongoose_1.Schema(),
    __metadata("design:paramtypes", [String, String, Number, Number])
], UserBlock);
exports.UserBlock = UserBlock;
exports.UserBlockSchema = mongoose_1.SchemaFactory.createForClass(UserBlock);
//# sourceMappingURL=user-block.schema.js.map