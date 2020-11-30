import {Controller, Get, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {AuthJwt} from "../auth/auth.decorator";
import {JwtPayload} from "../auth/jwt.payload";
import {BaseResponse} from "../models/responses/base.response";
import {HistoriesService} from "./histories.service";
import {UsersService} from "../users/users.service";
import {FriendsService} from "../friends/friends.service";
import {UserSettingsService} from "../user-settings/user-settings.service";
import {UserRelationshipDto} from "../friends/dto/user-relationship.dto";

@ApiTags('histories')
@Controller('histories')
export class HistoriesController {

    constructor(
        private readonly usersService: UsersService,
        private readonly friendsService: FriendsService,
        private readonly historiesService: HistoriesService,
        private readonly userSettingsService: UserSettingsService
    ) {
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Get histories'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'Histories',
        type: [UserRelationshipDto],
    })
    async getHistories(@AuthJwt() payload: JwtPayload): Promise<BaseResponse<UserRelationshipDto[]>> {
        const response: BaseResponse<UserRelationshipDto[]> = {}
        const uid = payload.uid;
        let histories = (await this.historiesService.getHistories(uid));

        // Get block list
        const blocks = await this.userSettingsService.findBlockers(uid);
        const blockMap = {};
        for (let i = 0; i < blocks.length; i++) {
            blockMap[blocks[i].block_uid] = true;
        }
        histories = histories.filter(((value, index) => !blockMap.hasOwnProperty(value.friend_id)))

        const results: UserRelationshipDto[] = [];
        for (let i = 0; i < histories.length; i++) {
            const history = histories[i];
            const relation = await this.friendsService.getRelationship(uid, history.friend_id);
            if (relation) {
                results.push(relation);
            }
        }
        response.data = results;
        return response;
    }
}
