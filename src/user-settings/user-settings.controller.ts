import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {UserSettingsService} from "./user-settings.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {AuthJwt} from "../auth/auth.decorator";
import {JwtPayload} from "../auth/jwt.payload";
import {BaseResponse} from "../models/responses/base.response";
import {UserBlockDto} from "./dto/user-block.dto";
import {UsersService} from "../users/users.service";
import {UserNotification} from "./schemas/user-notification.schema";
import {UserNotificationDto} from "./dto/user-notification.dto";
import {UserContentDto} from "./dto/user-content.dto";
import {UserContent} from "./schemas/user-content.schema";

@ApiTags('user settings')
@Controller('user-settings')
export class UserSettingsController {

    constructor(
        private readonly usersService: UsersService,
        private readonly userSettingsService: UserSettingsService
    ) {
    }

    @Post('report')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Report user'})
    @ApiBearerAuth()
    @ApiBody({type: UserBlockDto})
    @ApiOkResponse({
        description: 'true/false',
        type: Boolean,
    })
    async reportUser(@Body() userBlockDto: UserBlockDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<any> = {}
        const uid = payload.uid;
        const blockUid = userBlockDto.block_uid;
        // Verify block uid
        const blockUser = await this.usersService.findUserByUid(blockUid);
        if (uid == blockUid || !blockUser) {
            response.data = false;
        } else {
            const userBlock = await this.userSettingsService.findBlocker(uid, blockUid);
            if (!userBlock) {
                const res = await this.userSettingsService.createBlock(payload.uid, userBlockDto);
                response.data = (res != null);
            } else {
                const res = await this.userSettingsService.updateBlock(payload.uid, userBlockDto);
                response.data = (res != null);
            }
        }
        return response;
    }

    @Post('notification')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Update user notification setting'})
    @ApiBearerAuth()
    @ApiBody({type: UserNotificationDto})
    @ApiOkResponse({
        description: 'User notification setting',
        type: UserNotification,
    })
    async updateUserNotification(@Body() userNotificationDto: UserNotificationDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<UserNotification>> {
        const response: BaseResponse<any> = {}
        const uid = payload.uid;
        const notification = await this.userSettingsService.findNotification(uid);
        if (notification) {
            response.data = await this.userSettingsService.updateNotification(uid, userNotificationDto);
        } else {
            response.data = await this.userSettingsService.createNotification(uid, userNotificationDto);
        }
        return response;
    }

    @Get('notification')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Get user notification setting'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'User notification setting',
        type: UserNotification,
    })
    async getUserNotification(@AuthJwt() payload: JwtPayload): Promise<BaseResponse<UserNotification>> {
        const response: BaseResponse<any> = {}
        const uid = payload.uid;
        response.data = await this.userSettingsService.findNotification(uid);
        return response;
    }

    @Post('content')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Update user content setting'})
    @ApiBearerAuth()
    @ApiBody({type: UserContentDto})
    @ApiOkResponse({
        description: 'User content setting',
        type: UserContent,
    })
    async updateUserContent(@Body() userContentDto: UserContentDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<UserContent>> {
        const response: BaseResponse<any> = {}
        const uid = payload.uid;
        const content = await this.userSettingsService.findContent(uid);
        if (content) {
            response.data = await this.userSettingsService.updateContent(uid, userContentDto);
        } else {
            response.data = await this.userSettingsService.createContent(uid, userContentDto);
        }
        return response;
    }

    @Get('content')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Get user content setting'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'User content setting',
        type: UserContent,
    })
    async getUserContent(@AuthJwt() payload: JwtPayload): Promise<BaseResponse<UserContent>> {
        const response: BaseResponse<any> = {}
        const uid = payload.uid;
        response.data = await this.userSettingsService.findContent(uid);
        return response;
    }

}
