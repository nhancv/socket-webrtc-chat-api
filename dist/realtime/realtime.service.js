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
var RealtimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeService = exports.BLOCKED_EVENT = exports.UNAUTHORIZED_EVENT = exports.OFFLINE_EVENT = exports.ONLINE_EVENT = exports.ONLINE_LIST_EVENT = exports.MESSAGE_TYPING_EVENT = exports.MESSAGE_RECEIVED_EVENT = exports.MESSAGE_READ_EVENT = exports.MESSAGE_EVENT = exports.MESSAGE_ERROR_EVENT = exports.CALL_ERROR_EVENT = exports.SIGN_OUT_EVENT = exports.ICE_CANDIDATE_EVENT = exports.ANSWER_EVENT = exports.OFFER_ERROR_EVENT = exports.OFFER_EVENT = exports.CALL_ACCEPTED_PEER_EVENT = exports.CALL_ACCEPTED_EVENT = exports.DECLINE_CALL_PEER_EVENT = exports.DECLINE_CALL_EVENT = exports.REQUEST_CALL_EVENT = void 0;
const common_1 = require("@nestjs/common");
const in_memory_db_1 = require("@nestjs-addons/in-memory-db");
const app_exception_1 = require("../utils/app-exception");
const histories_service_1 = require("../histories/histories.service");
const user_settings_service_1 = require("../user-settings/user-settings.service");
const friends_service_1 = require("../friends/friends.service");
exports.REQUEST_CALL_EVENT = 'request-call-event';
exports.DECLINE_CALL_EVENT = 'decline-call-event';
exports.DECLINE_CALL_PEER_EVENT = 'decline-call-peer-event';
exports.CALL_ACCEPTED_EVENT = 'call-accepted-event';
exports.CALL_ACCEPTED_PEER_EVENT = 'call-accepted-peer-event';
exports.OFFER_EVENT = 'offer-event';
exports.OFFER_ERROR_EVENT = 'offer-error-event';
exports.ANSWER_EVENT = 'answer-event';
exports.ICE_CANDIDATE_EVENT = 'ice-candidate-event';
exports.SIGN_OUT_EVENT = 'sign-out-event';
exports.CALL_ERROR_EVENT = 'call-error-event';
exports.MESSAGE_ERROR_EVENT = 'message-error-event';
exports.MESSAGE_EVENT = 'message-event';
exports.MESSAGE_READ_EVENT = 'message-read-event';
exports.MESSAGE_RECEIVED_EVENT = 'message-received-event';
exports.MESSAGE_TYPING_EVENT = 'message-typing-event';
exports.ONLINE_LIST_EVENT = 'online-list-event';
exports.ONLINE_EVENT = 'online-event';
exports.OFFLINE_EVENT = 'offline-event';
exports.UNAUTHORIZED_EVENT = 'unauthorized-event';
exports.BLOCKED_EVENT = 'blocked-event';
let RealtimeService = RealtimeService_1 = class RealtimeService {
    constructor(historiesService, friendsService, userSettingsService, wsUserService, wsHostService, wsPeerService) {
        this.historiesService = historiesService;
        this.friendsService = friendsService;
        this.userSettingsService = userSettingsService;
        this.wsUserService = wsUserService;
        this.wsHostService = wsHostService;
        this.wsPeerService = wsPeerService;
        this.logger = new common_1.Logger(RealtimeService_1.name);
    }
    storeUser(connection) {
        const newUser = {
            connection: connection,
            userId: connection.conn.userId,
            socketId: connection.conn.id,
            timestamp: Date.now()
        };
        return this.wsUserService.create(newUser);
    }
    storeHost(hostId, peerId, socketId) {
        const host = this.getHost(hostId);
        if (host != null) {
            if (host.peerId !== peerId) {
                const peer = this.getPeer(host.peerId);
                if (peer && peer.socketId) {
                    return null;
                }
            }
            if (host.socketId != socketId) {
                host.socketId = socketId;
                this.wsHostService.update(host);
            }
            return host;
        }
        const newHost = {
            userId: hostId,
            peerId: peerId,
            socketId: socketId,
        };
        return this.wsHostService.create(newHost);
    }
    storePeer(peerId, hostId, socketId) {
        const peer = this.getPeer(peerId);
        if (peer != null) {
            if (peer.socketId && peer.hostId !== hostId) {
                return null;
            }
            if (socketId && peer.socketId != socketId) {
                peer.socketId = socketId;
                this.wsPeerService.update(peer);
            }
            return peer;
        }
        const newPeer = {
            userId: peerId,
            hostId: hostId,
            socketId: socketId,
        };
        return this.wsPeerService.create(newPeer);
    }
    updatePeer(peer) {
        this.wsPeerService.update(peer);
    }
    async randomUser(currentUserId) {
        const histories = await this.historiesService.getHistories(currentUserId);
        const wsUsersAll = this.wsUserService.getAll();
        const blocks = await this.userSettingsService.findBlockers(currentUserId);
        const blockMap = {};
        for (let i = 0; i < blocks.length; i++) {
            blockMap[blocks[i].block_uid] = true;
        }
        let wsUsers = wsUsersAll.filter(function (item, index, self) {
            return ((currentUserId !== item.userId) &&
                (self.findIndex((value => value.userId === item.userId)) === index) &&
                !blockMap.hasOwnProperty(item.userId));
        });
        let wsUsersWithoutHistory = wsUsers.filter(function (item, index, self) {
            return (histories.findIndex((history => history.friend_id === item.userId)) === -1);
        });
        if (wsUsersWithoutHistory.length > 0) {
            wsUsers = wsUsersWithoutHistory;
        }
        let count = 0;
        while (wsUsers.length > 0) {
            const randomIndex = Math.floor(Math.random() * wsUsers.length);
            const wsUser = wsUsers[randomIndex];
            const userId = wsUser.userId;
            let host = this.getHost(userId);
            if (host) {
                const peer = this.getPeer(host.peerId);
                if (!peer || !peer.socketId) {
                    host = null;
                }
            }
            let peer = this.getPeer(userId);
            if (!peer || !peer.socketId) {
                peer = null;
            }
            if (currentUserId !== userId &&
                !host && !peer) {
                return wsUser;
            }
            if (count > 100) {
                return null;
            }
            count++;
        }
        return null;
    }
    removeUser(memoryId) {
        this.wsUserService.delete(memoryId);
    }
    removeHost(userId) {
        const host = this.getHost(userId);
        if (host) {
            this.wsHostService.delete(host.id);
            return true;
        }
        return false;
    }
    removePeer(userId) {
        const host = this.getPeer(userId);
        if (host) {
            this.wsPeerService.delete(host.id);
            return true;
        }
        return false;
    }
    getUsers(userId) {
        const wsUsers = this.wsUserService.getAll();
        const res = [];
        for (let i = 0; i < wsUsers.length; i++) {
            if (wsUsers[i].userId === userId) {
                res.push(wsUsers[i]);
            }
        }
        return res;
    }
    isOnline(userId) {
        const wsUsers = this.wsUserService.getAll();
        for (let i = 0; i < wsUsers.length; i++) {
            if (wsUsers[i].userId === userId) {
                return true;
            }
        }
        return false;
    }
    filterOnlineInList(userIds) {
        const onlineList = {};
        const wsUsers = this.wsUserService.getAll();
        for (let i = 0; i < wsUsers.length; i++) {
            const onlineUid = wsUsers[i].userId;
            if (userIds.indexOf(onlineUid) > -1) {
                onlineList[onlineUid] = true;
            }
        }
        return Object.keys(onlineList);
    }
    getHost(userId, socketId) {
        const wsUsers = this.wsHostService.getAll();
        for (let i = 0; i < wsUsers.length; i++) {
            const host = wsUsers[i];
            if (host.userId === userId && (!socketId || host.socketId === socketId)) {
                return host;
            }
        }
        return null;
    }
    getPeer(userId, socketId) {
        const wsUsers = this.wsPeerService.getAll();
        for (let i = 0; i < wsUsers.length; i++) {
            const peer = wsUsers[i];
            if (peer.userId === userId && (!socketId || peer.socketId === socketId)) {
                return peer;
            }
        }
        return null;
    }
    sendReadMessageEventToSender(senderId, receiverId, isReceived) {
        try {
            const senderUsers = this.getUsers(senderId);
            for (let i = 0; i < senderUsers.length; i++) {
                const senderUser = senderUsers[i];
                if (senderUser &&
                    senderUser.connection &&
                    senderUser.connection.connected) {
                    senderUser.connection.emit(isReceived ? exports.MESSAGE_RECEIVED_EVENT : exports.MESSAGE_READ_EVENT, {
                        sender_id: senderId,
                        receiver_id: receiverId,
                        updated_at: Date.now()
                    });
                }
            }
        }
        catch (e) {
            this.logger.error(new app_exception_1.AppException('sendReadMessageEventToSender', e));
        }
    }
    async sendReadMessageEventToFriends(receiverId, isReceived) {
        try {
            const friendList = await this.friendsService.getFriends(receiverId);
            if (friendList) {
                for (let f = 0; f < friendList.length; f++) {
                    const friend = friendList[f];
                    const senderId = friend.right;
                    this.sendReadMessageEventToSender(senderId, receiverId, isReceived);
                }
            }
        }
        catch (e) {
            this.logger.error(new app_exception_1.AppException('sendReadMessageEventToFriends', e));
        }
    }
    emitEventToSenderUsers(senderId, receiverId, event) {
        const senderUsers = this.getUsers(senderId);
        for (let i = 0; i < senderUsers.length; i++) {
            const senderUser = senderUsers[i];
            if (senderUser &&
                senderUser.connection &&
                senderUser.connection.connected) {
                senderUser.connection.emit(event, {
                    sender_id: senderId,
                    receiver_id: receiverId,
                    updated_at: Date.now()
                });
            }
        }
    }
    sendSocketMessageWithUid(uid, event, data) {
        try {
            const realtimeUsers = this.getUsers(uid);
            for (let i = 0; i < realtimeUsers.length; i++) {
                const realtimeUser = realtimeUsers[i];
                if (realtimeUser &&
                    realtimeUser.connection &&
                    realtimeUser.connection.connected) {
                    realtimeUser.connection.emit(event, data);
                }
            }
        }
        catch (e) {
            this.logger.error(new app_exception_1.AppException('sendSocketMessageWithUid', e));
        }
    }
    disconnectSocketWithUid(uid) {
        try {
            const realtimeUsers = this.getUsers(uid);
            for (let i = 0; i < realtimeUsers.length; i++) {
                const realtimeUser = realtimeUsers[i];
                if (realtimeUser &&
                    realtimeUser.connection &&
                    realtimeUser.connection.connected) {
                    realtimeUser.connection.disconnect(true);
                }
            }
        }
        catch (e) {
            this.logger.error(new app_exception_1.AppException('disconnectSocketWithUid:173', e));
        }
    }
};
RealtimeService = RealtimeService_1 = __decorate([
    common_1.Injectable(),
    __param(3, in_memory_db_1.InjectInMemoryDBService('user')),
    __param(4, in_memory_db_1.InjectInMemoryDBService('host')),
    __param(5, in_memory_db_1.InjectInMemoryDBService('peer')),
    __metadata("design:paramtypes", [histories_service_1.HistoriesService,
        friends_service_1.FriendsService,
        user_settings_service_1.UserSettingsService,
        in_memory_db_1.InMemoryDBService,
        in_memory_db_1.InMemoryDBService,
        in_memory_db_1.InMemoryDBService])
], RealtimeService);
exports.RealtimeService = RealtimeService;
//# sourceMappingURL=realtime.service.js.map