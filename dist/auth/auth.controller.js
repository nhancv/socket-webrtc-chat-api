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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const swagger_1 = require("@nestjs/swagger");
const verify_token_dto_1 = require("./dto/verify-token.dto");
const token_response_dto_1 = require("./dto/token-response.dto");
const guest_request_dto_1 = require("./dto/guest-request.dto");
const moment_1 = __importDefault(require("moment"));
const guest_service_1 = require("../guest/guest.service");
const users_service_1 = require("../users/users.service");
let AuthController = class AuthController {
    constructor(usersService, guestService, authService) {
        this.usersService = usersService;
        this.guestService = guestService;
        this.authService = authService;
    }
    async verifyFirebaseToken(firebaseTokenObj) {
        const response = {};
        response.data = await this.authService.verifyFirebaseToken(firebaseTokenObj.token);
        return response;
    }
    async requestGuestToken(guestRequestDto) {
        var _a, _b;
        const response = {};
        const existGuest = await this.guestService.findGuestByDevice(guestRequestDto.device_id);
        const guestMaxConnection = parseInt((_a = process.env.GUEST_CONNECTION_LIMIT) !== null && _a !== void 0 ? _a : '0');
        if (existGuest) {
            if (existGuest.connection_count > guestMaxConnection) {
                const blockingTime = parseInt((_b = process.env.GUEST_BLOCKING_TIME) !== null && _b !== void 0 ? _b : '0');
                const now = moment_1.default();
                const updatedAt = moment_1.default(existGuest.updated_at);
                const expiresExpected = updatedAt.add(blockingTime, 'minutes');
                if (expiresExpected.isAfter(now)) {
                    const remainTime = expiresExpected.diff(now, 'minutes');
                    response.error = {
                        code: common_1.HttpStatus.FORBIDDEN,
                        message: `You need to wait ${remainTime} minutes`,
                        payload: remainTime
                    };
                    return response;
                }
                else {
                    await this.guestService.deleteAllGuestInstance(existGuest.uid);
                }
            }
            let user = await this.usersService.findUserByUid(existGuest.uid);
            if (!user) {
                await this.guestService.deleteAllGuestInstance(existGuest.uid);
                response.data = await this.authService.generateGuestUser(guestRequestDto.device_id);
            }
            else {
                response.data = await this.authService.generateGuestToken(existGuest.uid, user);
            }
            return response;
        }
        else {
            response.data = await this.authService.generateGuestUser(guestRequestDto.device_id);
            return response;
        }
    }
};
__decorate([
    common_1.Post('firebase'),
    swagger_1.ApiOperation({ summary: 'Verify firebase token' }),
    swagger_1.ApiBody({ type: verify_token_dto_1.VerifyTokenDto }),
    swagger_1.ApiOkResponse({
        description: 'token info',
        type: token_response_dto_1.TokenResponseDto,
    }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_token_dto_1.VerifyTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyFirebaseToken", null);
__decorate([
    common_1.Post('guest'),
    swagger_1.ApiOperation({ summary: 'Guest token' }),
    swagger_1.ApiBody({ type: guest_request_dto_1.GuestRequestDto }),
    swagger_1.ApiOkResponse({
        description: 'token info',
        type: token_response_dto_1.TokenResponseDto,
    }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [guest_request_dto_1.GuestRequestDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestGuestToken", null);
AuthController = __decorate([
    swagger_1.ApiTags('auth'),
    common_1.Controller('auth'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        guest_service_1.GuestService,
        auth_service_1.AuthService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map