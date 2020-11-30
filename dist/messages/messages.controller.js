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
var MessagesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const swagger_1 = require("@nestjs/swagger");
const messages_service_1 = require("./messages.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const auth_decorator_1 = require("../auth/auth.decorator");
const message_schema_1 = require("./schemas/message.schema");
const update_message_dto_1 = require("./dto/update-message.dto");
const realtime_service_1 = require("../realtime/realtime.service");
const api_implicit_query_decorator_1 = require("@nestjs/swagger/dist/decorators/api-implicit-query.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const api_file_decorator_1 = require("../utils/api-file.decorator");
const aws_s3_service_1 = require("../aws-s3/aws-s3.service");
const delete_multi_conversation_dto_1 = require("./dto/delete-multi-conversation.dto");
const upload_file_dto_1 = require("./dto/upload-file.dto");
let MessagesController = MessagesController_1 = class MessagesController {
    constructor(messagesService, realtimeService, awsS3Service) {
        this.messagesService = messagesService;
        this.realtimeService = realtimeService;
        this.awsS3Service = awsS3Service;
        this.logger = new common_1.Logger(MessagesController_1.name);
    }
    async getMessages(rightId, from, to, payload) {
        const response = {};
        const uid = payload.uid;
        response.data = (await this.messagesService.getMessages(uid, rightId, from, to));
        return response;
    }
    async deleteMessage(messageId, payload) {
        const response = {};
        const uid = payload.uid;
        response.data = (await this.messagesService.deleteMessage(messageId, uid));
        return response;
    }
    async deleteMultiConversation(multiConversationDto, payload) {
        const response = {};
        const uid = payload.uid;
        response.data = (await this.messagesService.deleteMultiConversations(uid, multiConversationDto.rightIds));
        return response;
    }
    async deleteConversation(rightId, payload) {
        const response = {};
        const uid = payload.uid;
        response.data = (await this.messagesService.deleteConversation(uid, rightId));
        return response;
    }
    async deleteAllConversation(payload) {
        const response = {};
        const uid = payload.uid;
        response.data = (await this.messagesService.deleteAllConversation(uid));
        return response;
    }
    async updateMessageBody(updateMessageDto, messageId, payload) {
        const response = {};
        const uid = payload.uid;
        response.data = (await this.messagesService.updateMessageBody(messageId, uid, updateMessageDto));
        return response;
    }
    async updateAllMessageReceived(payload) {
        const response = {};
        const uid = payload.uid;
        response.data = (await this.messagesService.updateAllMessageReceived(uid));
        if (response.data) {
            await this.realtimeService.sendReadMessageEventToFriends(uid, true);
        }
        return response;
    }
    async updateMessageReceived(peerId, payload) {
        const response = {};
        const uid = payload.uid;
        response.data = (await this.messagesService.updateMessageReceived(peerId, uid));
        if (response.data) {
            this.realtimeService.sendReadMessageEventToSender(peerId, uid, true);
        }
        return response;
    }
    async updateMessageRead(peerId, payload) {
        const response = {};
        const uid = payload.uid;
        response.data = (await this.messagesService.updateMessageRead(uid, peerId));
        if (response.data) {
            this.realtimeService.sendReadMessageEventToSender(peerId, uid, false);
        }
        return response;
    }
    async updateAllMessageRead(payload) {
        const response = {};
        const uid = payload.uid;
        response.data = (await this.messagesService.updateAllMessageRead(uid));
        if (response.data) {
            await this.realtimeService.sendReadMessageEventToFriends(uid, false);
        }
        return response;
    }
    async uploadFile(payload, file) {
        const response = {};
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
        const filePath = `./${multerDest}/${filename}`;
        const awsFilePath = `${env}/messages/${uid}_${filename}`;
        try {
            await this.awsS3Service.uploadFile(bucketName, filePath, awsFilePath);
            const isImage = require('is-image');
            if (isImage(filePath)) {
                let fileW = 0;
                let fileH = 0;
                const previewFilename = `preview_${filename}`;
                const filePreviewPath = `./${multerDest}/${previewFilename}`;
                const awsFileReviewPath = `${env}/messages/${uid}_${previewFilename}`;
                const sharpFile = sharp_1.default(filePath);
                const originalFileMetadata = await sharpFile.metadata();
                const w = originalFileMetadata.width ? originalFileMetadata.width : 0;
                const h = originalFileMetadata.height ? originalFileMetadata.height : 0;
                if (w > 0 && h > 0) {
                    fileW = w;
                    fileH = h;
                    const maxPreviewSize = 300;
                    const maxSize = Math.max(w, h);
                    let resizeFactor = 1;
                    if (maxSize > maxPreviewSize) {
                        resizeFactor = maxSize / maxPreviewSize;
                    }
                    const output = await sharpFile.resize(Math.floor(w / resizeFactor), Math.floor(h / resizeFactor)).toFile(filePreviewPath);
                    fileW = output.width;
                    fileH = output.height;
                    await this.awsS3Service.uploadFile(bucketName, filePreviewPath, awsFileReviewPath);
                    try {
                        fs.unlinkSync(filePreviewPath);
                    }
                    catch (e) {
                        this.logger.error(e);
                    }
                }
                response.data = {
                    original: awsFilePath,
                    type: 'image',
                    preview: awsFileReviewPath,
                    size: `${fileW}x${fileH}`
                };
            }
            else {
                response.data = {
                    original: awsFilePath,
                    type: 'file'
                };
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
    common_1.Get(':rightId'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Get messages, max: 50' }),
    swagger_1.ApiBearerAuth(),
    api_implicit_query_decorator_1.ApiImplicitQuery({ name: 'from', required: false }),
    api_implicit_query_decorator_1.ApiImplicitQuery({ name: 'to', required: false }),
    swagger_1.ApiOkResponse({
        description: 'Messages',
        type: [message_schema_1.Message],
    }),
    __param(0, common_1.Param('rightId')),
    __param(1, common_1.Query('from')),
    __param(2, common_1.Query('to')),
    __param(3, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getMessages", null);
__decorate([
    common_1.Delete(':messageId'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Delete message' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    }),
    __param(0, common_1.Param('messageId')), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "deleteMessage", null);
__decorate([
    common_1.Delete('conversation/multi'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Delete multi conversation' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: delete_multi_conversation_dto_1.DeleteMultiConversationDto }),
    swagger_1.ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    }),
    __param(0, common_1.Body()), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delete_multi_conversation_dto_1.DeleteMultiConversationDto, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "deleteMultiConversation", null);
__decorate([
    common_1.Delete('conversation/:rightId'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Delete conversation' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    }),
    __param(0, common_1.Param('rightId')), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "deleteConversation", null);
__decorate([
    common_1.Delete('conversation/all'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Delete all conversation' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    }),
    __param(0, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "deleteAllConversation", null);
__decorate([
    common_1.Put(':messageId'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Update message body' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiBody({ type: update_message_dto_1.UpdateMessageDto }),
    swagger_1.ApiOkResponse({
        description: 'message info',
        type: message_schema_1.Message,
    }),
    __param(0, common_1.Body()), __param(1, common_1.Param('messageId')), __param(2, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_message_dto_1.UpdateMessageDto, String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "updateMessageBody", null);
__decorate([
    common_1.Put('received/all'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Update all message received' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'boolean',
        type: Boolean,
    }),
    __param(0, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "updateAllMessageReceived", null);
__decorate([
    common_1.Put('received/:peerId'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Update message received' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'boolean',
        type: Boolean,
    }),
    __param(0, common_1.Param('peerId')), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "updateMessageReceived", null);
__decorate([
    common_1.Put('read/:peerId'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Update message read' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'boolean',
        type: Boolean,
    }),
    __param(0, common_1.Param('peerId')), __param(1, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "updateMessageRead", null);
__decorate([
    common_1.Put('read/all'),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiOperation({ summary: 'Update all message read' }),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        description: 'boolean',
        type: Boolean,
    }),
    __param(0, auth_decorator_1.AuthJwt()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "updateAllMessageRead", null);
__decorate([
    common_1.Post('upload'),
    swagger_1.ApiOperation({ summary: 'Upload message file' }),
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.UseInterceptors(platform_express_1.FileInterceptor('file')),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiConsumes('multipart/form-data'),
    api_file_decorator_1.ApiBodyFile(),
    swagger_1.ApiOkResponse({
        description: 'Upload file info',
        type: upload_file_dto_1.UploadFileDto,
    }),
    __param(0, auth_decorator_1.AuthJwt()), __param(1, common_1.UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "uploadFile", null);
MessagesController = MessagesController_1 = __decorate([
    swagger_1.ApiTags('messages'),
    common_1.Controller('messages'),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        realtime_service_1.RealtimeService,
        aws_s3_service_1.AwsS3Service])
], MessagesController);
exports.MessagesController = MessagesController;
//# sourceMappingURL=messages.controller.js.map