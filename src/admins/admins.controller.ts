import {Body, Controller, Delete, Get, HttpStatus, Logger, Param, Post, Put, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {AuthJwt} from "../auth/auth.decorator";
import {JwtPayload} from "../auth/jwt.payload";
import {BaseResponse} from "../models/responses/base.response";
import {AdminsService} from "./admins.service";
import {AdminDto} from "./dto/admin.dto";
import {Admin} from "./schemas/admin.schema";
import {RolesGuard} from "../auth/roles.guard";
import {Roles} from "../auth/roles.decorator";
import {ROLE_ADMIN, ROLE_OWNER} from "./dto/admin.roles";

@ApiTags('admins')
@Controller('admins')
export class AdminsController {

    private logger: Logger = new Logger(AdminsController.name);

    constructor(
        private readonly adminsService: AdminsService,
    ) {
    }

    // Get admin info.
    // Only admin can get other admins info
    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Get admin info'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'admin info',
        type: Admin,
    })
    async getAdmin(@AuthJwt() payload: JwtPayload): Promise<BaseResponse<Admin>> {
        const response: BaseResponse<Admin> = {}
        const uid = payload.uid;
        const admin = await this.adminsService.findAdmin(uid);
        if (!admin) {
            response.error = {
                code: HttpStatus.NOT_FOUND,
                message: "Admin was not found."
            }
        } else {
            response.data = admin;
        }
        return response;
    }

    @Get('all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_ADMIN)
    @ApiOperation({summary: 'Get all admins'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'admin list',
        type: [Admin],
    })
    async getAllAdmins(@AuthJwt() payload: JwtPayload): Promise<BaseResponse<Admin[]>> {
        const response: BaseResponse<Admin[]> = {}
        response.data = await this.adminsService.findAllAdmins();
        return response;
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_ADMIN)
    @ApiOperation({summary: 'Create new admin'})
    @ApiBearerAuth()
    @ApiBody({type: AdminDto})
    @ApiOkResponse({
        description: 'admin info',
        type: Admin,
    })
    async createAdmin(@Body() adminDto: AdminDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<Admin>> {
        const response: BaseResponse<Admin> = {}
        response.data = await this.adminsService.createAdmin(adminDto);
        return response;
    }

    @Put()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_ADMIN)
    @ApiOperation({summary: 'Update admin'})
    @ApiBearerAuth()
    @ApiBody({type: AdminDto})
    @ApiOkResponse({
        description: 'admin info',
        type: Admin,
    })
    async updateAdmin(@Body() adminDto: AdminDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<Admin>> {
        const response: BaseResponse<Admin> = {}
        response.data = await this.adminsService.updateAdmin(adminDto);
        return response;
    }

    @Delete(':uid')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE_OWNER)
    @ApiOperation({summary: 'Delete admin - owner only'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'true/false',
        type: Boolean,
    })
    async deleteAdmin(@Param('uid') adminId: string, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        response.data = await this.adminsService.deleteAdmin(adminId);
        return response;
    }
}
