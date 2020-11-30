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
exports.FullFriendDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const message_schema_1 = require("../../messages/schemas/message.schema");
const relationship_dto_1 = require("./relationship.dto");
class FullFriendDto {
    constructor(uid, name, avatar, last_message, un_read, relationship) {
        this.uid = uid;
        this.name = name;
        this.avatar = avatar;
        this.last_message = last_message;
        this.un_read = un_read;
        this.relationship = relationship;
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], FullFriendDto.prototype, "uid", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], FullFriendDto.prototype, "name", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], FullFriendDto.prototype, "avatar", void 0);
__decorate([
    swagger_1.ApiProperty({ type: message_schema_1.Message }),
    __metadata("design:type", message_schema_1.Message)
], FullFriendDto.prototype, "last_message", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], FullFriendDto.prototype, "un_read", void 0);
__decorate([
    swagger_1.ApiProperty({ type: relationship_dto_1.RelationshipDto }),
    __metadata("design:type", relationship_dto_1.RelationshipDto)
], FullFriendDto.prototype, "relationship", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], FullFriendDto.prototype, "is_request_friend", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], FullFriendDto.prototype, "is_friend", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], FullFriendDto.prototype, "is_full_friend", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], FullFriendDto.prototype, "is_favorite", void 0);
exports.FullFriendDto = FullFriendDto;
//# sourceMappingURL=full-friend.dto.js.map