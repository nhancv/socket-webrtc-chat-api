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
exports.RealtimeController = void 0;
const common_1 = require("@nestjs/common");
const realtime_service_1 = require("./realtime.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("../auth/auth.decorator");
const users_service_1 = require("../users/users.service");
const friends_service_1 = require("../friends/friends.service");
const guest_service_1 = require("../guest/guest.service");
const user_relationship_dto_1 = require("../friends/dto/user-relationship.dto");
let RealtimeController = class RealtimeController {
    constructor(usersService, friendsService, realtimeService, guestService) {
        this.usersService = usersService;
        this.friendsService = friendsService;
        this.realtimeService = realtimeService;
        this.guestService = guestService;
    }
    async getRandomUser(payload) {
        const response = { data: null };
        const userId = payload.uid;
        const isGuestValid = await this.guestService.isGuestValid(userId);
        if (isGuestValid == 2) {
            throw new common_1.UnauthorizedException('Connection limit');
        }
        const wsUser = await this.realtimeService.randomUser(userId);
        if (wsUser != null) {
            response.data = await this.friendsService.getRelationship(userId, wsUser.userId);
        }
        return response;
    }
    async getOnlineFriends(payload) {
        const response = { data: [] };
        const userId = payload.uid;
        const { friendList, requestReceivedList, requestSentList, favoriteFriendList, fullUidList } = await this.friendsService.getFullFriendIds(userId);
        response.data = this.realtimeService.filterOnlineInList(fullUidList);
        return response;
    }
    async getOnlineFriend(payload, friendId) {
        const response = { data: false };
        const userId = payload.uid;
        response.data = this.realtimeService.isOnline(friendId);
        return response;
    }
};
__decorate([
    common_1.Get(),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Get random user' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'user info',
        type: user_relationship_dto_1.UserRelationshipDto,
    }),
    __param(0, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RealtimeController.prototype, "getRandomUser", null);
__decorate([
    common_1.Get('friends/all'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Get online friends' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'List of id',
        type: [String],
    }),
    __param(0, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RealtimeController.prototype, "getOnlineFriends", null);
__decorate([
    common_1.Get('friends/:friendId'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Check friend is online' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'true/false',
        type: Boolean,
    }),
    __param(0, auth_decorator_1.AuthJwt()), __param(1, common_1.Param('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RealtimeController.prototype, "getOnlineFriend", null);
RealtimeController = __decorate([
    swagger_1.ApiTags('realtime'),
    common_1.Controller('realtime'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        friends_service_1.FriendsService,
        realtime_service_1.RealtimeService,
        guest_service_1.GuestService])
], RealtimeController);
exports.RealtimeController = RealtimeController;
//# sourceMappingURL=realtime.controller.js.map