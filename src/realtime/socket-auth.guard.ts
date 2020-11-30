import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {SocketConn} from "./socket.connection";
import {AuthService} from "../auth/auth.service";
import {JwtPayload} from "../auth/jwt.payload";
import {WsUserEntity} from "./entities/ws-user.entity";
import {RealtimeService} from "./realtime.service";

@Injectable()
export class SocketAuthGuard implements CanActivate {
    constructor(private authService: AuthService,
                private realtimeService: RealtimeService) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context?.switchToWs()?.getClient();
        return SocketAuthGuard.verifyToken(
            this.authService,
            this.realtimeService,
            client,
            client.conn.token,
        );
    }

    static async verifyToken(
        authService: AuthService,
        realtimeService: RealtimeService,
        socket: SocketConn,
        token?: string,
    ) {
        let verify = false;
        try {
            verify = !!(await authService.verifyAsync(socket.conn.jwtToken) &&
                await authService.validateUser({uid: socket.conn.userId}));
        } catch (e) {
        }

        if (
            socket.conn.userId && verify
        ) {
            return true;
        }

        if (!token) return false;

        const isBearerToken = token.indexOf('Bearer ') === 0;
        const jwtToken = token.replace('Bearer ', '');
        const rawPayload = isBearerToken ? await authService.decodeJwt(jwtToken) : null;
        if (!rawPayload) return false;
        const payload: JwtPayload = {
            uid: rawPayload['uid']
        }
        socket.conn.jwtToken = jwtToken;
        socket.conn.userId = payload.uid;

        verify = false;
        try {
            verify = !!(await authService.verifyAsync(socket.conn.jwtToken) &&
                await authService.validateUser({uid: socket.conn.userId}));
        } catch (e) {
        }

        if (verify) {
            // Save user
            const user: WsUserEntity = realtimeService.storeUser(socket);
            socket.conn.memoryId = user.id;
            return true;
        }
        return false;
    }
}
