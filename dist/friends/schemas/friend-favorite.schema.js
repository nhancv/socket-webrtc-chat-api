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
exports.FriendFavoriteSchema = exports.FriendFavorite = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
let FriendFavorite = class FriendFavorite extends mongoose_2.Document {
    constructor(left, right, created_at, updated_at) {
        super();
        this.left = left;
        this.right = right;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
};
__decorate([
    mongoose_1.Prop({ required: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], FriendFavorite.prototype, "left", void 0);
__decorate([
    mongoose_1.Prop({ required: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], FriendFavorite.prototype, "right", void 0);
__decorate([
    mongoose_1.Prop({ type: Date, default: Date.now }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], FriendFavorite.prototype, "created_at", void 0);
__decorate([
    mongoose_1.Prop({ type: Date, default: Date.now }),
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], FriendFavorite.prototype, "updated_at", void 0);
FriendFavorite = __decorate([
    mongoose_1.Schema(),
    __metadata("design:paramtypes", [String, String, Number, Number])
], FriendFavorite);
exports.FriendFavorite = FriendFavorite;
exports.FriendFavoriteSchema = mongoose_1.SchemaFactory.createForClass(FriendFavorite);
//# sourceMappingURL=friend-favorite.schema.js.map