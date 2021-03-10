import {Injectable, UnauthorizedException} from '@nestjs/common';
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import {JwtPayload} from "./jwt.payload";
import {User} from "../users/schemas/user.schema";
import {FirebaseAuthenticationService} from "@aginix/nestjs-firebase-admin";
import {TokenResponse} from "../models/responses/token.response";
import * as admin from 'firebase-admin';
import {CreateUserDto} from "../users/dto/create-user.dto";
import {GuestService} from "../guest/guest.service";
import {AdminsService} from "../admins/admins.service";
import {UserRoleDto} from "../users/dto/user-role.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly adminsService: AdminsService,
        private readonly usersService: UsersService,
        private readonly guestService: GuestService,
        private readonly firebaseAuth: FirebaseAuthenticationService
    ) {
    }

    // Client login Firebase sdk, then push access token to backend
    // Backend verify Firebase token then return new jwt app token
    async verifyFirebaseToken(firebaseToken: string): Promise<TokenResponse> {
        const decodedIdToken: admin.auth.DecodedIdToken = await this.firebaseAuth.verifyIdToken(firebaseToken);
        // Fake decodedIdToken
        // const decodedIdToken = {uid: '123'};
        if (decodedIdToken && decodedIdToken.uid) {
            const uid = decodedIdToken.uid;
            const payload: JwtPayload = {uid: uid};
            const accessToken = this.jwtService.sign(payload);

            let user = await this.usersService.findUserByUid(uid);
            if (!user) {
                // Get email
                const firebaseUser: admin.auth.UserRecord = await this.firebaseAuth.getUser(uid);
                let email = decodedIdToken.email || '';
                if (!email || email.trim().length === 0) {
                    for (let i = 0; i < firebaseUser.providerData.length; i++) {
                        email = firebaseUser.providerData[i].email;
                        if (email && email.trim().length > 0) break;
                    }
                }
                // Create user record
                const createUserDto: CreateUserDto = {
                    name: decodedIdToken.name,
                    email: email,
                    username: '',
                    ages: 0,
                    gender: 0,
                    avatar: decodedIdToken.picture
                }
                user = await this.usersService.updateUser(uid, createUserDto);
            }

            return {
                user: user,
                accessToken: accessToken,
                expiresIn: process.env.EXPIRES_IN ?? '-'
            }
        } else {
            throw new UnauthorizedException('Invalid token');
        }
    }

    // Generate guest token
    async generateGuestToken(uid: string, user: User | null): Promise<TokenResponse> {
        const guestExpiresIn = `${process.env.GUEST_EXPIRES_MINUTE}m`;
        const payload: JwtPayload = {uid: uid};
        const accessToken = this.jwtService.sign(payload, {expiresIn: guestExpiresIn});
        return {
            user: user,
            accessToken: accessToken,
            expiresIn: guestExpiresIn
        }
    }

    // Generate guest user
    async generateGuestUser(deviceId: string): Promise<TokenResponse> {
        // Create new guest
        const faker = require('faker');
        const randomId = require('random-id');
        const uid = `guest_${randomId()}`;

        let user = await this.usersService.findUserByUid(uid);
        if (!user) {
            // Create user record
            const username = `${new Date().getTime()}`;
            const createUserDto: CreateUserDto = {
                name: faker.name.findName(),
                email: faker.internet.email().toLowerCase() || username,
                username: username,
                ages: 0,
                gender: 0,
                avatar: faker.image.avatar()
            }
            await this.guestService.createGuest(uid, {
                connection_count: 0, device_id: deviceId
            });
            user = await this.usersService.createUser(uid, createUserDto);
        }

        return this.generateGuestToken(uid, user);

    }

    // Validate user using jwt token
    async validateUser(payload: JwtPayload): Promise<User> {
        const uid = payload.uid;
        const user = await this.usersService.findUserByUid(uid);
        if (!user) {
            throw new UnauthorizedException('Invalid token');
        } else {
            const userWRole: UserRoleDto = user.toObject();
            const admin = await this.adminsService.findAdmin(uid);
            if(admin && admin.role) {
                userWRole.role = admin.role;
            }
            return userWRole;
        }
    }

    // Verify jwt token using jwt service
    async verifyAsync(jwtToken: string) {
        return this.jwtService.verifyAsync(jwtToken);
    }

    // Decode jwt using jwt service
    decodeJwt(jwtToken: string): null | {
        [key: string]: any;
    } | string {
        return this.jwtService.decode(jwtToken);
    }
}
