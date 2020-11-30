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
var MigrationService_1_0_16_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationService_1_0_16 = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_config_service_1 = require("../app-config/app-config.service");
const messages_service_1 = require("../messages/messages.service");
const mongoose_1 = require("mongoose");
let MigrationService_1_0_16 = MigrationService_1_0_16_1 = class MigrationService_1_0_16 {
    constructor(configService, appConfigService, messagesService) {
        this.configService = configService;
        this.appConfigService = appConfigService;
        this.messagesService = messagesService;
        this.logger = new common_1.Logger(MigrationService_1_0_16_1.name);
    }
    async migrate(appConfig) {
        this.logger.debug('MigrationService_1_0_16');
        const messages = await this.messagesService.getAllMessage();
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i].toObject();
            if (msg.is_sender === undefined) {
                msg.is_sender = true;
                await this.messagesService.putRawMessage(msg, msg._id);
                msg._id = null;
                msg.is_sender = false;
                await this.messagesService.putRawMessage(msg, new mongoose_1.mongo.ObjectId());
            }
        }
    }
};
MigrationService_1_0_16 = MigrationService_1_0_16_1 = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        app_config_service_1.AppConfigService,
        messages_service_1.MessagesService])
], MigrationService_1_0_16);
exports.MigrationService_1_0_16 = MigrationService_1_0_16;
//# sourceMappingURL=migration-service_1_0_16.service.js.map