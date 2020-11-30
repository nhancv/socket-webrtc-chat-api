import {Injectable, Logger} from '@nestjs/common';
import {InjectInMemoryDBService, InMemoryDBService} from "@nestjs-addons/in-memory-db";
import {WsUserEntity} from "./entities/ws-user.entity";
import {SocketConn} from "./socket.connection";
import {WsHostEntity} from "./entities/ws-host.entity";
import {WsPeerEntity} from "./entities/ws-peer.entity";
import {AppException} from "../utils/app-exception";
import {HistoriesService} from "../histories/histories.service";
import {UserSettingsService} from "../user-settings/user-settings.service";
import {FriendsService} from "../friends/friends.service";
import {bool} from "aws-sdk/clients/signer";

// request call
export const REQUEST_CALL_EVENT = 'request-call-event'; // server send-recv
// peer decline a call, forward event to host
export const DECLINE_CALL_EVENT = 'decline-call-event'; // server send-recv
// peer decline a call, forward event to other peers
export const DECLINE_CALL_PEER_EVENT = 'decline-call-peer-event'; // server send
// peer accept call
export const CALL_ACCEPTED_EVENT = 'call-accepted-event'; // server send
// send broadcast event to other peers when one instance accepted call
export const CALL_ACCEPTED_PEER_EVENT = 'call-accepted-peer-event'; // server send

// host send offer to client
export const OFFER_EVENT = 'offer-event'; // server send-recv
// when host or peer already in another call
export const OFFER_ERROR_EVENT = 'offer-error-event'; // server send
// peer accept call offer and send answer to host
export const ANSWER_EVENT = 'answer-event'; // server send-recv
// host and peer exchange ice
export const ICE_CANDIDATE_EVENT = 'ice-candidate-event'; // server send-recv
// when sign out the call
export const SIGN_OUT_EVENT = 'sign-out-event'; // server send-recv
// when call error
export const CALL_ERROR_EVENT = 'call-error-event'; // server send
// when call error
export const MESSAGE_ERROR_EVENT = 'message-error-event'; // server send
// when A send message to B
export const MESSAGE_EVENT = 'message-event';
// this event send to sender after receiver read message
export const MESSAGE_READ_EVENT = 'message-read-event';
// this event send to sender after receiver received message
export const MESSAGE_RECEIVED_EVENT = 'message-received-event';
// when A send typing event to B
export const MESSAGE_TYPING_EVENT = 'message-typing-event';
// online list. When A connect to server, server will send all online A's friend
export const ONLINE_LIST_EVENT = 'online-list-event';
// online. When A online, send to friend of A
export const ONLINE_EVENT = 'online-event';
// offline. When A offline, send to friend of A
export const OFFLINE_EVENT = 'offline-event';
// unauthorized
export const UNAUTHORIZED_EVENT = 'unauthorized-event';
// blocked event
export const BLOCKED_EVENT = 'blocked-event';

@Injectable()
export class RealtimeService {

    private readonly logger = new Logger(RealtimeService.name);

    constructor(
        private readonly historiesService: HistoriesService,
        private readonly friendsService: FriendsService,
        private readonly userSettingsService: UserSettingsService,
        @InjectInMemoryDBService('user') private wsUserService: InMemoryDBService<WsUserEntity>,
        @InjectInMemoryDBService('host') private wsHostService: InMemoryDBService<WsHostEntity>,
        @InjectInMemoryDBService('peer') private wsPeerService: InMemoryDBService<WsPeerEntity>,
    ) {
    }

    // Save user
    storeUser(connection: SocketConn): WsUserEntity {
        const newUser: Partial<WsUserEntity> = {
            connection: connection,
            userId: connection.conn.userId,
            socketId: connection.conn.id,
            timestamp: Date.now()
        }
        return this.wsUserService.create(newUser);
    }

