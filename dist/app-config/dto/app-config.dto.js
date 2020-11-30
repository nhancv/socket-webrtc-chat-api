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
exports.AppConfigDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const mongoose_1 = require("@nestjs/mongoose");
class AppConfigDto {
    constructor(version, ios_version, ad_version) {
        this.version = version;
        this.ios_version = ios_version;
        this.ad_version = ad_version;
    }
}
__decorate([
    mongoose_1.Prop({ required: true }),
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], AppConfigDto.prototype, "version", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'iOS version code' }),
    __metadata("design:type", Number)
], AppConfigDto.prototype, "ios_version", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'Android version code' }),
    __metadata("design:type", Number)
], AppConfigDto.prototype, "ad_version", void 0);
exports.AppConfigDto = AppConfigDto;
//# sourceMappingURL=app-config.dto.js.map