import {Body, Controller, HttpStatus, Post} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {TokenResponse} from "../models/responses/token.response";
import {BaseResponse} from "../models/responses/base.response";
import {ApiBody, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {VerifyTokenDto} from "./dto/verify-token.dto";
import {TokenResponseDto} from "./dto/token-response.dto";
import {GuestRequestDto} from "./dto/guest-request.dto";
import moment from "moment";
import {GuestService} from "../guest/guest.service";
import {UsersService} from "../users/users.service";

@ApiTags('auth')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly usersService: UsersService,
        private readonly guestService: GuestService,
        private readonly authService: AuthService,
    ) {
    }

    @Post('firebase')
    @ApiOperation({summary: 'Verify firebase token'})
    @ApiBody({type: VerifyTokenDto})
    @ApiOkResponse({
        description: 'token info',
        type: TokenResponseDto,
    })
    async verifyFirebaseToken(@Body() firebaseTokenObj: VerifyTokenDto): Promise<BaseResponse<TokenResponse>> {
        const response: BaseResponse<TokenResponse> = {}
        response.data = await this.authService.verifyFirebaseToken(firebaseTokenObj.token);
        return response;
    }

    @Post('guest')
    @ApiOperation({summary: 'Guest token'})
    @ApiBody({type: GuestRequestDto})
    @ApiOkResponse({
        description: 'token info',
        type: TokenResponseDto,
    })
    async requestGuestToken(@Body() guestRequestDto: GuestRequestDto): Promise<BaseResponse<TokenResponse>> {
        const response: BaseResponse<TokenResponse> = {};
        // Check exist token
        const existGuest = await this.guestService.findGuestByDevice(guestRequestDto.device_id);
        const guestMaxConnection = parseInt(process.env.GUEST_CONNECTION_LIMIT ?? '0');
        if (existGuest) {
            if (existGuest.connection_count > guestMaxConnection) {
                // If guest reach max connection, return error, wait to 5 mins
                const blockingTime = parseInt(process.env.GUEST_BLOCKING_TIME ?? '0');
                const now = moment();
                const updatedAt = moment(existGuest.updated_at);
                const expiresExpected = updatedAt.add(blockingTime, 'minutes');
                if (expiresExpected.isAfter(now)) {
                    const remainTime = expiresExpected.diff(now, 'minutes')
                    response.error = {
                        code: HttpStatus.FORBIDDEN,
                        message: `You need to wait ${remainTime} minutes`,
                        payload: remainTime
                    };
                    return response;
                } else {
                    await this.guestService.deleteAllGuestInstance(existGuest.uid);
                }
            }
            let user = await this.usersService.findUserByUid(existGuest.uid);
            if(!user) {
                await this.guestService.deleteAllGuestInstance(existGuest.uid);
                response.data = await this.authService.generateGuestUser(guestRequestDto.device_id);
            } else {
                response.data = await this.authService.generateGuestToken(existGuest.uid, user);
            }
            return response;
        } else {
            response.data = await this.authService.generateGuestUser(guestRequestDto.device_id);
            return response;
        }
    }
}
