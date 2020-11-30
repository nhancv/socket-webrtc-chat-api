import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Logger,
    Param,
    Post,
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import * as fs from "fs";
import sharp, {OutputInfo, Sharp} from 'sharp';
import {ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {MessagesService} from "./messages.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {AuthJwt} from "../auth/auth.decorator";
import {JwtPayload} from "../auth/jwt.payload";
import {BaseResponse} from "../models/responses/base.response";
import {Message} from "./schemas/message.schema";
import {UpdateMessageDto} from "./dto/update-message.dto";
import {RealtimeService} from "../realtime/realtime.service";
import {ApiImplicitQuery} from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";
import {FileInterceptor} from "@nestjs/platform-express";
import {ApiBodyFile} from "../utils/api-file.decorator";
import {AwsS3Service} from "../aws-s3/aws-s3.service";
import {DeleteMultiConversationDto} from "./dto/delete-multi-conversation.dto";
import {UploadFileDto} from "./dto/upload-file.dto";

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
    private logger: Logger = new Logger(MessagesController.name);

    constructor(
        private readonly messagesService: MessagesService,
        private readonly realtimeService: RealtimeService,
        private readonly awsS3Service: AwsS3Service
    ) {
    }

    @Get(':rightId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Get messages, max: 50'})
    @ApiBearerAuth()
    @ApiImplicitQuery({name: 'from', required: false})
    @ApiImplicitQuery({name: 'to', required: false})
    @ApiOkResponse({
        description: 'Messages',
        type: [Message],
    })
    async getMessages(@Param('rightId') rightId: string,
                      @Query('from') from: number,
                      @Query('to') to: number,
                      @AuthJwt() payload: JwtPayload): Promise<BaseResponse<Message[]>> {
        const response: BaseResponse<Message[]> = {}
        const uid = payload.uid;
        response.data = (await this.messagesService.getMessages(uid, rightId, from, to));
        return response;
    }

    @Delete(':messageId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Delete message'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    })
    async deleteMessage(@Param('messageId') messageId: string, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        const uid = payload.uid;
        response.data = (await this.messagesService.deleteMessage(messageId, uid));
        return response;
    }

    @Delete('conversation/multi')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Delete multi conversation'})
    @ApiBearerAuth()
    @ApiBody({type: DeleteMultiConversationDto})
    @ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    })
    async deleteMultiConversation(@Body() multiConversationDto: DeleteMultiConversationDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        const uid = payload.uid;
        response.data = (await this.messagesService.deleteMultiConversations(uid, multiConversationDto.rightIds));
        return response;
    }

    @Delete('conversation/:rightId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Delete conversation'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    })
    async deleteConversation(@Param('rightId') rightId: string, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        const uid = payload.uid;
        response.data = (await this.messagesService.deleteConversation(uid, rightId));
        return response;
    }

    @Delete('conversation/all')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Delete all conversation'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    })
    async deleteAllConversation(@AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        const uid = payload.uid;
        response.data = (await this.messagesService.deleteAllConversation(uid));
        return response;
    }

    @Put(':messageId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Update message body'})
    @ApiBearerAuth()
    @ApiBody({type: UpdateMessageDto})
    @ApiOkResponse({
        description: 'message info',
        type: Message,
    })
    async updateMessageBody(@Body() updateMessageDto: UpdateMessageDto, @Param('messageId') messageId: string, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<Message | null>> {
        const response: BaseResponse<Message | null> = {}
        const uid = payload.uid;
        response.data = (await this.messagesService.updateMessageBody(messageId, uid, updateMessageDto));
        return response;
    }

    // X send B
    // Y send B
    // B call received all api
    // B is uid (receiver)
    @Put('received/all')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Update all message received'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'boolean',
        type: Boolean,
    })
    async updateAllMessageReceived(@AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        const uid = payload.uid;
        response.data = (await this.messagesService.updateAllMessageReceived(uid));
        // Send event
        if (response.data) {
            await this.realtimeService.sendReadMessageEventToFriends(uid, true);
        }
        return response;
    }

    // A send B
    // B call received api
    // B is uid (receiver)
    // A is peerId (sender)
    // Send event to A
    @Put('received/:peerId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Update message received'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'boolean',
        type: Boolean,
    })
    async updateMessageReceived(@Param('peerId') peerId: string, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        const uid = payload.uid;
        // A send message to B
        // B need update message flag of A
        // => senderId = A, uid is you = B
        response.data = (await this.messagesService.updateMessageReceived(peerId, uid));
        // Send event
        if (response.data) {
            this.realtimeService.sendReadMessageEventToSender(peerId, uid, true);
        }
        return response;
    }

    // A send B
    // B call read api
    // B is uid (receiver)
    // A is peerId (sender)
    // Send event to A
    // Update right's message as read
    @Put('read/:peerId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Update message read'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'boolean',
        type: Boolean,
    })
    async updateMessageRead(@Param('peerId') peerId: string, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        const uid = payload.uid;
        response.data = (await this.messagesService.updateMessageRead(uid, peerId));
        // Send event
        if (response.data) {
            this.realtimeService.sendReadMessageEventToSender(peerId, uid, false);
        }
        return response;
    }

    // X send B
    // Y send B
    // B call read all api
    // B is uid (receiver)
    // Update right's message as read
    @Put('read/all')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Update all message read'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'boolean',
        type: Boolean,
    })
    async updateAllMessageRead(@AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        const uid = payload.uid;
        response.data = (await this.messagesService.updateAllMessageRead(uid));
        // Send event
        if (response.data) {
            await this.realtimeService.sendReadMessageEventToFriends(uid, false);
        }
        return response;
    }

    // #S3 endpoint:
    // #https://freehang.s3.us-east-1.amazonaws.com/<file name>
    // #Cloudfront endpoint:
    // #https://dumigvwsxonvr.cloudfront.net/<file name>
    @Post('upload')
    @ApiOperation({summary: 'Upload message file'})
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBodyFile()
    @ApiOkResponse({
        description: 'Upload file info',
        type: UploadFileDto,
    })
    async uploadFile(@AuthJwt() payload: JwtPayload, @UploadedFile() file): Promise<BaseResponse<UploadFileDto>> {
        const response: BaseResponse<UploadFileDto> = {};
        const env = process.env.ENV || 'default';
        const bucketName = process.env.AWS_BUCKET;
        const multerDest = process.env.MULTER_DEST || 'upload';
        if (!bucketName) {
            return {
                error: {
                    code: HttpStatus.NOT_FOUND,
                    message: 'Unknow bucketName'
                }
            }
        }
        const filename = file.filename;
        const uid = payload.uid;
        const filePath = `./${multerDest}/${filename}`;
        const awsFilePath = `${env}/messages/${uid}_${filename}`;
        try {
            // Upload original image
            await this.awsS3Service.uploadFile(bucketName, filePath, awsFilePath);

            const isImage = require('is-image');
            if (isImage(filePath)) {
                // Create preview
                let fileW = 0;
                let fileH = 0;
                const previewFilename = `preview_${filename}`;
                const filePreviewPath = `./${multerDest}/${previewFilename}`;
                const awsFileReviewPath = `${env}/messages/${uid}_${previewFilename}`;
                const sharpFile: Sharp = sharp(filePath);
                const originalFileMetadata = await sharpFile.metadata();
                const w = originalFileMetadata.width ? originalFileMetadata.width : 0;
                const h = originalFileMetadata.height ? originalFileMetadata.height : 0;
                if (w > 0 && h > 0) {
                    fileW = w;
                    fileH = h;
                    const maxPreviewSize = 300;
                    // 600 x 200 (w x h)
                    // 600/maxPreviewSize = 2 => h = 200 / 2 = 100
                    const maxSize = Math.max(w, h);
                    let resizeFactor = 1;
                    if (maxSize > maxPreviewSize) {
                        resizeFactor = maxSize / maxPreviewSize;
                    }

                    const output: OutputInfo = await sharpFile.resize(Math.floor(w / resizeFactor), Math.floor(h / resizeFactor)).toFile(filePreviewPath);
                    fileW = output.width;
                    fileH = output.height;
                    await this.awsS3Service.uploadFile(bucketName, filePreviewPath, awsFileReviewPath);
                    try {
                        fs.unlinkSync(filePreviewPath);
                    } catch (e) {
                        // Ignore
                        this.logger.error(e);
                    }
                }

                response.data = {
                    original: awsFilePath,
                    type: 'image',
                    preview: awsFileReviewPath,
                    size: `${fileW}x${fileH}`
                };
            } else {
                response.data = {
                    original: awsFilePath,
                    type: 'file'
                };
            }
        } finally {
            try {
                // Delete uploaded file
                fs.unlinkSync(filePath);
            } catch (e) {
                // Ignore
                this.logger.error(e);
            }
        }
        return response;
    }

}
