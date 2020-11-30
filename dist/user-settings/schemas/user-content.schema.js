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
exports.UserContentSchema = exports.UserContent = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
let UserContent = class UserContent extends mongoose_2.Document {
    constructor(uid, not_dubious_content, quick_connection, created_at, updated_at) {
        super();
        this.uid = uid;
        this.not_dubious_content = not_dubious_content;
        this.quick_connection = quick_connection;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
};
__decorate([
    mongoose_1.Prop({ required: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], UserContent.prototype, "uid", void 0);
__decorate([
    mongoose_1.Prop({ default: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], UserContent.prototype, "not_dubious_content", void 0);
__decorate([
    mongoose_1.Prop({ default: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], UserContent.prototype, "quick_connection", void 0);
__decorate([
    mongoose_1.Prop({ type: Date, default: Date.now }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], UserContent.prototype, "created_at", void 0);
__decorate([
    mongoose_1.Prop({ type: Date, default: Date.now }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], UserContent.prototype, "updated_at", void 0);
UserContent = __decorate([
    mongoose_1.Schema(),
    __metadata("design:paramtypes", [String, Boolean, Boolean, Number, Number])
], UserContent);
exports.UserContent = UserContent;
exports.UserContentSchema = mongoose_1.SchemaFactory.createForClass(UserContent);
//# sourceMappingURL=user-content.schema.js.map