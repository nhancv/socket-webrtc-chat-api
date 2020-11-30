import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from "@nestjs/mongoose";
import {Connection, Model} from "mongoose";
import {Friend} from "./schemas/friend.schema";
import {FriendRequest} from "./schemas/friend-request.schema";
import {FriendFavorite} from "./schemas/friend-favorite.schema";
import {FullFriendDto} from "./dto/full-friend.dto";
import {UsersService} from "../users/users.service";
import {MessagesService} from "../messages/messages.service";
import {UserSettingsService} from "../user-settings/user-settings.service";
import {UserRelationshipDto} from "./dto/user-relationship.dto";

@Injectable()
export class FriendsService {
    constructor(
        private usersService: UsersService,
        private userSettingsService: UserSettingsService,
        private messagesService: MessagesService,
        @InjectConnection() private connection: Connection,
        @InjectModel(Friend.name) private friendModel: Model<Friend>,
        @InjectModel(FriendRequest.name) private friendRequestModel: Model<FriendRequest>,
        @InjectModel(FriendFavorite.name) private friendFavoriteModel: Model<FriendFavorite>
    ) {
    }

    /**
     * Return
     * {
     *     friendList,
     *     requestReceivedList,
     *     requestSentList,
     *     favoriteFriendList,
     *     fullUidList
     * }
     * @param uid
     */
    async getFullFriendIds(uid: string): Promise<{
        friendList: Friend[],
        requestReceivedList: FriendRequest[],
        requestSentList: FriendRequest[],
        favoriteFriendList: FriendFavorite[],
        fullUidList: string[]
    }> {
        const friendList = await this.friendModel.find({left: uid}, {'_id': 0, '__v': 0}).exec();
        const requestReceivedList = await this.friendRequestModel.find({right: uid}, {'_id': 0, '__v': 0}).exec();
        const requestSentList = await this.friendRequestModel.find({left: uid}, {'_id': 0, '__v': 0}).exec();
        const favoriteFriendList = await this.friendFavoriteModel.find({left: uid}, {'_id': 0, '__v': 0}).exec();

        // Merge to one uid list;
        const fullUidList: string[] = [];
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

    // Get full friends: includes favorites, friends request also
    async getFullFriends(uid: string): Promise<FullFriendDto[]> {

        const {
            friendList,
            requestReceivedList,
            requestSentList,
            favoriteFriendList,
            fullUidList
        } = await this.getFullFriendIds(uid);

        const friendListRightSide = await this.friendModel.find({right: uid}, {'_id': 0, '__v': 0}).exec();

        const list: { [uid: string]: FullFriendDto } = {};
        const friendListDetail = await this.usersService.findAllInList(fullUidList);

        // Fill friend list
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

        // Get block list
        const blocks = await this.userSettingsService.findBlockers(uid);
        for (let i = 0; i < blocks.length; i++) {
            delete list[blocks[i].block_uid];
        }

        return Object.values(list);
    }

    // Get relationship
    // Return UserRelationshipDto
    async getRelationship(left: string, right: string): Promise<UserRelationshipDto | null> {
        if (left === right) return null;
        const user = await this.usersService.findUserByUid(right);
        if (user) {
            const leftFriendSide = await this.getFriend(left, right) !== null;
            const rightFriendSide = await this.getFriend(right, left) !== null;
            const isFullFriend = leftFriendSide && rightFriendSide;

            // If left tills friend with right, then requested is true. No need to request again in left side.
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
                is_request_friend: leftFriendSide || isRequestSent, // DEPRECATED, will be removed later
            };

        }
        return null;
    }

    // Get friend list
    async getFriends(left: string): Promise<Friend[] | null> {
        return await this.friendModel.find({left: left}, {'_id': 0, '__v': 0}).exec();
    }

    async getFriend(left: string, right: string): Promise<Friend | null> {
        if (left === right) return null;
        return await this.friendModel.findOne({left: left, right: right}, {'_id': 0, '__v': 0}).exec();
    }

    async newFriend(left: string, right: string): Promise<Friend | null> {
        if (left === right) return null;
        const friendModelLeftSide = new this.friendModel({left: left, right: right});
        const userLeftSide = await friendModelLeftSide.save();
        // Check right side
        const rightSide = await this.getFriend(right, left);
        if (!rightSide) {
            const friendModelRightSide = new this.friendModel({left: right, right: left});
            await friendModelRightSide.save();
        }
        if (userLeftSide) {
            return this.getFriend(left, right);
        }
        return null;
    }

    async deleteFriend(left: string, right: string): Promise<boolean> {
        if (left === right) return false;
        const res = await this.friendModel.deleteMany({left: left, right: right}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    async getRequestFriend(left: string, right: string): Promise<FriendRequest | null> {
        if (left === right) return null;
        return await this.friendRequestModel.findOne({left: left, right: right}, {'_id': 0, '__v': 0}).exec();
    }

    async newRequestFriend(left: string, right: string): Promise<FriendRequest | null> {
        if (left === right) return null;
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

    async deleteRequestFriend(left: string, right: string): Promise<boolean> {
        if (left === right) return false;
        const res = await this.friendRequestModel.deleteMany({left: left, right: right}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

    // Delete all guest user
    // - From friends collection
    // - From request friends collection
    // - From favorite friends collection
    async deleteAllGuestByUid(uid: string): Promise<void> {
        await this.friendModel.deleteMany({$or: [{left: uid}, {right: uid}]});
        await this.friendFavoriteModel.deleteMany({$or: [{left: uid}, {right: uid}]});
        await this.friendRequestModel.deleteMany({$or: [{left: uid}, {right: uid}]});
    }

    async getFavoriteFriend(left: string, right: string): Promise<FriendFavorite | null> {
        if (left === right) return null;
        return await this.friendFavoriteModel.findOne({left: left, right: right}, {'_id': 0, '__v': 0}).exec();
    }

    async newFavoriteFriend(left: string, right: string): Promise<FriendFavorite | null> {
        if (left === right) return null;
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

    async deleteFavoriteFriend(left: string, right: string): Promise<boolean> {
        if (left === right) return false;
        const res = await this.friendFavoriteModel.deleteMany({left: left, right: right}).exec();
        return (res && res.deletedCount ? res.deletedCount > 0 : false);
    }

}
