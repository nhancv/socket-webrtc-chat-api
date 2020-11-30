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
exports.FullNotificationDto = void 0;
const create_notification_dto_1 = require("./create-notification.dto");
const swagger_1 = require("@nestjs/swagger");
class FullNotificationDto extends create_notification_dto_1.CreateNotificationDto {
    constructor(uid, device_id, fcm_token) {
        super(device_id, fcm_token);
        this.uid = uid;
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], FullNotificationDto.prototype, "uid", void 0);
exports.FullNotificationDto = FullNotificationDto;
//# sourceMappingURL=full-notification.dto.js.map