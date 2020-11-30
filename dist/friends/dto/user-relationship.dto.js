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
exports.UserRelationshipDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const user_schema_1 = require("../../users/schemas/user.schema");
const relationship_dto_1 = require("./relationship.dto");
class UserRelationshipDto {
    constructor(user, relationship) {
        this.user = user;
        this.relationship = relationship;
    }
}
__decorate([
    swagger_1.ApiProperty({ type: user_schema_1.User }),
    __metadata("design:type", user_schema_1.User)
], UserRelationshipDto.prototype, "user", void 0);
__decorate([
    swagger_1.ApiProperty({ type: relationship_dto_1.RelationshipDto }),
    __metadata("design:type", relationship_dto_1.RelationshipDto)
], UserRelationshipDto.prototype, "relationship", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], UserRelationshipDto.prototype, "is_friend", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], UserRelationshipDto.prototype, "is_full_friend", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], UserRelationshipDto.prototype, "is_favorite", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], UserRelationshipDto.prototype, "is_request_friend", void 0);
exports.UserRelationshipDto = UserRelationshipDto;
//# sourceMappingURL=user-relationship.dto.js.map