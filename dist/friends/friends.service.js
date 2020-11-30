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
exports.FriendsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const friend_schema_1 = require("./schemas/friend.schema");
const friend_request_schema_1 = require("./schemas/friend-request.schema");
const friend_favorite_schema_1 = require("./schemas/friend-favorite.schema");
const users_service_1 = require("../users/users.service");
const messages_service_1 = require("../messages/messages.service");
const user_settings_service_1 = require("../user-settings/user-settings.service");
let FriendsService = class FriendsService {
    constructor(usersService, userSettingsService, messagesService, connection, friendModel, friendRequestModel, friendFavoriteModel) {
        this.usersService = usersService;
        this.userSettingsService = userSettingsService;
        this.messagesService = messagesService;
        this.connection = connection;
        this.friendModel = friendModel;
        this.friendRequestModel = friendRequestModel;
        this.friendFavoriteModel = friendFavoriteModel;
    }
    async getFullFriendIds(uid) {
        const friendList = await this.friendModel.find({ left: uid }, { '_id': 0, '__v': 0 }).exec();
        const requestReceivedList = await this.friendRequestModel.find({ right: uid }, { '_id': 0, '__v': 0 }).exec();
        const requestSentList = await this.friendRequestModel.find({ left: uid }, { '_id': 0, '__v': 0 }).exec();
        const favoriteFriendList = await this.friendFavoriteModel.find({ left: uid }, { '_id': 0, '__v': 0 }).exec();
        const fullUidList = [];
        for (let i = 0; i < friendList.length; i++) {
            fullUidList.push(friendList[i].right);
        }
        for (let i = 0; i < requestReceivedList.length; i++) {
            const uid = requestReceivedList[i].left;
            if (fullUidList.indexOf(uid) === -1) {
                fullUidList.push(uid);
            }
        }
        for (let i = 0; i < requestSentList.length; i++) {
            const uid = requestSentList[i].right;
            if (fullUidList.indexOf(uid) === -1) {
                fullUidList.push(uid);
            }
        }
        for (let i = 0; i < favoriteFriendList.length; i++) {
            const uid = favoriteFriendList[i].right;
            if (fullUidList.indexOf(uid) === -1) {
                fullUidList.push(uid);
            }
        }
        return {
            friendList,
            requestReceivedList,
            requestSentList,
            favoriteFriendList,
            fullUidList
        };
    }
    async getFullFriends(uid) {
        const { friendList, requestReceivedList, requestSentList, favoriteFriendList, fullUidList } = await this.getFullFriendIds(uid);
        const friendListRightSide = await this.friendModel.find({ right: uid }, { '_id': 0, '__v': 0 }).exec();
        const list = {};
        const friendListDetail = await this.usersService.findAllInList(fullUidList);
        for (let i = 0; i < friendListDetail.length; i++) {
            const item = friendListDetail[i];
            const lastMessage = await this.messagesService.getLastMessage(uid, item.uid);
            const unReadMessageCount = await this.messagesService.getUnReadMessageCount(uid, item.uid);
            const isFriend = friendList.filter(((value, index) => item.uid == value.right)).length > 0;
            const isFullFriend = isFriend && friendListRightSide.filter(((value, index) => item.uid == value.left)).length > 0;
            const isRequestReceived = requestReceivedList.filter(((value, index) => item.uid == value.left)).length > 0;
            const isRequestSent = requestSentList.filter(((value, index) => item.uid == value.right)).length > 0;
            const isFavorite = favoriteFriendList.filter(((value, index) => item.uid == value.right)).length > 0;
            list[item.uid] = {
                uid: item.uid,
                name: item.name,
                avatar: item.avatar,
                last_message: lastMessage ? lastMessage : undefined,
                un_read: unReadMessageCount,
                relationship: {
                    is_friend: isFriend,
                    is_full_friend: isFullFriend,
                    is_favorite: isFavorite,
                    is_request_received: isRequestReceived,
                    is_request_sent: isRequestSent
                },
                is_friend: isFriend,
                is_full_friend: isFullFriend,
                is_favorite: isFavorite,
                is_request_friend: isRequestReceived,
            };
        }
        const blocks = await this.userSettingsService.findBlockers(uid);
        for (let i = 0; i < blocks.length; i++) {
            delete list[blocks[i].block_uid];
        }
        return Object.values(list);
    }
    async getRelationship(left, right) {
        if (left === right)
            return null;
        const user = await this.usersService.findUserByUid(right);
        if (user) {
            const leftFriendSide = await this.getFriend(left, right) !== null;
            const rightFriendSide = await this.getFriend(right, left) !== null;
            const isFullFriend = leftFriendSide && rightFriendSide;
            const isRequestReceived = await this.getRequestFriend(right, left) !== null;
            const isRequestSent = await this.getRequestFriend(left, right) !== null;
            const isFavorite = await this.getFavoriteFriend(left, right) !== null;
            return {
                user: user,
                relationship: {
                    is_friend: leftFriendSide,
                    is_full_friend: isFullFriend,
                    is_favorite: isFavorite,
                    is_request_received: isRequestReceived,
                    is_request_sent: isRequestSent
                },
                is_friend: leftFriendSide,
                is_full_friend: isFullFriend,
                is_favorite: isFavorite,
                is_request_friend: leftFriendSide || isRequestSent,
            };
        }
        return null;
    }
    async getFriends(left) {
        return await this.friendModel.find({ left: left }, { '_id': 0, '__v': 0 }).exec();
    }
    async getFriend(left, right) {
        if (left === right)
            return null;
        return await this.friendModel.findOne({ left: left, right: right }, { '_id': 0, '__v': 0 }).exec();
    }
    async newFriend(left, right) {
        if (left === right)
            return null;
        const friendModelLeftSide = new this.friendModel({ left: left, right: right });
        const userLeftSide = await friendModelLeftSide.save();
        const rightSide = await this.getFriend(right, left);
        if (!rightSide) {
            const friendModelRightSide = new this.friendModel({ left: right, right: left });
            await friendModelRightSide.save();
        }
        if (userLeftSide) {
            return this.getFriend(left, right);
        }
        return null;
    }
    async deleteFriend(left, right) {
        if (left === right)
            return false;
        const res = await this.friendModel.deleteMany({ left: left, right: right }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async getRequestFriend(left, right) {
        if (left === right)
            return null;
        return await this.friendRequestModel.findOne({ left: left, right: right }, { '_id': 0, '__v': 0 }).exec();
    }
    async newRequestFriend(left, right) {
        if (left === right)
            return null;
        const friendRequest = {
            left: left,
            right: right
        };
        const friendModel = new this.friendRequestModel(friendRequest);
        const user = await friendModel.save();
        if (user) {
            return this.getRequestFriend(left, right);
        }
        return null;
    }
    async deleteRequestFriend(left, right) {
        if (left === right)
            return false;
        const res = await this.friendRequestModel.deleteMany({ left: left, right: right }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
    async deleteAllGuestByUid(uid) {
        await this.friendModel.deleteMany({ $or: [{ left: uid }, { right: uid }] });
        await this.friendFavoriteModel.deleteMany({ $or: [{ left: uid }, { right: uid }] });
        await this.friendRequestModel.deleteMany({ $or: [{ left: uid }, { right: uid }] });
    }
    async getFavoriteFriend(left, right) {
        if (left === right)
            return null;
        return await this.friendFavoriteModel.findOne({ left: left, right: right }, { '_id': 0, '__v': 0 }).exec();
    }
    async newFavoriteFriend(left, right) {
        if (left === right)
            return null;
        const friendFavorite = {
            left: left,
            right: right
        };
        const friendModel = new this.friendFavoriteModel(friendFavorite);
        const user = await friendModel.save();
        if (user) {
            return this.getFavoriteFriend(left, right);
        }
        return null;
    }
    async deleteFavoriteFriend(left, right) {
        if (left === right)
            return false;
        const res = await this.friendFavoriteModel.deleteMany({ left: left, right: right }).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }
};
FriendsService = __decorate([
    common_1.Injectable(),
    __param(3, mongoose_1.InjectConnection()),
    __param(4, mongoose_1.InjectModel(friend_schema_1.Friend.name)),
    __param(5, mongoose_1.InjectModel(friend_request_schema_1.FriendRequest.name)),
    __param(6, mongoose_1.InjectModel(friend_favorite_schema_1.FriendFavorite.name)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        user_settings_service_1.UserSettingsService,
        messages_service_1.MessagesService,
        mongoose_2.Connection,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], FriendsService);
exports.FriendsService = FriendsService;
//# sourceMappingURL=friends.service.js.map