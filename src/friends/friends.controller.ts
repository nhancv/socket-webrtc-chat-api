import {Body, Controller, Delete, Get, HttpStatus, Logger, Param, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {AuthJwt} from "../auth/auth.decorator";
import {JwtPayload} from "../auth/jwt.payload";
import {BaseResponse} from "../models/responses/base.response";
import {FriendsService} from "./friends.service";
import {RequestFriendDto} from "./dto/request-friend.dto";
import {FriendRequest} from "./schemas/friend-request.schema";
import {AcceptFriendDto} from "./dto/accept-friend.dto";
import {FriendFavorite} from "./schemas/friend-favorite.schema";
import {FavoriteFriendDto} from "./dto/favorite-friend.dto";
import {UnFriendDto} from "./dto/un-friend.dto";
import {FullFriendDto} from "./dto/full-friend.dto";
import {NotificationsService, NotificationType} from "../notifications/notifications.service";
import {UsersService} from "../users/users.service";
import {MessagesService} from "../messages/messages.service";
import {BodyMessageDto} from "../messages/dto/body-message.dto";
import {BundleNotificationDto} from "../notifications/dto/bundle-notification.dto";
import {UserRelationshipDto} from "./dto/user-relationship.dto";

@ApiTags('friends')
@Controller('friends')
export class FriendsController {
    private logger: Logger = new Logger(MessagesService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly friendsService: FriendsService,
        private readonly messagesService: MessagesService,
        private readonly notificationsService: NotificationsService
    ) {
    }

    @Post('request')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Request friend invitation'})
    @ApiBearerAuth()
    @ApiBody({type: RequestFriendDto})
    @ApiOkResponse({
        description: 'user info',
        type: FriendRequest,
    })
    async requestFriend(@Body() requestFriendDto: RequestFriendDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<FriendRequest>> {
        const response: BaseResponse<FriendRequest> = {}
        const friendRequest = await this.friendsService.getRequestFriend(payload.uid, requestFriendDto.right);
        if (friendRequest) {
            response.error = {
                code: HttpStatus.FOUND,
                message: "Already requested."
            }
        } else {
            // Check already friend
            const friend = await this.friendsService.getFriend(payload.uid, requestFriendDto.right);
            if (friend) {
                response.error = {
                    code: HttpStatus.FOUND,
                    message: "Already friend."
                }
            } else {
                // Add new request record
                response.data = await this.friendsService.newRequestFriend(payload.uid, requestFriendDto.right);
                // Add message
                const body: BodyMessageDto = {
                    type: 'text',
                    value: 'Wants to add you as a friend'
                }
                await this.messagesService.createMessage(payload.uid, {
                    left: payload.uid,
                    right: requestFriendDto.right,
                    body: JSON.stringify(body),
                    device_id: "system",
                    received: true,
                    read: true,
                    system: true,
                    color: 0
                });
                // Push notification
                const user = await this.usersService.findUserByUid(payload.uid);
                if (user) {
                    const bundle: BundleNotificationDto = {
                        uid: `${user.uid}`,
                        name: `${user.name}`,
                        avatar: `${user.avatar}`,
                    }
                    await this.notificationsService.pushNotificationToUid(
                        NotificationType.NEW_FRIEND_REQUEST,
                        requestFriendDto.right,
                        'Friend',
                        `Wants to add you as a friend`,
                        bundle
                    );
                }

            }
        }
        return response;
    }

    @Delete('request')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Cancel request friend invitation'})
    @ApiBearerAuth()
    @ApiBody({type: RequestFriendDto})
    @ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    })
    async cancelRequestFriend(@Body() requestFriendDto: RequestFriendDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        const friendRequest = await this.friendsService.getRequestFriend(payload.uid, requestFriendDto.right);
        if (!friendRequest) {
            response.error = {
                code: HttpStatus.NOT_FOUND,
                message: "Request was not found."
            }
        } else {
            response.data = await this.friendsService.deleteRequestFriend(payload.uid, requestFriendDto.right);
        }
        return response;
    }

    @Post('accept')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Accept friend invitation'})
    @ApiBearerAuth()
    @ApiBody({type: AcceptFriendDto})
    @ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    })
    async acceptRequestFriend(@Body() acceptFriendDto: AcceptFriendDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        const friendRequest = await this.friendsService.getRequestFriend(acceptFriendDto.left, payload.uid);
        if (!friendRequest) {
            response.error = {
                code: HttpStatus.NOT_FOUND, message: "Request was not found."
            }
        } else {
            let res = false;
            // Add to friend table
            const friend = await this.friendsService.newFriend(acceptFriendDto.left, payload.uid);
            if (friend) {
                // Delete request record
                res = await this.friendsService.deleteRequestFriend(acceptFriendDto.left, payload.uid);
            }
            // Push notification
            const rightUser = await this.usersService.findUserByUid(payload.uid);
            const leftUser = await this.usersService.findUserByUid(acceptFriendDto.left);

            if (rightUser && leftUser) {
                const leftBundle: BundleNotificationDto = {
                    uid: `${rightUser?.uid}`,
                    name: `${rightUser?.name}`,
                    avatar: `${rightUser?.avatar}`,
                }
                await this.notificationsService.pushNotificationToUid(NotificationType.FRIEND_ACCEPTED_LEFT,
                    leftUser.uid,
                    'Friend',
                    `Friend request has been accepted by ${rightUser?.name}`,
                    leftBundle
                );


                const rightBundle: BundleNotificationDto = {
                    uid: `${leftUser?.uid}`,
                    name: `${leftUser?.name}`,
                    avatar: `${leftUser?.avatar}`,
                }
                await this.notificationsService.pushNotificationToUid(NotificationType.FRIEND_ACCEPTED_RIGHT,
                    rightUser.uid,
                    'Friend',
                    `You\'re now friends`,
                    rightBundle
                );
                // Add message
                const body: BodyMessageDto = {
                    type: 'text',
                    value: `You\'re now friends`
                }
                await this.messagesService.createMessage(payload.uid, {
                    left: payload.uid,
                    right: acceptFriendDto.left,
                    body: JSON.stringify(body),
                    device_id: "system",
                    received: true,
                    read: true,
                    system: true,
                    color: 0
                });
            } else {
                this.logger.debug('Left or Right user is null');
            }

            response.data = res;
        }
        return response;
    }

    @Post('decline')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Decline friend invitation'})
    @ApiBearerAuth()
    @ApiBody({type: AcceptFriendDto})
    @ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    })
    async declineRequestFriend(@Body() acceptFriendDto: AcceptFriendDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        const friendRequest = await this.friendsService.getRequestFriend(acceptFriendDto.left, payload.uid);
        if (!friendRequest) {
            response.error = {
                code: HttpStatus.NOT_FOUND, message: "Request was not found."
            }
        } else {
            // Delete request record
            response.data = await this.friendsService.deleteRequestFriend(acceptFriendDto.left, payload.uid);
        }
        return response;
    }

    @Post('favorite')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Mark favorite'})
    @ApiBearerAuth()
    @ApiBody({type: FavoriteFriendDto})
    @ApiOkResponse({
        description: 'favorite info',
        type: FriendFavorite,
    })
    async markFavoriteFriend(@Body() favoriteFriendDto: FavoriteFriendDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<FriendFavorite>> {
        const response: BaseResponse<FriendFavorite> = {}
        const friendRequest = await this.friendsService.getFavoriteFriend(payload.uid, favoriteFriendDto.right);
        if (friendRequest) {
            response.error = {
                code: HttpStatus.FOUND, message: "Already requested."
            }
        } else {
            response.data = await this.friendsService.newFavoriteFriend(payload.uid, favoriteFriendDto.right);
        }
        return response;
    }

    @Delete('favorite')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Mark favorite'})
    @ApiBearerAuth()
    @ApiBody({type: FavoriteFriendDto})
    @ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    })
    async unMarkFavoriteFriend(@Body() favoriteFriendDto: FavoriteFriendDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        const friendRequest = await this.friendsService.getFavoriteFriend(payload.uid, favoriteFriendDto.right);
        if (!friendRequest) {
            response.error = {
                code: HttpStatus.NOT_FOUND, message: "Already unmarked."
            }
        } else {
            response.data = await this.friendsService.deleteFavoriteFriend(payload.uid, favoriteFriendDto.right);
        }
        return response;
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Get friends list'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'friend list',
        type: [FullFriendDto],
    })
    async getFriendList(@AuthJwt() payload: JwtPayload): Promise<BaseResponse<FullFriendDto[]>> {
        const response: BaseResponse<FullFriendDto[]> = {}
        response.data = await this.friendsService.getFullFriends(payload.uid);
        return response;
    }

    @Delete('unfriend')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Unfriend'})
    @ApiBearerAuth()
    @ApiBody({type: UnFriendDto})
    @ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    })
    async unFriend(@Body() unFriendDto: UnFriendDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        const friendRequest = await this.friendsService.getFriend(payload.uid, unFriendDto.right);
        if (!friendRequest) {
            response.error = {
                code: HttpStatus.NOT_FOUND,
                message: "Friend was not found."
            }
        } else {
            // Delete request record
            response.data = await this.friendsService.deleteFriend(payload.uid, unFriendDto.right);
            // Add message
            const body: BodyMessageDto = {
                type: 'text',
                value: 'The user removed friend connection with you'
            }
            await this.messagesService.createMessage(payload.uid, {
                left: payload.uid,
                right: unFriendDto.right,
                body: JSON.stringify(body),
                device_id: "system",
                received: true,
                read: true,
                system: true,
                color: 1
            });
        }
        return response;
    }

    @Get('info/:friendId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Get friend info'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'Relationship',
        type: UserRelationshipDto,
    })
    async getRelationship(@AuthJwt() payload: JwtPayload, @Param('friendId') friendId: string): Promise<BaseResponse<UserRelationshipDto>> {
        const response: BaseResponse<UserRelationshipDto> = {};
        const uid = payload.uid;
        response.data = await this.friendsService.getRelationship(uid, friendId);
        return response;
    }

}
