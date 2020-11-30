import {InMemoryDBEntity} from "@nestjs-addons/in-memory-db";

export interface WsHostEntity extends InMemoryDBEntity {
    userId: string;
    peerId: string;
    socketId: string;
}
