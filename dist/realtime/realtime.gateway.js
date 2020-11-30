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
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_auth_guard_1 = require("./socket-auth.guard");
const auth_service_1 = require("../auth/auth.service");
const realtime_service_1 = require("./realtime.service");
const users_service_1 = require("../users/users.service");
const notifications_service_1 = require("../notifications/notifications.service");
const histories_service_1 = require("../histories/histories.service");
const messages_service_1 = require("../messages/messages.service");
const friends_service_1 = require("../friends/friends.service");
const guest_service_1 = require("../guest/guest.service");
const user_settings_service_1 = require("../user-settings/user-settings.service");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    constructor(usersService, userSettingsService, authService, realtimeService, notificationsService, historiesService, messagesService, friendsService, guestService) {
        this.usersService = usersService;
        this.userSettingsService = userSettingsService;
        this.authService = authService;
        this.realtimeService = realtimeService;
        this.notificationsService = notificationsService;
        this.historiesService = historiesService;
        this.messagesService = messagesService;
        this.friendsService = friendsService;
        this.guestService = guestService;
        this.logger = new common_1.Logger(RealtimeGateway_1.name);
    }
    afterInit(server) {
        this.logger.log(`Init socket server ${server.path()}`);
    }
    async handleDisconnect(client) {
        this.logger.warn(`Disconnected [uid: ${client.conn.userId} - wsid: ${client.conn.id}]`);
        this.realtimeService.removeUser(client.conn.memoryId);
        const userId = client.conn.userId;
        const users = this.realtimeService.getUsers(userId);
        if (users.length == 0) {
            const aFriends = await this.friendsService.getFriends(userId);
            if (aFriends) {
                for (let i = 0; i < aFriends.length; i++) {
                    const friend = aFriends[i];
                    const friendInstances = this.realtimeService.getUsers(friend.right);
                    if (friendInstances.length > 0) {
                        for (let j = 0; j < friendInstances.length; j++) {
                            friendInstances[j].connection.emit(realtime_service_1.OFFLINE_EVENT, {
                                friend_id: userId
                            });
                        }
                    }
                }
            }
        }
        const socketId = client.conn.id;
        const host = this.realtimeService.getHost(userId, socketId);
        if (host) {
            const peer = this.realtimeService.getPeer(host.peerId);
            if (peer) {
                const users = this.realtimeService.getUsers(peer.userId);
                for (let i = 0; i < users.length; i++) {
                    users[i].connection.emit(realtime_service_1.SIGN_OUT_EVENT);
                }
                this.realtimeService.removePeer(peer.userId);
            }
            this.realtimeService.removeHost(host.userId);
        }
        const peer = this.realtimeService.getPeer(userId, socketId);
        if (peer) {
            const host = this.realtimeService.getHost(peer.hostId);
            if (host) {
                const users = this.realtimeService.getUsers(host.userId);
                for (let i = 0; i < users.length; i++) {
                    users[i].connection.emit(realtime_service_1.SIGN_OUT_EVENT);
                }
                this.realtimeService.removeHost(host.userId);
            }
            this.realtimeService.removePeer(peer.userId);
        }
    }
    async handleConnection(client, ...args) {
        const authorized = await socket_auth_guard_1.SocketAuthGuard.verifyToken(this.authService, this.realtimeService, client, client.handshake.headers.authorization);
        if (!authorized) {
            this.logger.error(`[${client.id}] Socket UnauthorizedException`);
            client.emit(realtime_service_1.UNAUTHORIZED_EVENT, 'Unauthorized');
            client.disconnect(true);
            return;
        }
        this.logger.log(`Connected [uid: ${client.conn.userId} - wsid: ${client.conn.id}]`);
        const aId = client.conn.userId;
        const { friendList, requestReceivedList, requestSentList, favoriteFriendList, fullUidList } = await this.friendsService.getFullFriendIds(aId);
        if (fullUidList.length > 0) {
            const onlines = [];
            for (let i = 0; i < fullUidList.length; i++) {
                const friendId = fullUidList[i];
                const friendInstances = this.realtimeService.getUsers(friendId);
                if (friendInstances.length > 0) {
                    onlines.push(friendId);
                    for (let j = 0; j < friendInstances.length; j++) {
                        friendInstances[j].connection.emit(realtime_service_1.ONLINE_EVENT, {
                            friend_id: aId
                        });
                    }
                }
            }
            if (onlines.length > 0) {
                client.emit(realtime_service_1.ONLINE_LIST_EVENT, {
                    friend_ids: onlines
                });
            }
        }
    }
    async onRequestCall(client, data) {
        var _a;
        const hostId = client.conn.userId;
        const peerId = data.peerId;
        const socketId = client.conn.id;
        this.logger.log(`onRequestCall: Host[${hostId}] -> Peer[${peerId}] Socket: ${socketId}`);
        const isGuestValid = await this.guestService.isGuestValid(hostId);
        if (isGuestValid == 2) {
            const log = 'onRequestCall: GUEST_CONNECTION_LIMIT';
            this.logger.error(log);
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, log);
            client.disconnect(true);
            return 0;
        }
        else {
            await this.historiesService.uniqueInsertHistory(hostId, peerId);
            if (isGuestValid == 1) {
                await this.guestService.increaseConnectionCount(hostId);
            }
        }
        const hostUser = this.realtimeService.storeHost(hostId, peerId, socketId);
        if (!hostUser) {
            const log = `onRequestCall: Host[${hostId}] already in call`;
            this.logger.log(log);
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, log);
            return 0;
        }
        const peerUser = this.realtimeService.storePeer(peerId, hostId, undefined);
        if (!peerUser) {
            const log = `onRequestCall: Peer[${peerId}] already in call`;
            this.logger.log(log);
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, log);
            return 0;
        }
        const peers = this.realtimeService.getUsers(peerId);
        if (peers.length > 0) {
            const host = await this.friendsService.getRelationship(peerId, hostId);
            if (host) {
                await this.notificationsService.pushNotificationToUid(notifications_service_1.NotificationType.NEW_OFFER, peerId, 'New calling', `${(_a = host.user.name) !== null && _a !== void 0 ? _a : 'Someone'} is calling you.`, {
                    uid: `${host.user.uid}`,
                    name: `${host.user.name}`,
                    avatar: `${host.user.avatar}`,
                });
            }
            for (let i = 0; i < peers.length; i++) {
                peers[i].connection.emit(realtime_service_1.REQUEST_CALL_EVENT, {
                    from_id: hostId,
                    user: host
                });
            }
        }
        else {
            this.logger.error('onRequestCall: Peer was not found');
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, 'onRequestCall: Peer was not found');
        }
        return 0;
    }
    async onDeclineCallEvent(client, data) {
        const peerId = client.conn.userId;
        const peerUser = this.realtimeService.getPeer(peerId);
        if (!peerUser) {
            this.logger.error('onDeclineCallEvent: Peer was not found');
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, 'onDeclineCallEvent: Peer was not found');
            return 0;
        }
        const hostId = peerUser.hostId;
        const hostUser = this.realtimeService.getHost(hostId);
        if (!hostUser) {
            this.logger.error('onDeclineCallEvent: Host was not found');
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, 'onDeclineCallEvent: Host was not found');
            return 0;
        }
        this.logger.log(`onDeclineCallEvent: Peer[${peerId}] -> Host[${hostId}]`);
        const hosts = this.realtimeService.getUsers(hostId);
        if (hosts.length > 0) {
            for (let i = 0; i < hosts.length; i++) {
                const host = hosts[i];
                if (host.socketId === hostUser.socketId) {
                    this.logger.log(`onDeclineCallEvent: Host[${hostId}] -> Peer[${peerId}] Socket: ${host.socketId}`);
                    host.connection.emit(realtime_service_1.DECLINE_CALL_EVENT, {
                        from_id: peerId
                    });
                    break;
                }
            }
        }
        else {
            this.logger.error('onDeclineCallEvent: Host was not found');
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, 'onDeclineCallEvent: Host was not found');
        }
        const peers = this.realtimeService.getUsers(peerId);
        if (peers.length > 0) {
            for (let i = 0; i < peers.length; i++) {
                const peer = peers[i];
                if (peer.socketId !== peerUser.socketId) {
                    peer.connection.emit(realtime_service_1.DECLINE_CALL_PEER_EVENT);
                }
            }
        }
        return 0;
    }
    async onCallAcceptedEvent(client) {
        const peerId = client.conn.userId;
        const socketId = client.conn.id;
        const peerUser = this.realtimeService.getPeer(peerId);
        if (!peerUser) {
            const log = 'onCallAcceptedEvent: Peer was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, log);
            return 0;
        }
        peerUser.socketId = socketId;
        this.realtimeService.updatePeer(peerUser);
        const hostId = peerUser.hostId;
        const hostUser = this.realtimeService.getHost(hostId);
        if (!hostUser) {
            const log = 'onCallAcceptedEvent: Host was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, log);
            return 0;
        }
        this.logger.log(`onCallAcceptedEvent: Peer[${peerId}] -> Host[${hostId}] Socket: ${socketId}`);
        const hosts = this.realtimeService.getUsers(hostId);
        if (hosts.length > 0) {
            for (let i = 0; i < hosts.length; i++) {
                const host = hosts[i];
                if (host.socketId === hostUser.socketId) {
                    host.connection.emit(realtime_service_1.CALL_ACCEPTED_EVENT, {
                        from_id: peerId
                    });
                    break;
                }
            }
        }
        else {
            this.logger.error('onCallAcceptedEvent: Host was not found');
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, 'onCallAcceptedEvent: Host was not found');
        }
        const peers = this.realtimeService.getUsers(peerId);
        if (peers.length > 0) {
            for (let i = 0; i < peers.length; i++) {
                const peer = peers[i];
                if (peer.socketId !== peerUser.socketId) {
                    peer.connection.emit(realtime_service_1.CALL_ACCEPTED_PEER_EVENT);
                }
            }
        }
        await this.historiesService.uniqueInsertHistory(peerId, hostId);
        return 0;
    }
    async onOfferEvent(client, data) {
        const hostId = client.conn.userId;
        const socketId = client.conn.id;
        const host = this.realtimeService.getHost(hostId);
        if (!host) {
            const log = 'onOfferEvent: Host was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, log);
            return 0;
        }
        const peerId = host.peerId;
        this.logger.log(`onOfferEvent: Host[${hostId}] -> Peer[${peerId}] Socket: ${socketId}`);
        const peerUser = this.realtimeService.getPeer(peerId);
        if (!peerUser) {
            const log = 'onOfferEvent: Peer was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, log);
            return 0;
        }
        const peers = this.realtimeService.getUsers(peerId);
        if (peers.length > 0) {
            for (let i = 0; i < peers.length; i++) {
                const peer = peers[i];
                if (peer.socketId === peerUser.socketId) {
                    peer.connection.emit(realtime_service_1.OFFER_EVENT, {
                        from_id: hostId,
                        data: data.description
                    });
                    break;
                }
            }
        }
        return 0;
    }
    async onAnswerEvent(client, data) {
        const peerId = client.conn.userId;
        const socketId = client.conn.id;
        const peerUser = this.realtimeService.getPeer(peerId);
        if (!peerUser) {
            const log = 'onAnswerEvent: Peer was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, log);
            return 0;
        }
        const hostId = peerUser.hostId;
        const hostUser = this.realtimeService.getHost(hostId);
        if (!hostUser) {
            const log = 'onAnswerEvent: Host was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, log);
            return 0;
        }
        this.logger.log(`onAnswerEvent: Peer[${peerId}] -> Host[${hostId}] Socket: ${socketId}`);
        const hosts = this.realtimeService.getUsers(hostId);
        if (hosts.length > 0) {
            for (let i = 0; i < hosts.length; i++) {
                const host = hosts[i];
                if (host.socketId === hostUser.socketId) {
                    host.connection.emit(realtime_service_1.ANSWER_EVENT, {
                        from_id: peerId,
                        data: data.description
                    });
                    break;
                }
            }
        }
        return 0;
    }
    async onIceCandidateEvent(client, data) {
        const userId = client.conn.userId;
        let clientUser = this.findClientUserByUserId(userId, 'onIceCandidateEvent');
        if (!clientUser) {
            const log = 'onIceCandidateEvent: Host && Peer was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, log);
            return 0;
        }
        this.logger.log(`onIceCandidateEvent: Client found ${JSON.stringify(clientUser)}`);
        const users = this.realtimeService.getUsers(clientUser.uid);
        if (users.length > 0) {
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                let socketId;
                const clientId = clientUser.uid;
                if (clientUser.isHost) {
                    const host = this.realtimeService.getHost(clientId);
                    if (host) {
                        this.logger.log(`onIceCandidateEvent: Host found Id:${host.userId} - host:${host.peerId} - sw:${host.socketId}`);
                        socketId = host.socketId;
                    }
                }
                else {
                    const peer = this.realtimeService.getPeer(clientId);
                    if (peer) {
                        this.logger.log(`onIceCandidateEvent: Peer found Id:${peer.userId} - host:${peer.hostId} - sw:${peer.socketId}`);
                        socketId = peer.socketId;
                    }
                }
                if (socketId && user.socketId === socketId) {
                    this.logger.log(`onIceCandidateEvent: User[${userId}] -> Client[${clientUser.uid}] Socket: ${socketId}`);
                    user.connection.emit(realtime_service_1.ICE_CANDIDATE_EVENT, {
                        from_id: userId,
                        data: data.candidate
                    });
                    break;
                }
            }
        }
        else {
            const log = 'onIceCandidateEvent: Peer was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, log);
        }
        return 0;
    }
    async onSignOutEvent(client, data) {
        const userId = client.conn.userId;
        const clientUser = this.findClientUserByUserId(userId, 'onSignOutEvent');
        if (!clientUser) {
            const log = 'onSignOutEvent: Host && Peer was not found';
            this.logger.error(log);
            return 0;
        }
        const clientId = clientUser.uid;
        const users = this.realtimeService.getUsers(clientUser.uid);
        if (users.length > 0) {
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                if (clientUser.isHost) {
                    const host = this.realtimeService.getHost(clientId);
                    if (host) {
                        const peer = this.realtimeService.getPeer(host.peerId);
                        const socketId = host.socketId;
                        if (peer && peer.socketId) {
                            if (user.socketId === socketId) {
                                this.logger.log(`onSignOutEvent: Peer[${userId}] -> Host[${clientUser.uid}] Socket: ${socketId}`);
                                user.connection.emit(realtime_service_1.SIGN_OUT_EVENT);
                                break;
                            }
                        }
                        else {
                            this.logger.log(`onSignOutEvent: Peer[${userId}] -> Host[${clientUser.uid}] [not established]`);
                            user.connection.emit(realtime_service_1.SIGN_OUT_EVENT);
                        }
                    }
                }
                else {
                    const peer = this.realtimeService.getPeer(clientId);
                    if (peer) {
                        const socketId = peer.socketId;
                        if (socketId) {
                            if (user.socketId === socketId) {
                                this.logger.log(`onSignOutEvent: Host[${userId}] -> Peer[${clientUser.uid}] Socket: ${socketId}`);
                                user.connection.emit(realtime_service_1.SIGN_OUT_EVENT);
                                break;
                            }
                        }
                        else {
                            this.logger.log(`onSignOutEvent: Host[${userId}] -> Peer[${clientUser.uid}] [not established]`);
                            user.connection.emit(realtime_service_1.SIGN_OUT_EVENT);
                        }
                    }
                }
            }
            if (clientUser.isHost) {
                this.realtimeService.removePeer(userId);
                this.realtimeService.removeHost(clientId);
            }
            else {
                this.realtimeService.removeHost(userId);
                this.realtimeService.removePeer(clientId);
            }
        }
        else {
            const log = 'onSignOutEvent: Peer was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, realtime_service_1.CALL_ERROR_EVENT, log);
        }
        return 0;
    }
    async onMessageTypingEvent(client, data) {
        const hostId = client.conn.userId;
        if (!data || !(data.peerId) || !(data.deviceId) || !(data.body)) {
            return 0;
        }
        const peerId = data.peerId;
        this.logger.log(`onMessageTypingEvent: Host[${hostId}] -> Peer[${peerId}]`);
        const host = await this.usersService.findUserByUid(hostId);
        if (host) {
            const peers = this.realtimeService.getUsers(peerId);
            if (peers.length > 0) {
                for (let i = 0; i < peers.length; i++) {
                    peers[i].connection.emit(realtime_service_1.MESSAGE_TYPING_EVENT, {
                        from_id: hostId,
                        user: host,
                        data: data.body
                    });
                }
            }
            else {
                this.logger.error('onMessageTypingEvent: Peer was not found');
            }
        }
        else {
            this.logger.error('onMessageTypingEvent: Host was not found');
        }
        return 0;
    }
    async onMessageEvent(client, data) {
        var _a;
        const hostId = client.conn.userId;
        const peerId = data.peerId;
        const isBlocked = await this.userSettingsService.findBlocker(peerId, hostId);
        if (isBlocked) {
            const log = (`onMessageEvent: Host[${hostId}] -> Peer[${peerId}] => Host was blocked by Peer`);
            this.logger.log(log);
            this.sendSocketEvent(client, realtime_service_1.BLOCKED_EVENT, {
                host_id: hostId,
                peer_id: peerId,
                data: log
            });
            return 0;
        }
        this.logger.log(`onMessageEvent: Host[${hostId}] -> Peer[${peerId}]`);
        if (!data || !(data.peerId) || !(data.deviceId) || !(data.body)) {
            const log = `onMessageEvent: Data error [${JSON.stringify(data)}]`;
            this.logger.log(log);
            this.sendSocketEvent(client, realtime_service_1.MESSAGE_ERROR_EVENT, log);
            return 0;
        }
        try {
            const body = JSON.parse(data.body);
            if (body.type !== "text" && body.type !== "file" && body.type !== "image") {
                throw new SyntaxError("Invalid body type");
            }
            if (!body.value) {
                throw new SyntaxError("Invalid body value");
            }
            if ((body.type === "file" || body.type === "image") && !body.value['original']) {
                throw new SyntaxError("Invalid body file/image value");
            }
            if (body.type === "image" && (!body.value['preview'] || !body.value['size'])) {
                throw new SyntaxError("Invalid body image value");
            }
        }
        catch (e) {
            const log = `onMessageEvent: ${e.message} [${data}]`;
            this.logger.log(log);
            this.sendSocketEvent(client, realtime_service_1.MESSAGE_ERROR_EVENT, log);
            return 0;
        }
        const abMessageDto = {
            left: hostId,
            right: peerId,
            device_id: data.deviceId,
            body: data.body,
            received: false,
            read: false,
            created_at: Date.now(),
            updated_at: Date.now()
        };
        const messages = await this.messagesService.createMessage(hostId, abMessageDto);
        if (messages == null) {
            return 0;
        }
        const senderMsg = messages[0];
        const cloneMsg = messages[1];
        const host = await this.usersService.findUserByUid(hostId);
        if (host) {
            const bundle = {
                uid: `${host.uid}`,
                name: `${host.name}`,
                avatar: `${host.avatar}`,
            };
            await this.notificationsService.pushNotificationToUid(notifications_service_1.NotificationType.NEW_MESSAGE, peerId, 'New message', `${(_a = host.name) !== null && _a !== void 0 ? _a : 'Someone'} sent you a message.`, bundle);
            const peers = this.realtimeService.getUsers(peerId);
            if (peers.length > 0) {
                for (let i = 0; i < peers.length; i++) {
                    peers[i].connection.emit(realtime_service_1.MESSAGE_EVENT, {
                        from_id: hostId,
                        user: host,
                        data: cloneMsg
                    });
                }
            }
            else {
                const log = 'onMessageEvent: Peer was not found';
                this.logger.error(log);
                this.sendSocketEvent(client, realtime_service_1.MESSAGE_ERROR_EVENT, log);
            }
        }
        else {
            const log = 'onMessageEvent: Host was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, realtime_service_1.MESSAGE_ERROR_EVENT, log);
        }
        if (senderMsg) {
            return senderMsg._id.toString();
        }
        return 0;
    }
    findClientUserByUserId(userId, tag = 'findClientIdByUserId') {
        const hostUser = this.realtimeService.getHost(userId);
        const peerUser = this.realtimeService.getPeer(userId);
        let clientId;
        if (hostUser) {
            clientId = hostUser.peerId;
            this.logger.log(`${tag}: Host[${userId}] -> Peer[${clientId}]`);
            return { isHost: false, uid: clientId };
        }
        else if (peerUser) {
            clientId = peerUser.hostId;
            this.logger.log(`${tag}: Peer[${userId}] -> Host[${clientId}]`);
            return { isHost: true, uid: clientId };
        }
        return null;
    }
    sendSocketEvent(conn, event, data = {}) {
        if (conn) {
            conn.emit(event, data);
        }
    }
};
__decorate([
    websockets_1.WebSocketServer(),
    __metadata("design:type", Object)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    websockets_1.SubscribeMessage(realtime_service_1.REQUEST_CALL_EVENT),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "onRequestCall", null);
__decorate([
    websockets_1.SubscribeMessage(realtime_service_1.DECLINE_CALL_EVENT),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "onDeclineCallEvent", null);
__decorate([
    websockets_1.SubscribeMessage(realtime_service_1.CALL_ACCEPTED_EVENT),
    __param(0, websockets_1.ConnectedSocket()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "onCallAcceptedEvent", null);
__decorate([
    websockets_1.SubscribeMessage(realtime_service_1.OFFER_EVENT),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "onOfferEvent", null);
__decorate([
    websockets_1.SubscribeMessage(realtime_service_1.ANSWER_EVENT),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "onAnswerEvent", null);
__decorate([
    websockets_1.SubscribeMessage(realtime_service_1.ICE_CANDIDATE_EVENT),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "onIceCandidateEvent", null);
__decorate([
    websockets_1.SubscribeMessage(realtime_service_1.SIGN_OUT_EVENT),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "onSignOutEvent", null);
__decorate([
    websockets_1.SubscribeMessage(realtime_service_1.MESSAGE_TYPING_EVENT),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "onMessageTypingEvent", null);
__decorate([
    websockets_1.SubscribeMessage(realtime_service_1.MESSAGE_EVENT),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "onMessageEvent", null);
RealtimeGateway = RealtimeGateway_1 = __decorate([
    common_1.UsePipes(new common_1.ValidationPipe()),
    common_1.UseInterceptors(common_1.ClassSerializerInterceptor),
    common_1.UseGuards(socket_auth_guard_1.SocketAuthGuard),
    websockets_1.WebSocketGateway({
        transports: ['polling', 'websocket'],
        handlePreflightRequest: (req, res) => {
            const headers = {
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Origin': req.headers.origin,
                'Access-Control-Allow-Credentials': true
            };
            res.writeHead(200, headers);
            res.end();
        }
    }),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        user_settings_service_1.UserSettingsService,
        auth_service_1.AuthService,
        realtime_service_1.RealtimeService,
        notifications_service_1.NotificationsService,
        histories_service_1.HistoriesService,
        messages_service_1.MessagesService,
        friends_service_1.FriendsService,
        guest_service_1.GuestService])
], RealtimeGateway);
exports.RealtimeGateway = RealtimeGateway;
//# sourceMappingURL=realtime.gateway.js.map