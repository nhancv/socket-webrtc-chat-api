import {Body, Controller, HttpStatus, Post, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {NotificationsService} from "./notifications.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {RequestFriendDto} from "../friends/dto/request-friend.dto";
import {FriendRequest} from "../friends/schemas/friend-request.schema";
import {AuthJwt} from "../auth/auth.decorator";
import {JwtPayload} from "../auth/jwt.payload";
import {BaseResponse} from "../models/responses/base.response";
import {CreateNotificationDto} from "./dto/create-notification.dto";
import {Notification} from "./schemas/notification.schema";

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {

    constructor(private readonly notificationsService: NotificationsService) {
    }

    @Post('token')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Update notification token'})
    @ApiBearerAuth()
    @ApiBody({type: CreateNotificationDto})
    @ApiOkResponse({
        description: 'Notification info',
        type: Notification,
    })
    async updateNotificationToken(@Body() createNotificationDto: CreateNotificationDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<Notification>> {
        const response: BaseResponse<Notification> = {}
        const uid = payload.uid;
        const notification = await this.notificationsService.getNotification(uid, createNotificationDto.device_id);
        // Remove duplication
        await this.notificationsService.deleteDuplicationNotifications(createNotificationDto.device_id, createNotificationDto.fcm_token);
        // Add new to database
        if (notification) {
            response.data = await this.notificationsService.updateNotification(uid, createNotificationDto);
        } else {
            response.data = await this.notificationsService.createNotification(uid, createNotificationDto);
        }
        return response;
    }
}
