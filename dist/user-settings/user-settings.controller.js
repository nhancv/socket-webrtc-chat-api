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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_settings_service_1 = require("./user-settings.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const auth_decorator_1 = require("../auth/auth.decorator");
const user_block_dto_1 = require("./dto/user-block.dto");
const users_service_1 = require("../users/users.service");
const user_notification_schema_1 = require("./schemas/user-notification.schema");
const user_notification_dto_1 = require("./dto/user-notification.dto");
const user_content_dto_1 = require("./dto/user-content.dto");
const user_content_schema_1 = require("./schemas/user-content.schema");
let UserSettingsController = class UserSettingsController {
    constructor(usersService, userSettingsService) {
        this.usersService = usersService;
        this.userSettingsService = userSettingsService;
    }
    async reportUser(userBlockDto, payload) {
        const response = {};
        const uid = payload.uid;
        const blockUid = userBlockDto.block_uid;
        const blockUser = await this.usersService.findUserByUid(blockUid);
        if (uid == blockUid || !blockUser) {
            response.data = false;
        }
        else {
            const userBlock = await this.userSettingsService.findBlocker(uid, blockUid);
            if (!userBlock) {
                const res = await this.userSettingsService.createBlock(payload.uid, userBlockDto);
                response.data = (res != null);
            }
            else {
                const res = await this.userSettingsService.updateBlock(payload.uid, userBlockDto);
                response.data = (res != null);
            }
        }
        return response;
    }
    async updateUserNotification(userNotificationDto, payload) {
        const response = {};
        const uid = payload.uid;
        const notification = await this.userSettingsService.findNotification(uid);
        if (notification) {
            response.data = await this.userSettingsService.updateNotification(uid, userNotificationDto);
        }
        else {
            response.data = await this.userSettingsService.createNotification(uid, userNotificationDto);
        }
        return response;
    }
    async getUserNotification(payload) {
        const response = {};
        const uid = payload.uid;
        response.data = await this.userSettingsService.findNotification(uid);
        return response;
    }
    async updateUserContent(userContentDto, payload) {
        const response = {};
        const uid = payload.uid;
        const content = await this.userSettingsService.findContent(uid);
        if (content) {
            response.data = await this.userSettingsService.updateContent(uid, userContentDto);
        }
        else {
            response.data = await this.userSettingsService.createContent(uid, userContentDto);
        }
        return response;
    }
    async getUserContent(payload) {
        const response = {};
        const uid = payload.uid;
        response.data = await this.userSettingsService.findContent(uid);
        return response;
    }
};
__decorate([
    common_1.Post('report'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Report user' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: user_block_dto_1.UserBlockDto }),
    swagger_1.ApiOkResponse({
        description: 'true/false',
        type: Boolean,
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_block_dto_1.UserBlockDto, Object]),
    __metadata("design:returntype", Promise)
], UserSettingsController.prototype, "reportUser", null);
__decorate([
    common_1.Post('notification'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Update user notification setting' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: user_notification_dto_1.UserNotificationDto }),
    swagger_1.ApiOkResponse({
        description: 'User notification setting',
        type: user_notification_schema_1.UserNotification,
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_notification_dto_1.UserNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], UserSettingsController.prototype, "updateUserNotification", null);
__decorate([
    common_1.Get('notification'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Get user notification setting' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'User notification setting',
        type: user_notification_schema_1.UserNotification,
    }),
    __param(0, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserSettingsController.prototype, "getUserNotification", null);
__decorate([
    common_1.Post('content'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Update user content setting' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: user_content_dto_1.UserContentDto }),
    swagger_1.ApiOkResponse({
        description: 'User content setting',
        type: user_content_schema_1.UserContent,
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_content_dto_1.UserContentDto, Object]),
    __metadata("design:returntype", Promise)
], UserSettingsController.prototype, "updateUserContent", null);
__decorate([
    common_1.Get('content'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Get user content setting' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'User content setting',
        type: user_content_schema_1.UserContent,
    }),
    __param(0, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserSettingsController.prototype, "getUserContent", null);
UserSettingsController = __decorate([
    swagger_1.ApiTags('user settings'),
    common_1.Controller('user-settings'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        user_settings_service_1.UserSettingsService])
], UserSettingsController);
exports.UserSettingsController = UserSettingsController;
//# sourceMappingURL=user-settings.controller.js.map