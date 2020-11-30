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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("./notifications.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const auth_decorator_1 = require("../auth/auth.decorator");
const create_notification_dto_1 = require("./dto/create-notification.dto");
const notification_schema_1 = require("./schemas/notification.schema");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async updateNotificationToken(createNotificationDto, payload) {
        const response = {};
        const uid = payload.uid;
        const notification = await this.notificationsService.getNotification(uid, createNotificationDto.device_id);
        await this.notificationsService.deleteDuplicationNotifications(createNotificationDto.device_id, createNotificationDto.fcm_token);
        if (notification) {
            response.data = await this.notificationsService.updateNotification(uid, createNotificationDto);
        }
        else {
            response.data = await this.notificationsService.createNotification(uid, createNotificationDto);
        }
        return response;
    }
};
__decorate([
    common_1.Post('token'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Update notification token' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: create_notification_dto_1.CreateNotificationDto }),
    swagger_1.ApiOkResponse({
        description: 'Notification info',
        type: notification_schema_1.Notification,
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateNotificationToken", null);
NotificationsController = __decorate([
    swagger_1.ApiTags('notifications'),
    common_1.Controller('notifications'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
exports.NotificationsController = NotificationsController;
//# sourceMappingURL=notifications.controller.js.map