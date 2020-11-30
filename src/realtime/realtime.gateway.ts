import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import {ClassSerializerInterceptor, Logger, UseGuards, UseInterceptors, UsePipes, ValidationPipe} from '@nestjs/common';
import {Server} from 'socket.io';
import {SocketAuthGuard} from "./socket-auth.guard";
import {SocketConn} from "./socket.connection";
import {AuthService} from "../auth/auth.service";
import {
    ANSWER_EVENT,
    BLOCKED_EVENT,
    CALL_ACCEPTED_EVENT,
    CALL_ACCEPTED_PEER_EVENT,
    CALL_ERROR_EVENT,
    DECLINE_CALL_EVENT,
    DECLINE_CALL_PEER_EVENT,
    ICE_CANDIDATE_EVENT,
    MESSAGE_ERROR_EVENT,
    MESSAGE_EVENT,
    MESSAGE_TYPING_EVENT,
    OFFER_EVENT,
    OFFLINE_EVENT,
    ONLINE_EVENT,
    ONLINE_LIST_EVENT,
    RealtimeService,
    REQUEST_CALL_EVENT,
    SIGN_OUT_EVENT,
    UNAUTHORIZED_EVENT,
} from "./realtime.service";
import {UsersService} from "../users/users.service";
import {NotificationsService, NotificationType} from "../notifications/notifications.service";
import {HistoriesService} from "../histories/histories.service";
import {MessagesService} from "../messages/messages.service";
import {FullMessageDto} from "../messages/dto/full-message.dto";
import {FriendsService} from "../friends/friends.service";
import {BundleNotificationDto} from "../notifications/dto/bundle-notification.dto";
import {GuestService} from "../guest/guest.service";
import {UserSettingsService} from "../user-settings/user-settings.service";
import {Message} from "../messages/schemas/message.schema";

