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
exports.UserNotificationSchema = exports.UserNotification = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
let UserNotification = class UserNotification extends mongoose_2.Document {
    constructor(uid, activity_related_profile, latest_news_our_service, message_from_out_partner, created_at, updated_at) {
        super();
        this.uid = uid;
        this.activity_related_profile = activity_related_profile;
        this.latest_news_our_service = latest_news_our_service;
        this.message_from_out_partner = message_from_out_partner;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
};
__decorate([
    mongoose_1.Prop({ required: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], UserNotification.prototype, "uid", void 0);
__decorate([
    mongoose_1.Prop({ default: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], UserNotification.prototype, "activity_related_profile", void 0);
__decorate([
    mongoose_1.Prop({ default: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], UserNotification.prototype, "latest_news_our_service", void 0);
__decorate([
    mongoose_1.Prop({ default: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], UserNotification.prototype, "message_from_out_partner", void 0);
__decorate([
    mongoose_1.Prop({ type: Date, default: Date.now }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], UserNotification.prototype, "created_at", void 0);
__decorate([
    mongoose_1.Prop({ type: Date, default: Date.now }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], UserNotification.prototype, "updated_at", void 0);
UserNotification = __decorate([
    mongoose_1.Schema(),
    __metadata("design:paramtypes", [String, Boolean, Boolean, Boolean, Number, Number])
], UserNotification);
exports.UserNotification = UserNotification;
exports.UserNotificationSchema = mongoose_1.SchemaFactory.createForClass(UserNotification);
//# sourceMappingURL=user-notification.schema.js.map