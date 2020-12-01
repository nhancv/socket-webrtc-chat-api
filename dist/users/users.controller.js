"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var UsersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const user_schema_1 = require("./schemas/user.schema");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_user_dto_1 = require("./dto/create-user.dto");
const auth_decorator_1 = require("../auth/auth.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const fs = __importStar(require("fs"));
const swagger_1 = require("@nestjs/swagger");
const api_file_decorator_1 = require("../utils/api-file.decorator");
const search_user_dto_1 = require("./dto/search-user.dto");
const detect_gender_dto_1 = require("./dto/detect-gender.dto");
const friends_service_1 = require("../friends/friends.service");
const user_relationship_dto_1 = require("../friends/dto/user-relationship.dto");
const sharp_1 = __importDefault(require("sharp"));
let UsersController = UsersController_1 = class UsersController {
    constructor(friendsService, usersService) {
        this.friendsService = friendsService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(UsersController_1.name);
    }
    async create(user, payload) {
        const response = {};
        const uid = payload.uid;
        const userByUsername = await this.usersService.findUserByUsername(user.username);
        if (!userByUsername || userByUsername.uid === uid) {
            response.data = await this.usersService.updateUser(uid, user);
        }
        else {
            response.error = {
                code: common_1.HttpStatus.NOT_ACCEPTABLE,
                message: "Username is not available."
            };
        }
        return response;
    }
    async getUserInfo(payload) {
        const response = {};
        response.data = await this.usersService.findUserByUid(payload.uid);
        return response;
    }
    async searchUsersByUsername(searchDto, payload) {
        const response = {};
        const users = await this.usersService.searchUsersByUsername(searchDto.username);
        const results = [];
        if (users) {
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const relation = await this.friendsService.getRelationship(payload.uid, user.uid);
                if (relation) {
                    results.push(relation);
                }
            }
            response.data = results;
        }
        return response;
    }
    async deleteUser(payload) {
        const response = {};
        response.data = await this.usersService.deleteUser(payload.uid);
        return response;
    }
    async uploadAvatar(payload, file) {
        const env = process.env.ENV || 'default';
        const bucketName = process.env.AWS_BUCKET;
        const multerDest = process.env.MULTER_DEST || 'upload';
        if (!bucketName) {
            return {
                error: {
                    code: common_1.HttpStatus.NOT_FOUND,
                    message: 'Unknow bucketName'
                }
            };
        }
        const filename = file.filename;
        const uid = payload.uid;
        const filePath = `./${multerDest}/` + filename;
        const awsFilePath = `${env}/avatars/${uid}_${filename}`;
        try {
            fs.unlinkSync(filePath);
        }
        catch (e) {
            this.logger.error(e);
        }
        await this.usersService.updateAvatar(uid, {
            avatar: awsFilePath
        });
        const response = {
            data: awsFilePath
        };
        return response;
    }
    async detectGender(payload, file) {
        const response = {};
        const multerDest = process.env.MULTER_DEST || 'upload';
        const filename = file.filename;
        const filePath = `./${multerDest}/` + filename;
        const notFoundE = {
            code: common_1.HttpStatus.NOT_FOUND,
            message: "Face was not found"
        };
        const notAcceptableE = {
            code: common_1.HttpStatus.NOT_ACCEPTABLE,
            message: "Image file is not valid."
        };
        try {
            const isImage = require('is-image');
            if (isImage(filePath)) {
                const previewFilename = `preview_${filename}`;
                const filePreviewPath = `./${multerDest}/${previewFilename}`;
                const sharpFile = sharp_1.default(filePath);
                const originalFileMetadata = await sharpFile.metadata();
                const w = originalFileMetadata.width ? originalFileMetadata.width : 0;
                const h = originalFileMetadata.height ? originalFileMetadata.height : 0;
                if (w > 0 && h > 0) {
                    const maxPreviewSize = 300;
                    const maxSize = Math.max(w, h);
                    let resizeFactor = 1;
                    if (maxSize > maxPreviewSize) {
                        resizeFactor = maxSize / maxPreviewSize;
                    }
                    await sharpFile
                        .resize(Math.floor(w / resizeFactor), Math.floor(h / resizeFactor))
                        .toFile(filePreviewPath);
                    response.error = notFoundE;
                    try {
                        fs.unlinkSync(filePreviewPath);
                    }
                    catch (e) {
                        this.logger.error(e);
                    }
                }
                else {
                    response.error = notAcceptableE;
                }
            }
            else {
                response.error = notAcceptableE;
            }
        }
        finally {
            try {
                fs.unlinkSync(filePath);
            }
            catch (e) {
                this.logger.error(e);
            }
        }
        return response;
    }
};
__decorate([
    common_1.Post(),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Update user info' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: create_user_dto_1.CreateUserDto }),
    swagger_1.ApiOkResponse({
        description: 'user info',
        type: user_schema_1.User,
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    common_1.Get(),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Get user' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'user info',
        type: user_schema_1.User,
    }),
    __param(0, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserInfo", null);
__decorate([
    common_1.Post('search'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Search by username' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: search_user_dto_1.SearchUserDto }),
    swagger_1.ApiOkResponse({
        description: 'list of user',
        type: [user_relationship_dto_1.UserRelationshipDto],
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_user_dto_1.SearchUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchUsersByUsername", null);
__decorate([
    common_1.Delete(),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Delete user' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    }),
    __param(0, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
__decorate([
    common_1.Post('avatar'),
    swagger_1.ApiOperation({ summary: 'Upload avatar' }),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.UseInterceptors(platform_express_1.FileInterceptor('file')),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiConsumes('multipart/form-data'),
    api_file_decorator_1.ApiBodyFile(),
    swagger_1.ApiOkResponse({
        description: 'file name',
        type: String,
    }),
    __param(0, auth_decorator_1.AuthJwt()), __param(1, common_1.UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    common_1.Post('gender'),
    swagger_1.ApiOperation({ summary: 'Detect gender' }),
    common_1.UseInterceptors(platform_express_1.FileInterceptor('file')),
    swagger_1.ApiConsumes('multipart/form-data'),
    api_file_decorator_1.ApiBodyFile(),
    swagger_1.ApiOkResponse({
        description: 'success',
        type: detect_gender_dto_1.DetectGenderDto
    }),
    swagger_1.ApiNotFoundResponse({ description: 'Face was not found' }),
    swagger_1.ApiNotAcceptableResponse({ description: 'Image file is not valid.' }),
    __param(0, auth_decorator_1.AuthJwt()), __param(1, common_1.UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "detectGender", null);
UsersController = UsersController_1 = __decorate([
    swagger_1.ApiTags('users'),
    common_1.Controller('users'),
    __metadata("design:paramtypes", [friends_service_1.FriendsService,
        users_service_1.UsersService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map