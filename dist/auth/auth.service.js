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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const dist_1 = require("@aginix/nestjs-firebase-admin/dist");
const guest_service_1 = require("../guest/guest.service");
const admins_service_1 = require("../admins/admins.service");
let AuthService = class AuthService {
    constructor(jwtService, adminsService, usersService, guestService, firebaseAuth) {
        this.jwtService = jwtService;
        this.adminsService = adminsService;
        this.usersService = usersService;
        this.guestService = guestService;
        this.firebaseAuth = firebaseAuth;
    }
    async verifyFirebaseToken(firebaseToken) {
        var _a;
        const decodedIdToken = await this.firebaseAuth.verifyIdToken(firebaseToken);
        if (decodedIdToken && decodedIdToken.uid) {
            const uid = decodedIdToken.uid;
            const payload = { uid: uid };
            const accessToken = this.jwtService.sign(payload);
            let user = await this.usersService.findUserByUid(uid);
            if (!user) {
                const firebaseUser = await this.firebaseAuth.getUser(uid);
                let email = decodedIdToken.email || '';
                if (!email || email.trim().length === 0) {
                    for (let i = 0; i < firebaseUser.providerData.length; i++) {
                        email = firebaseUser.providerData[i].email;
                        if (email && email.trim().length > 0)
                            break;
                    }
                }
                const createUserDto = {
                    name: decodedIdToken.name,
                    email: email,
                    username: '',
                    ages: 0,
                    gender: 0,
                    avatar: decodedIdToken.picture
                };
                user = await this.usersService.updateUser(uid, createUserDto);
            }
            return {
                user: user,
                accessToken: accessToken,
                expiresIn: (_a = process.env.EXPIRES_IN) !== null && _a !== void 0 ? _a : '-'
            };
        }
        else {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async generateGuestToken(uid, user) {
        const guestExpiresIn = `${process.env.GUEST_EXPIRES_MINUTE}m`;
        const payload = { uid: uid };
        const accessToken = this.jwtService.sign(payload, { expiresIn: guestExpiresIn });
        return {
            user: user,
            accessToken: accessToken,
            expiresIn: guestExpiresIn
        };
    }
    async generateGuestUser(deviceId) {
        const faker = require('faker');
        const randomId = require('random-id');
        const uid = `guest_${randomId()}`;
        let user = await this.usersService.findUserByUid(uid);
        if (!user) {
            const username = `${new Date().getTime()}`;
            const createUserDto = {
                name: faker.name.findName(),
                email: faker.internet.email().toLowerCase() || username,
                username: username,
                ages: 0,
                gender: 0,
                avatar: faker.image.avatar()
            };
            await this.guestService.createGuest(uid, {
                connection_count: 0, device_id: deviceId
            });
            user = await this.usersService.createUser(uid, createUserDto);
        }
        return this.generateGuestToken(uid, user);
    }
    async validateUser(payload) {
        const uid = payload.uid;
        const user = await this.usersService.findUserByUid(uid);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        else {
            const userWRole = user.toObject();
            const admin = await this.adminsService.findAdmin(uid);
            if (admin && admin.role) {
                userWRole.role = admin.role;
            }
            return userWRole;
        }
    }
    async verifyAsync(jwtToken) {
        return this.jwtService.verifyAsync(jwtToken);
    }
    decodeJwt(jwtToken) {
        return this.jwtService.decode(jwtToken);
    }
};
AuthService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        admins_service_1.AdminsService,
        users_service_1.UsersService,
        guest_service_1.GuestService,
        dist_1.FirebaseAuthenticationService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map