    // Save host
    // return null if host already stored with diff peerId
    storeHost(hostId: string, peerId: string, socketId): WsHostEntity | null {
        const host = this.getHost(hostId);
        if (host != null) {
            if (host.peerId !== peerId) {
                const peer = this.getPeer(host.peerId);
                if (peer && peer.socketId) {
                    return null;
                }
            }
            // Update with new socket id
            if (host.socketId != socketId) {
                host.socketId = socketId;
                this.wsHostService.update(host);
            }
            return host;
        }
        const newHost: Partial<WsHostEntity> = {
            userId: hostId,
            peerId: peerId,
            socketId: socketId,
        }
        return this.wsHostService.create(newHost);
    }

    // Save host
    // return null if host already stored with diff peerId
    storePeer(peerId: string, hostId: string, socketId?: string): WsPeerEntity | null {
        const peer = this.getPeer(peerId);
        if (peer != null) {
            if (peer.socketId && peer.hostId !== hostId) {
                return null;
            }
            // Update with new socket id
            if (socketId && peer.socketId != socketId) {
                peer.socketId = socketId;
                this.wsPeerService.update(peer);
            }
            return peer;
        }
        const newPeer: Partial<WsPeerEntity> = {
            userId: peerId,
            hostId: hostId,
            socketId: socketId,
        }
        return this.wsPeerService.create(newPeer);
    }

    // Update peer instance
    updatePeer(peer: WsPeerEntity) {
        this.wsPeerService.update(peer);
    }

    // Get random user
    // - return a random user
    // - not a current user
    // - not a user who already in call
    // - not in histories
    async randomUser(currentUserId: string): Promise<WsUserEntity | null> {
        const histories = await this.historiesService.getHistories(currentUserId);
        const wsUsersAll: WsUserEntity[] = this.wsUserService.getAll();

        // Get block list
        const blocks = await this.userSettingsService.findBlockers(currentUserId);
        const blockMap = {};
        for (let i = 0; i < blocks.length; i++) {
            blockMap[blocks[i].block_uid] = true;
        }

        let wsUsers = wsUsersAll.filter(function (item, index, self) {
            return (
                // not a current user
                (currentUserId !== item.userId) &&
                // remove duplicate
                (self.findIndex((value => value.userId === item.userId)) === index) &&
                // remove block user
                !blockMap.hasOwnProperty(item.userId)
            );
        });
        let wsUsersWithoutHistory = wsUsers.filter(function (item, index, self) {
            return (histories.findIndex((history => history.friend_id === item.userId)) === -1);
        });
        if (wsUsersWithoutHistory.length > 0) {
            wsUsers = wsUsersWithoutHistory;
        }
        let count = 0;
        while (wsUsers.length > 0) {
            const randomIndex: number = Math.floor(Math.random() * wsUsers.length);
            const wsUser = wsUsers[randomIndex];
            const userId = wsUser.userId;
            // Check user was in call
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
            // not a current user
            // not a user who already in call
            if (
                currentUserId !== userId &&
                !host && !peer
            ) {
                return wsUser;
            }
            // Break infinity loop
            if (count > 100) {
                return null;
            }
            count++;
        }
        return null;
    }

    // Remove user
    removeUser(memoryId: number) {
        this.wsUserService.delete(memoryId);
    }

    // Remove host
    removeHost(userId: string): boolean {
        const host = this.getHost(userId);
        if (host) {
            this.wsHostService.delete(host.id);
            return true;
        }
        return false;
    }

    // Remove peer
    removePeer(userId: string) {
        const host = this.getPeer(userId);
        if (host) {
            this.wsPeerService.delete(host.id);
            return true;
        }
        return false;
    }

    // Get all user. 1 user can has multi socket instance
    getUsers(userId: string): WsUserEntity[] {
        const wsUsers: WsUserEntity[] = this.wsUserService.getAll();
        const res: WsUserEntity[] = [];
        for (let i = 0; i < wsUsers.length; i++) {
            if (wsUsers[i].userId === userId) {
                res.push(wsUsers[i]);
            }
        }
        return res;
    }

