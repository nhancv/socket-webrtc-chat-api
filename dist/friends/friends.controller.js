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
exports.FriendsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("../auth/auth.decorator");
const friends_service_1 = require("./friends.service");
const request_friend_dto_1 = require("./dto/request-friend.dto");
const friend_request_schema_1 = require("./schemas/friend-request.schema");
const accept_friend_dto_1 = require("./dto/accept-friend.dto");
const friend_favorite_schema_1 = require("./schemas/friend-favorite.schema");
const favorite_friend_dto_1 = require("./dto/favorite-friend.dto");
const un_friend_dto_1 = require("./dto/un-friend.dto");
const full_friend_dto_1 = require("./dto/full-friend.dto");
const notifications_service_1 = require("../notifications/notifications.service");
const users_service_1 = require("../users/users.service");
const messages_service_1 = require("../messages/messages.service");
const user_relationship_dto_1 = require("./dto/user-relationship.dto");
let FriendsController = class FriendsController {
    constructor(usersService, friendsService, messagesService, notificationsService) {
        this.usersService = usersService;
        this.friendsService = friendsService;
        this.messagesService = messagesService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(messages_service_1.MessagesService.name);
    }
    async requestFriend(requestFriendDto, payload) {
        const response = {};
        const friendRequest = await this.friendsService.getRequestFriend(payload.uid, requestFriendDto.right);
        if (friendRequest) {
            response.error = {
                code: common_1.HttpStatus.FOUND,
                message: "Already requested."
            };
        }
        else {
            const friend = await this.friendsService.getFriend(payload.uid, requestFriendDto.right);
            if (friend) {
                response.error = {
                    code: common_1.HttpStatus.FOUND,
                    message: "Already friend."
                };
            }
            else {
                response.data = await this.friendsService.newRequestFriend(payload.uid, requestFriendDto.right);
                const body = {
                    type: 'text',
                    value: 'Wants to add you as a friend'
                };
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
                const user = await this.usersService.findUserByUid(payload.uid);
                if (user) {
                    const bundle = {
                        uid: `${user.uid}`,
                        name: `${user.name}`,
                        avatar: `${user.avatar}`,
                    };
                    await this.notificationsService.pushNotificationToUid(notifications_service_1.NotificationType.NEW_FRIEND_REQUEST, requestFriendDto.right, 'Friend', `Wants to add you as a friend`, bundle);
                }
            }
        }
        return response;
    }
    async cancelRequestFriend(requestFriendDto, payload) {
        const response = {};
        const friendRequest = await this.friendsService.getRequestFriend(payload.uid, requestFriendDto.right);
        if (!friendRequest) {
            response.error = {
                code: common_1.HttpStatus.NOT_FOUND,
                message: "Request was not found."
            };
        }
        else {
            response.data = await this.friendsService.deleteRequestFriend(payload.uid, requestFriendDto.right);
        }
        return response;
    }
    async acceptRequestFriend(acceptFriendDto, payload) {
        const response = {};
        const friendRequest = await this.friendsService.getRequestFriend(acceptFriendDto.left, payload.uid);
        if (!friendRequest) {
            response.error = {
                code: common_1.HttpStatus.NOT_FOUND, message: "Request was not found."
            };
        }
        else {
            let res = false;
            const friend = await this.friendsService.newFriend(acceptFriendDto.left, payload.uid);
            if (friend) {
                res = await this.friendsService.deleteRequestFriend(acceptFriendDto.left, payload.uid);
            }
            const rightUser = await this.usersService.findUserByUid(payload.uid);
            const leftUser = await this.usersService.findUserByUid(acceptFriendDto.left);
            if (rightUser && leftUser) {
                const leftBundle = {
                    uid: `${rightUser === null || rightUser === void 0 ? void 0 : rightUser.uid}`,
                    name: `${rightUser === null || rightUser === void 0 ? void 0 : rightUser.name}`,
                    avatar: `${rightUser === null || rightUser === void 0 ? void 0 : rightUser.avatar}`,
                };
                await this.notificationsService.pushNotificationToUid(notifications_service_1.NotificationType.FRIEND_ACCEPTED_LEFT, leftUser.uid, 'Friend', `Friend request has been accepted by ${rightUser === null || rightUser === void 0 ? void 0 : rightUser.name}`, leftBundle);
                const rightBundle = {
                    uid: `${leftUser === null || leftUser === void 0 ? void 0 : leftUser.uid}`,
                    name: `${leftUser === null || leftUser === void 0 ? void 0 : leftUser.name}`,
                    avatar: `${leftUser === null || leftUser === void 0 ? void 0 : leftUser.avatar}`,
                };
                await this.notificationsService.pushNotificationToUid(notifications_service_1.NotificationType.FRIEND_ACCEPTED_RIGHT, rightUser.uid, 'Friend', `You\'re now friends`, rightBundle);
                const body = {
                    type: 'text',
                    value: `You\'re now friends`
                };
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
            }
            else {
                this.logger.debug('Left or Right user is null');
            }
            response.data = res;
        }
        return response;
    }
    async declineRequestFriend(acceptFriendDto, payload) {
        const response = {};
        const friendRequest = await this.friendsService.getRequestFriend(acceptFriendDto.left, payload.uid);
        if (!friendRequest) {
            response.error = {
                code: common_1.HttpStatus.NOT_FOUND, message: "Request was not found."
            };
        }
        else {
            response.data = await this.friendsService.deleteRequestFriend(acceptFriendDto.left, payload.uid);
        }
        return response;
    }
    async markFavoriteFriend(favoriteFriendDto, payload) {
        const response = {};
        const friendRequest = await this.friendsService.getFavoriteFriend(payload.uid, favoriteFriendDto.right);
        if (friendRequest) {
            response.error = {
                code: common_1.HttpStatus.FOUND, message: "Already requested."
            };
        }
        else {
            response.data = await this.friendsService.newFavoriteFriend(payload.uid, favoriteFriendDto.right);
        }
        return response;
    }
    async unMarkFavoriteFriend(favoriteFriendDto, payload) {
        const response = {};
        const friendRequest = await this.friendsService.getFavoriteFriend(payload.uid, favoriteFriendDto.right);
        if (!friendRequest) {
            response.error = {
                code: common_1.HttpStatus.NOT_FOUND, message: "Already unmarked."
            };
        }
        else {
            response.data = await this.friendsService.deleteFavoriteFriend(payload.uid, favoriteFriendDto.right);
        }
        return response;
    }
    async getFriendList(payload) {
        const response = {};
        response.data = await this.friendsService.getFullFriends(payload.uid);
        return response;
    }
    async unFriend(unFriendDto, payload) {
        const response = {};
        const friendRequest = await this.friendsService.getFriend(payload.uid, unFriendDto.right);
        if (!friendRequest) {
            response.error = {
                code: common_1.HttpStatus.NOT_FOUND,
                message: "Friend was not found."
            };
        }
        else {
            response.data = await this.friendsService.deleteFriend(payload.uid, unFriendDto.right);
            const body = {
                type: 'text',
                value: 'The user removed friend connection with you'
            };
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
    async getRelationship(payload, friendId) {
        const response = {};
        const uid = payload.uid;
        response.data = await this.friendsService.getRelationship(uid, friendId);
        return response;
    }
};
__decorate([
    common_1.Post('request'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Request friend invitation' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: request_friend_dto_1.RequestFriendDto }),
    swagger_1.ApiOkResponse({
        description: 'user info',
        type: friend_request_schema_1.FriendRequest,
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_friend_dto_1.RequestFriendDto, Object]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "requestFriend", null);
__decorate([
    common_1.Delete('request'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Cancel request friend invitation' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: request_friend_dto_1.RequestFriendDto }),
    swagger_1.ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_friend_dto_1.RequestFriendDto, Object]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "cancelRequestFriend", null);
__decorate([
    common_1.Post('accept'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Accept friend invitation' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: accept_friend_dto_1.AcceptFriendDto }),
    swagger_1.ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accept_friend_dto_1.AcceptFriendDto, Object]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "acceptRequestFriend", null);
__decorate([
    common_1.Post('decline'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Decline friend invitation' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: accept_friend_dto_1.AcceptFriendDto }),
    swagger_1.ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accept_friend_dto_1.AcceptFriendDto, Object]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "declineRequestFriend", null);
__decorate([
    common_1.Post('favorite'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Mark favorite' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: favorite_friend_dto_1.FavoriteFriendDto }),
    swagger_1.ApiOkResponse({
        description: 'favorite info',
        type: friend_favorite_schema_1.FriendFavorite,
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [favorite_friend_dto_1.FavoriteFriendDto, Object]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "markFavoriteFriend", null);
__decorate([
    common_1.Delete('favorite'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Mark favorite' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: favorite_friend_dto_1.FavoriteFriendDto }),
    swagger_1.ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [favorite_friend_dto_1.FavoriteFriendDto, Object]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "unMarkFavoriteFriend", null);
__decorate([
    common_1.Get('all'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Get friends list' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'friend list',
        type: [full_friend_dto_1.FullFriendDto],
    }),
    __param(0, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "getFriendList", null);
__decorate([
    common_1.Delete('unfriend'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Unfriend' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: un_friend_dto_1.UnFriendDto }),
    swagger_1.ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [un_friend_dto_1.UnFriendDto, Object]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "unFriend", null);
__decorate([
    common_1.Get('info/:friendId'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Get friend info' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'Relationship',
        type: user_relationship_dto_1.UserRelationshipDto,
    }),
    __param(0, auth_decorator_1.AuthJwt()), __param(1, common_1.Param('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "getRelationship", null);
FriendsController = __decorate([
    swagger_1.ApiTags('friends'),
    common_1.Controller('friends'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        friends_service_1.FriendsService,
        messages_service_1.MessagesService,
        notifications_service_1.NotificationsService])
], FriendsController);
exports.FriendsController = FriendsController;
//# sourceMappingURL=friends.controller.js.map