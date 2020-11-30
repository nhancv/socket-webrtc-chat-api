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
exports.RelationshipDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class RelationshipDto {
    constructor(is_friend, is_full_friend, is_favorite, is_request_received, is_request_sent) {
        this.is_friend = is_friend;
        this.is_full_friend = is_full_friend;
        this.is_favorite = is_favorite;
        this.is_request_received = is_request_received;
        this.is_request_sent = is_request_sent;
    }
}
__decorate([
    swagger_1.ApiProperty({ description: 'in case: LEFT friend with RIGHT, but not sure the other side' }),
    __metadata("design:type", Boolean)
], RelationshipDto.prototype, "is_friend", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'in case: LEFT friend with RIGHT, and RIGHT friend with LEFT' }),
    __metadata("design:type", Boolean)
], RelationshipDto.prototype, "is_full_friend", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'in case: RIGHT is LEFT\'s favorite' }),
    __metadata("design:type", Boolean)
], RelationshipDto.prototype, "is_favorite", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'in case: RIGHT sent request to LEFT' }),
    __metadata("design:type", Boolean)
], RelationshipDto.prototype, "is_request_received", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'in case: LEFT sent request to RIGHT' }),
    __metadata("design:type", Boolean)
], RelationshipDto.prototype, "is_request_sent", void 0);
exports.RelationshipDto = RelationshipDto;
//# sourceMappingURL=relationship.dto.js.map