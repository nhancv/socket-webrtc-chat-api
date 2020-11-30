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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_config_service_1 = require("./app-config.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const auth_decorator_1 = require("../auth/auth.decorator");
const mobile_version_dto_1 = require("./dto/mobile-version.dto");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const admin_roles_1 = require("../admins/dto/admin.roles");
let AppConfigController = class AppConfigController {
    constructor(appConfigService) {
        this.appConfigService = appConfigService;
    }
    async getMobileVersion(payload) {
        var _a, _b;
        const response = {};
        const appConfig = await this.appConfigService.getAppConfig();
        response.data = {
            ios_version: (_a = appConfig === null || appConfig === void 0 ? void 0 : appConfig.ios_version) !== null && _a !== void 0 ? _a : 0,
            ad_version: (_b = appConfig === null || appConfig === void 0 ? void 0 : appConfig.ad_version) !== null && _b !== void 0 ? _b : 0
        };
        return response;
    }
    async updateMobileVersion(mobileVersionDto, payload) {
        const response = {};
        response.data = await this.appConfigService.updateMobileVersion(mobileVersionDto);
        return response;
    }
};
__decorate([
    common_1.Get('mobile-version'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Get mobile version' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'Mobile Version',
        type: mobile_version_dto_1.MobileVersionDto,
    }),
    __param(0, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppConfigController.prototype, "getMobileVersion", null);
__decorate([
    common_1.Put('mobile-version'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    roles_decorator_1.Roles(admin_roles_1.ROLE_ADMIN),
    swagger_1.ApiOperation({ summary: 'Update mobile version - admin only' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: mobile_version_dto_1.MobileVersionDto }),
    swagger_1.ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mobile_version_dto_1.MobileVersionDto, Object]),
    __metadata("design:returntype", Promise)
], AppConfigController.prototype, "updateMobileVersion", null);
AppConfigController = __decorate([
    swagger_1.ApiTags('app config'),
    common_1.Controller('app-config'),
    __metadata("design:paramtypes", [app_config_service_1.AppConfigService])
], AppConfigController);
exports.AppConfigController = AppConfigController;
//# sourceMappingURL=app-config.controller.js.map