@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(SocketAuthGuard)
@WebSocketGateway({
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
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private usersService: UsersService,
        private userSettingsService: UserSettingsService,
        private authService: AuthService,
        private realtimeService: RealtimeService,
        private notificationsService: NotificationsService,
        private historiesService: HistoriesService,
        private messagesService: MessagesService,
        private friendsService: FriendsService,
        private guestService: GuestService
    ) {
    }

    @WebSocketServer()
    server: Server | undefined;

    private logger: Logger = new Logger(RealtimeGateway.name);

    afterInit(server: Server) {
        this.logger.log(`Init socket server ${server.path()}`);
    }

    async handleDisconnect(client: SocketConn) {
        this.logger.warn(`Disconnected [uid: ${client.conn.userId} - wsid: ${client.conn.id}]`);

        // Remove user
        this.realtimeService.removeUser(client.conn.memoryId);

        // One user can has multi connection
        const userId = client.conn.userId;
        const users = this.realtimeService.getUsers(userId);
        if (users.length == 0) {
            // Disconnect totally
            // When A offline, send to friend of A
            const aFriends = await this.friendsService.getFriends(userId);
            if (aFriends) {
                for (let i = 0; i < aFriends.length; i++) {
                    const friend = aFriends[i];
                    const friendInstances = this.realtimeService.getUsers(friend.right);
                    if (friendInstances.length > 0) {
                        // Send to friend of A
                        for (let j = 0; j < friendInstances.length; j++) {
                            friendInstances[j].connection.emit(OFFLINE_EVENT, {
                                friend_id: userId
                            });
                        }
                    }
                }
            }
        }

        const socketId = client.conn.id;

        // If disconnected user is host
        const host = this.realtimeService.getHost(userId, socketId);
        if (host) {
            const peer = this.realtimeService.getPeer(host.peerId);
            if (peer) {
                const users = this.realtimeService.getUsers(peer.userId);
                for (let i = 0; i < users.length; i++) {
                    users[i].connection.emit(SIGN_OUT_EVENT);
                }

                this.realtimeService.removePeer(peer.userId);
            }
            this.realtimeService.removeHost(host.userId);
        }

        // If disconnected user is peer
        const peer = this.realtimeService.getPeer(userId, socketId);
        if (peer) {
            const host = this.realtimeService.getHost(peer.hostId);
            if (host) {
                const users = this.realtimeService.getUsers(host.userId);
                for (let i = 0; i < users.length; i++) {
                    users[i].connection.emit(SIGN_OUT_EVENT);
                }

                this.realtimeService.removeHost(host.userId);
            }

            this.realtimeService.removePeer(peer.userId);
        }
    }

    async handleConnection(client: SocketConn, ...args: any[]) {
        const authorized = await SocketAuthGuard.verifyToken(
            this.authService,
            this.realtimeService,
            client,
            client.handshake.headers.authorization,
        );

        if (!authorized) {
            this.logger.error(`[${client.id}] Socket UnauthorizedException`);
            client.emit(UNAUTHORIZED_EVENT, 'Unauthorized');
            client.disconnect(true);
            return;
        }

        this.logger.log(`Connected [uid: ${client.conn.userId} - wsid: ${client.conn.id}]`);
        const aId = client.conn.userId;
        const {
            friendList,
            requestReceivedList,
            requestSentList,
            favoriteFriendList,
            fullUidList
        } = await this.friendsService.getFullFriendIds(aId);
        if (fullUidList.length > 0) {
            const onlines: string[] = [];
            for (let i = 0; i < fullUidList.length; i++) {
                const friendId = fullUidList[i];
                const friendInstances = this.realtimeService.getUsers(friendId);
                if (friendInstances.length > 0) {
                    onlines.push(friendId);
                    // Send to friend of A
                    for (let j = 0; j < friendInstances.length; j++) {
                        friendInstances[j].connection.emit(ONLINE_EVENT, {
                            friend_id: aId
                        });
                    }
                }
            }
            // Send all A's friend to A
            if (onlines.length > 0) {
                client.emit(ONLINE_LIST_EVENT, {
                    friend_ids: onlines
                });
            }
        }
    }

    // Create new call request
    @SubscribeMessage(REQUEST_CALL_EVENT)
    async onRequestCall(@ConnectedSocket() client: SocketConn, @MessageBody() data: { peerId: string }): Promise<number> {
        const hostId = client.conn.userId;
        const peerId = data.peerId;
        const socketId = client.conn.id;
        this.logger.log(`onRequestCall: Host[${hostId}] -> Peer[${peerId}] Socket: ${socketId}`);

        // Check guest valid
        const isGuestValid = await this.guestService.isGuestValid(hostId);
        if (isGuestValid == 2) {
            const log = 'onRequestCall: GUEST_CONNECTION_LIMIT';
            this.logger.error(log);
            this.sendSocketEvent(client, CALL_ERROR_EVENT, log);
            client.disconnect(true);
            return 0;
        } else {
            // Save history
            await this.historiesService.uniqueInsertHistory(hostId, peerId);
            // Increase connection count for guest
            if (isGuestValid == 1) {
                await this.guestService.increaseConnectionCount(hostId);
            }
        }

        // Save pair
        const hostUser = this.realtimeService.storeHost(hostId, peerId, socketId);
        if (!hostUser) {
            const log = `onRequestCall: Host[${hostId}] already in call`;
            this.logger.log(log);
            this.sendSocketEvent(client, CALL_ERROR_EVENT, log);
            return 0;
        }
        // At default, peer save with undefined socket id
        const peerUser = this.realtimeService.storePeer(peerId, hostId, undefined);
        if (!peerUser) {
            const log = `onRequestCall: Peer[${peerId}] already in call`;
            this.logger.log(log);
            this.sendSocketEvent(client, CALL_ERROR_EVENT, log);
            return 0;
        }
        // Get user
        const peers = this.realtimeService.getUsers(peerId);
        if (peers.length > 0) {
            const host = await this.friendsService.getRelationship(peerId, hostId);
            if (host) {
                // Push notification
                await this.notificationsService.pushNotificationToUid(NotificationType.NEW_OFFER,
                    peerId,
                    'New calling',
                    `${host.user.name ?? 'Someone'} is calling you.`,
                    {
                        uid: `${host.user.uid}`,
                        name: `${host.user.name}`,
                        avatar: `${host.user.avatar}`,
                    },
                );
            }

            // Forward offer to all peers
            for (let i = 0; i < peers.length; i++) {
                peers[i].connection.emit(REQUEST_CALL_EVENT, {
                    from_id: hostId,
                    user: host
                });
            }

        } else {
            this.logger.error('onRequestCall: Peer was not found');
            this.sendSocketEvent(client, CALL_ERROR_EVENT, 'onRequestCall: Peer was not found');
        }
        return 0;
    }

    // Host send offer to peer
    // If peer decline that offer, peer send this event
    // Server forward this event to host
    // Server forward this event to other peers
    @SubscribeMessage(DECLINE_CALL_EVENT)
    async onDeclineCallEvent(@ConnectedSocket() client: SocketConn, @MessageBody() data: any): Promise<number> {
        const peerId = client.conn.userId;
        const peerUser = this.realtimeService.getPeer(peerId);
        if (!peerUser) {
            this.logger.error('onDeclineCallEvent: Peer was not found');
            this.sendSocketEvent(client, CALL_ERROR_EVENT, 'onDeclineCallEvent: Peer was not found');
            return 0;
        }

        const hostId = peerUser.hostId;
        const hostUser = this.realtimeService.getHost(hostId);
        if (!hostUser) {
            this.logger.error('onDeclineCallEvent: Host was not found');
            this.sendSocketEvent(client, CALL_ERROR_EVENT, 'onDeclineCallEvent: Host was not found');
            return 0;
        }

        this.logger.log(`onDeclineCallEvent: Peer[${peerId}] -> Host[${hostId}]`);

        // Forward answer to host
        const hosts = this.realtimeService.getUsers(hostId);
        if (hosts.length > 0) {
            for (let i = 0; i < hosts.length; i++) {
                const host = hosts[i];
                if (host.socketId === hostUser.socketId) {
                    this.logger.log(`onDeclineCallEvent: Host[${hostId}] -> Peer[${peerId}] Socket: ${host.socketId}`);
                    host.connection.emit(DECLINE_CALL_EVENT, {
                        from_id: peerId
                    });
                    break;
                }
            }
        } else {
            this.logger.error('onDeclineCallEvent: Host was not found');
            this.sendSocketEvent(client, CALL_ERROR_EVENT, 'onDeclineCallEvent: Host was not found');
        }

        // Due to one user can have multi socket instance
        // When any instance decline call,
        // server send broadcast to the other peers to close calling dialog
        const peers = this.realtimeService.getUsers(peerId);
        if (peers.length > 0) {
            for (let i = 0; i < peers.length; i++) {
                const peer = peers[i];
                if (peer.socketId !== peerUser.socketId) {
                    peer.connection.emit(DECLINE_CALL_PEER_EVENT);
                }
            }
        }

        return 0;
    }

    // Call accepted peer event
    @SubscribeMessage(CALL_ACCEPTED_EVENT)
    async onCallAcceptedEvent(@ConnectedSocket() client: SocketConn): Promise<number> {
        const peerId = client.conn.userId;
        const socketId = client.conn.id;
        const peerUser = this.realtimeService.getPeer(peerId);
        if (!peerUser) {
            const log = 'onCallAcceptedEvent: Peer was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, CALL_ERROR_EVENT, log);
            return 0;
        }
        // Update new socket instance of peer
        peerUser.socketId = socketId;
        this.realtimeService.updatePeer(peerUser);
        const hostId = peerUser.hostId;
        const hostUser = this.realtimeService.getHost(hostId);
        if (!hostUser) {
            const log = 'onCallAcceptedEvent: Host was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, CALL_ERROR_EVENT, log);
            return 0;
        }
        this.logger.log(`onCallAcceptedEvent: Peer[${peerId}] -> Host[${hostId}] Socket: ${socketId}`);

        // Forward answer to host
        const hosts = this.realtimeService.getUsers(hostId);
        if (hosts.length > 0) {
            for (let i = 0; i < hosts.length; i++) {
                const host = hosts[i];
                if (host.socketId === hostUser.socketId) {
                    host.connection.emit(CALL_ACCEPTED_EVENT, {
                        from_id: peerId
                    });
                    break;
                }
            }
        } else {
            this.logger.error('onCallAcceptedEvent: Host was not found');
            this.sendSocketEvent(client, CALL_ERROR_EVENT, 'onCallAcceptedEvent: Host was not found');
        }
        // Due to one user can have multi socket instance
        // When any instance accept call,
        // server send broadcast to the other peers to close calling dialog
        const peers = this.realtimeService.getUsers(peerId);
        if (peers.length > 0) {
            for (let i = 0; i < peers.length; i++) {
                const peer = peers[i];
                if (peer.socketId !== peerUser.socketId) {
                    peer.connection.emit(CALL_ACCEPTED_PEER_EVENT);
                }
            }
        }
        // Save history
        await this.historiesService.uniqueInsertHistory(peerId, hostId);

        return 0;
    }

    // Host create a call by sending an offer to server
    // Server will forward that offer to all peer socket instances
    @SubscribeMessage(OFFER_EVENT)
    async onOfferEvent(@ConnectedSocket() client: SocketConn, @MessageBody() data: { description: any }): Promise<number> {
        const hostId = client.conn.userId;
        const socketId = client.conn.id;
        const host = this.realtimeService.getHost(hostId);
        if (!host) {
            const log = 'onOfferEvent: Host was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, CALL_ERROR_EVENT, log);
            return 0;
        }

        const peerId = host.peerId;
        this.logger.log(`onOfferEvent: Host[${hostId}] -> Peer[${peerId}] Socket: ${socketId}`);

        const peerUser = this.realtimeService.getPeer(peerId);
        if (!peerUser) {
            const log = 'onOfferEvent: Peer was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, CALL_ERROR_EVENT, log);
            return 0;
        }

        // Get user
        const peers = this.realtimeService.getUsers(peerId);
        if (peers.length > 0) {
            // Forward offer to all peers
            for (let i = 0; i < peers.length; i++) {
                const peer = peers[i];
                if (peer.socketId === peerUser.socketId) {
                    peer.connection.emit(OFFER_EVENT, {
                        from_id: hostId,
                        data: data.description
                    });
                    break;
                }
            }
        }

        return 0;
    }

    // After peer received offer sent by host
    // Peer sent an answer to server
    // Server will forward that answer to host who create offer
    // Server will send offer picked event to other peers
    @SubscribeMessage(ANSWER_EVENT)
    async onAnswerEvent(@ConnectedSocket() client: SocketConn, @MessageBody() data: { description: any }): Promise<number> {
        const peerId = client.conn.userId;
        const socketId = client.conn.id;
        const peerUser = this.realtimeService.getPeer(peerId);
        if (!peerUser) {
            const log = 'onAnswerEvent: Peer was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, CALL_ERROR_EVENT, log);
            return 0;
        }

        const hostId = peerUser.hostId;
        const hostUser = this.realtimeService.getHost(hostId);
        if (!hostUser) {
            const log = 'onAnswerEvent: Host was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, CALL_ERROR_EVENT, log);
            return 0;
        }

        this.logger.log(`onAnswerEvent: Peer[${peerId}] -> Host[${hostId}] Socket: ${socketId}`);

        // Forward answer to host
        const hosts = this.realtimeService.getUsers(hostId);
        if (hosts.length > 0) {
            for (let i = 0; i < hosts.length; i++) {
                const host = hosts[i];
                if (host.socketId === hostUser.socketId) {
                    host.connection.emit(ANSWER_EVENT, {
                        from_id: peerId,
                        data: data.description
                    });
                    break;
                }
            }
        }

        return 0;
    }

    // When both host get the answer
    // both host and peer exchange ICE
    @SubscribeMessage(ICE_CANDIDATE_EVENT)
    async onIceCandidateEvent(@ConnectedSocket() client: SocketConn, @MessageBody() data: { candidate: any }): Promise<number> {
        const userId = client.conn.userId;

        let clientUser = this.findClientUserByUserId(userId, 'onIceCandidateEvent');
        if (!clientUser) {
            const log = 'onIceCandidateEvent: Host && Peer was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, CALL_ERROR_EVENT, log);
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
                } else {
                    const peer = this.realtimeService.getPeer(clientId);
                    if (peer) {
                        this.logger.log(`onIceCandidateEvent: Peer found Id:${peer.userId} - host:${peer.hostId} - sw:${peer.socketId}`);
                        socketId = peer.socketId;
                    }
                }
                // Only exchange ICE in calling pair
                if (socketId && user.socketId === socketId) {
                    this.logger.log(`onIceCandidateEvent: User[${userId}] -> Client[${clientUser.uid}] Socket: ${socketId}`);
                    user.connection.emit(ICE_CANDIDATE_EVENT, {
                        from_id: userId,
                        data: data.candidate
                    });
                    break;
                }
            }
        } else {
            const log = 'onIceCandidateEvent: Peer was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, CALL_ERROR_EVENT, log);
        }
        return 0;
    }

    // In calling, host or peer can sign out of call
    // Server forward this event to the other
    @SubscribeMessage(SIGN_OUT_EVENT)
    async onSignOutEvent(@ConnectedSocket() client: SocketConn, @MessageBody() data: any): Promise<number> {
        const userId = client.conn.userId;

        const clientUser = this.findClientUserByUserId(userId, 'onSignOutEvent');
        if (!clientUser) {
            const log = 'onSignOutEvent: Host && Peer was not found';
            this.logger.error(log);
            //this.sendSocketEvent(client, CALL_ERROR_EVENT, log);
            return 0;
        }

        const clientId = clientUser.uid;
        const users = this.realtimeService.getUsers(clientUser.uid);
        if (users.length > 0) {
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                // Client is Host mean userId is Peer
                if (clientUser.isHost) {
                    const host = this.realtimeService.getHost(clientId);
                    if (host) {
                        const peer = this.realtimeService.getPeer(host.peerId);
                        const socketId = host.socketId;

                        // Emit sign out to Host from Peer
                        // In case: the call was established
                        if (peer && peer.socketId) {
                            // Only emit in pair
                            if (user.socketId === socketId) {
                                this.logger.log(`onSignOutEvent: Peer[${userId}] -> Host[${clientUser.uid}] Socket: ${socketId}`);
                                user.connection.emit(SIGN_OUT_EVENT);
                                break;
                            }
                        } else {
                            // In case: the call still not established yet
                            // Emit to all peer
                            this.logger.log(`onSignOutEvent: Peer[${userId}] -> Host[${clientUser.uid}] [not established]`);
                            user.connection.emit(SIGN_OUT_EVENT);
                        }

                    }
                } else {
                    const peer = this.realtimeService.getPeer(clientId);
                    if (peer) {
                        const socketId = peer.socketId;

                        // In case: the call was established
                        if (socketId) {
                            // Only emit in pair
                            if (user.socketId === socketId) {
                                this.logger.log(`onSignOutEvent: Host[${userId}] -> Peer[${clientUser.uid}] Socket: ${socketId}`);
                                user.connection.emit(SIGN_OUT_EVENT);
                                break;
                            }
                        } else {
                            // In case: the call still not established yet
                            // Emit to all peer
                            this.logger.log(`onSignOutEvent: Host[${userId}] -> Peer[${clientUser.uid}] [not established]`);
                            user.connection.emit(SIGN_OUT_EVENT);
                        }
                    }
                }
            }

            // Remove host & peer instances
            if (clientUser.isHost) {
                this.realtimeService.removePeer(userId);
                this.realtimeService.removeHost(clientId);
            } else {
                this.realtimeService.removeHost(userId);
                this.realtimeService.removePeer(clientId);
            }
        } else {
            const log = 'onSignOutEvent: Peer was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, CALL_ERROR_EVENT, log);
        }
        return 0;
    }

    @SubscribeMessage(MESSAGE_TYPING_EVENT)
    async onMessageTypingEvent(@ConnectedSocket() client: SocketConn, @MessageBody() data: { peerId: string, deviceId: string, body: string }): Promise<number> {
        const hostId = client.conn.userId;
        if (!data || !(data.peerId) || !(data.deviceId) || !(data.body)) {
            return 0;
        }
        const peerId = data.peerId;
        this.logger.log(`onMessageTypingEvent: Host[${hostId}] -> Peer[${peerId}]`);
        const host = await this.usersService.findUserByUid(hostId);
        if (host) {
            // Forward messages
            // Get user
            const peers = this.realtimeService.getUsers(peerId);
            if (peers.length > 0) {
                // Forward offer to all peers
                for (let i = 0; i < peers.length; i++) {
                    peers[i].connection.emit(MESSAGE_TYPING_EVENT, {
                        from_id: hostId,
                        user: host,
                        data: data.body
                    });
                }
            } else {
                this.logger.error('onMessageTypingEvent: Peer was not found');
            }
        } else {
            this.logger.error('onMessageTypingEvent: Host was not found');
        }
        return 0;
    }

    // For sending message between A and B
    // Server will save and forward that message
    // { "peerId": "guest_okweFf2OUFt0tzmDStJ45kA7YAYPn7", "deviceId": "fake1", "body": "{\"type\":\"text\",\"value\":\"hello\"}" }
    @SubscribeMessage(MESSAGE_EVENT)
    async onMessageEvent(@ConnectedSocket() client: SocketConn, @MessageBody() data: { peerId: string, deviceId: string, body: string }): Promise<string | number> {
        const hostId = client.conn.userId;
        const peerId = data.peerId;

        // Check that hostId was blocked by peerId
        const isBlocked = await this.userSettingsService.findBlocker(peerId, hostId);
        if (isBlocked) {
            const log = (`onMessageEvent: Host[${hostId}] -> Peer[${peerId}] => Host was blocked by Peer`);
            this.logger.log(log);
            this.sendSocketEvent(client, BLOCKED_EVENT, {
                host_id: hostId,
                peer_id: peerId,
                data: log
            });
            return 0;
        }

        this.logger.log(`onMessageEvent: Host[${hostId}] -> Peer[${peerId}]`);
        // const text = {"type": "text", "value": "text value"}
        // const file = {"type": "file", "value": {"original": "https://abc.com"}}
        // const image = {"type": "image", "value": {"original": "https://abc.com", "preview": "https://abc.com", "size": "200x500"}}
        if (!data || !(data.peerId) || !(data.deviceId) || !(data.body)) {
            const log = `onMessageEvent: Data error [${JSON.stringify(data)}]`
            this.logger.log(log);
            this.sendSocketEvent(client, MESSAGE_ERROR_EVENT, log);
            return 0;
        }
        // Check valid body
        try {
            const body: {
                type: string,
                value: string | { original: string, preview?: string, size?: string }
            } = JSON.parse(data.body);
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
        } catch (e) {
            const log = `onMessageEvent: ${e.message} [${data}]`
            this.logger.log(log);
            this.sendSocketEvent(client, MESSAGE_ERROR_EVENT, log);
            return 0;
        }

        // Save message
        const abMessageDto: FullMessageDto = {
            left: hostId,
            right: peerId,
            device_id: data.deviceId,
            body: data.body,
            received: false,
            read: false,
            created_at: Date.now(),
            updated_at: Date.now()
        }
        // A is sender
        // Create message for a-b
        const messages: Message[] | null = await this.messagesService.createMessage(hostId, abMessageDto);
        if (messages == null) {
            return 0;
        }
        const senderMsg = messages[0];
        const cloneMsg = messages[1];
        const host = await this.usersService.findUserByUid(hostId);
        if (host) {
            // Push notification
            const bundle: BundleNotificationDto = {
                uid: `${host.uid}`,
                name: `${host.name}`,
                avatar: `${host.avatar}`,
            }
            await this.notificationsService.pushNotificationToUid(
                NotificationType.NEW_MESSAGE,
                peerId,
                'New message',
                `${host.name ?? 'Someone'} sent you a message.`,
                bundle
            );

            // Forward messages
            // Get user
            const peers = this.realtimeService.getUsers(peerId);
            if (peers.length > 0) {
                // Forward offer to all peers
                for (let i = 0; i < peers.length; i++) {
                    peers[i].connection.emit(MESSAGE_EVENT, {
                        from_id: hostId,
                        user: host,
                        data: cloneMsg
                    });
                }
            } else {
                const log = 'onMessageEvent: Peer was not found';
                this.logger.error(log);
                this.sendSocketEvent(client, MESSAGE_ERROR_EVENT, log);
            }

        } else {
            const log = 'onMessageEvent: Host was not found';
            this.logger.error(log);
            this.sendSocketEvent(client, MESSAGE_ERROR_EVENT, log);
        }
        if (senderMsg) {
            return senderMsg._id.toString();
        }
        return 0;
    }

    /**
     * Find client by user id
     * - Find host: user id == peer id -> return host id
     * - Find peer: user id == host id -> return peer id
     * - Otherwise return null
     * @param userId
     * @param tag
     */
    findClientUserByUserId(userId: string, tag: string = 'findClientIdByUserId'): { isHost: boolean, uid: string } | null {
        const hostUser = this.realtimeService.getHost(userId);
        const peerUser = this.realtimeService.getPeer(userId);
        let clientId;
        if (hostUser) {
            // Find peer
            clientId = hostUser.peerId;
            this.logger.log(`${tag}: Host[${userId}] -> Peer[${clientId}]`);
            return {isHost: false, uid: clientId};
        } else if (peerUser) {
            // Find host
            clientId = peerUser.hostId;
            this.logger.log(`${tag}: Peer[${userId}] -> Host[${clientId}]`);
            return {isHost: true, uid: clientId};
        }
        return null;
    }

    // Send event
    sendSocketEvent(conn: SocketConn, event: string, data: any = {}) {
        if (conn) {
            conn.emit(event, data);
        }
    }


}
