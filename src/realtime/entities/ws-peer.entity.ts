import {InMemoryDBEntity} from "@nestjs-addons/in-memory-db";

export interface WsPeerEntity extends InMemoryDBEntity {
    userId: string;
    hostId: string;
    socketId?: string;
}
