import * as SocketIO from 'socket.io';

export interface SocketConn extends SocketIO.Socket {
    conn: SocketIO.EngineSocket & {
        jwtToken: string;
        userId: string;
        memoryId: number;
    };
}