    isOnline(userId: string): boolean {
        const wsUsers: WsUserEntity[] = this.wsUserService.getAll();
        for (let i = 0; i < wsUsers.length; i++) {
            if (wsUsers[i].userId === userId) {
                return true;
            }
        }
        return false;
    }

    // return online ids
    filterOnlineInList(userIds: string[]): string[] {
        const onlineList: { [key: string]: boolean } = {};
        const wsUsers: WsUserEntity[] = this.wsUserService.getAll();
        for (let i = 0; i < wsUsers.length; i++) {
            const onlineUid = wsUsers[i].userId;
            if (userIds.indexOf(onlineUid) > -1) {
                onlineList[onlineUid] = true;
            }
        }
        return Object.keys(onlineList);
    }

    // Get host
    getHost(userId: string, socketId?: string): WsHostEntity | null {
        const wsUsers: WsHostEntity[] = this.wsHostService.getAll();
        for (let i = 0; i < wsUsers.length; i++) {
            const host = wsUsers[i];
            if (host.userId === userId && (!socketId || host.socketId === socketId)) {
                return host;
            }
        }
        return null;
    }

    // Get peer
    getPeer(userId: string, socketId?: string): WsPeerEntity | null {
        const wsUsers: WsPeerEntity[] = this.wsPeerService.getAll();
        for (let i = 0; i < wsUsers.length; i++) {
            const peer = wsUsers[i];
            if (peer.userId === userId && (!socketId || peer.socketId === socketId)) {
                return peer;
            }
        }
        return null;
    }

    // After Receiver read message will event to sender
    // isReceived ? MESSAGE_RECEIVED_EVENT : MESSAGE_READ_EVENT
    sendReadMessageEventToSender(senderId: string, receiverId: string, isReceived: boolean) {
        try {
            const senderUsers = this.getUsers(senderId);
            for (let i = 0; i < senderUsers.length; i++) {
                const senderUser = senderUsers[i];
                if (senderUser &&
                    senderUser.connection &&
                    senderUser.connection.connected) {

                    senderUser.connection.emit(
                        isReceived ? MESSAGE_RECEIVED_EVENT : MESSAGE_READ_EVENT, {
                            sender_id: senderId,
                            receiver_id: receiverId,
                            updated_at: Date.now()
                        });
                }
            }
        } catch (e) {
            this.logger.error(new AppException('sendReadMessageEventToSender', e));
        }
    }

    // After Receiver read message will event to sender
    async sendReadMessageEventToFriends(receiverId: string, isReceived: boolean) {
        try {
            const friendList = await this.friendsService.getFriends(receiverId);
            if (friendList) {
                for (let f = 0; f < friendList.length; f++) {
                    const friend = friendList[f];
                    const senderId = friend.right;
                    this.sendReadMessageEventToSender(senderId, receiverId, isReceived);
                }
            }
        } catch (e) {
            this.logger.error(new AppException('sendReadMessageEventToFriends', e));
        }
    }

    emitEventToSenderUsers(senderId: string, receiverId: string, event: string) {
        const senderUsers = this.getUsers(senderId);
        for (let i = 0; i < senderUsers.length; i++) {
            const senderUser = senderUsers[i];
            if (senderUser &&
                senderUser.connection &&
                senderUser.connection.connected) {
                senderUser.connection.emit(
                    event, {
                        sender_id: senderId,
                        receiver_id: receiverId,
                        updated_at: Date.now()
                    });
            }
        }
    }

    sendSocketMessageWithUid(uid: string, event: string, data: any) {
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
        } catch (e) {
            this.logger.error(new AppException('sendSocketMessageWithUid', e));
        }
    }

    disconnectSocketWithUid(uid: string) {
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
        } catch (e) {
            this.logger.error(new AppException('disconnectSocketWithUid:173', e));
        }
    }
}
