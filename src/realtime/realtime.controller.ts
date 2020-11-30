import {Controller, Get, Param, UnauthorizedException, UseGuards} from '@nestjs/common';
import {RealtimeService} from "./realtime.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {AuthJwt} from "../auth/auth.decorator";
import {JwtPayload} from "../auth/jwt.payload";
import {BaseResponse} from "../models/responses/base.response";
import {WsUserEntity} from "./entities/ws-user.entity";
import {UsersService} from "../users/users.service";
import {FriendsService} from "../friends/friends.service";
import {GuestService} from "../guest/guest.service";
import {UserRelationshipDto} from "../friends/dto/user-relationship.dto";

@ApiTags('realtime')
@Controller('realtime')
export class RealtimeController {

    constructor(
        private usersService: UsersService,
        private friendsService: FriendsService,
        private realtimeService: RealtimeService,
        private guestService: GuestService
    ) {
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Get random user'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'user info',
        type: UserRelationshipDto,
    })
    async getRandomUser(@AuthJwt() payload: JwtPayload): Promise<BaseResponse<UserRelationshipDto>> {
        const response: BaseResponse<UserRelationshipDto> = {data: null};
        const userId = payload.uid;
        // Check guest valid
        const isGuestValid = await this.guestService.isGuestValid(userId);
        if (isGuestValid == 2) {
            throw new UnauthorizedException('Connection limit');
        }

        const wsUser: WsUserEntity | null = await this.realtimeService.randomUser(userId);
        if (wsUser != null) {
            response.data = await this.friendsService.getRelationship(userId, wsUser.userId);
        }
        return response;
    }


    @Get('friends/all')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Get online friends'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'List of id',
        type: [String],
    })
    async getOnlineFriends(@AuthJwt() payload: JwtPayload): Promise<BaseResponse<String[]>> {
        const response: BaseResponse<String[]> = {data: []};
        const userId = payload.uid;
        // Get friends
        const {
            friendList,
            requestReceivedList,
            requestSentList,
            favoriteFriendList,
            fullUidList
        } = await this.friendsService.getFullFriendIds(userId);

        // Get realtime user
        response.data = this.realtimeService.filterOnlineInList(fullUidList);
        return response;
    }


    @Get('friends/:friendId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Check friend is online'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'true/false',
        type: Boolean,
    })
    async getOnlineFriend(@AuthJwt() payload: JwtPayload, @Param('friendId') friendId: string): Promise<BaseResponse<Boolean>> {
        const response: BaseResponse<Boolean> = {data: false};
        const userId = payload.uid;
        // Check is online
        response.data = this.realtimeService.isOnline(friendId);
        return response;
    }
}
