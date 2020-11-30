import {Body, Controller, Get, Put, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {AppConfigService} from "./app-config.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {FullFriendDto} from "../friends/dto/full-friend.dto";
import {AuthJwt} from "../auth/auth.decorator";
import {JwtPayload} from "../auth/jwt.payload";
import {BaseResponse} from "../models/responses/base.response";
import {MobileVersionDto} from "./dto/mobile-version.dto";
import {Roles} from "../auth/roles.decorator";
import {RolesGuard} from "../auth/roles.guard";
import {ROLE_ADMIN} from "../admins/dto/admin.roles";
import {AdminDto} from "../admins/dto/admin.dto";

@ApiTags('app config')
@Controller('app-config')
export class AppConfigController {

    constructor(private appConfigService: AppConfigService) {
    }

    @Get('mobile-version')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Get mobile version'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'Mobile Version',
        type: MobileVersionDto,
    })
    async getMobileVersion(@AuthJwt() payload: JwtPayload): Promise<BaseResponse<MobileVersionDto>> {
        const response: BaseResponse<MobileVersionDto> = {}
        const appConfig = await this.appConfigService.getAppConfig();
        response.data = {
            ios_version: appConfig?.ios_version ?? 0,
            ad_version: appConfig?.ad_version ?? 0

        };
        return response;
    }

    @Put('mobile-version')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_ADMIN)
    @ApiOperation({summary: 'Update mobile version - admin only'})
    @ApiBearerAuth()
    @ApiBody({type: MobileVersionDto})
    @ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    })
    async updateMobileVersion(@Body() mobileVersionDto: MobileVersionDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        response.data = await this.appConfigService.updateMobileVersion(mobileVersionDto);
        return response;
    }
}
