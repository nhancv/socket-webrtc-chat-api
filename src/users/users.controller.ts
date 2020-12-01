import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Logger,
    Param,
    Post, Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {UsersService} from './users.service';
import {User} from "./schemas/user.schema";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {BaseError, BaseResponse} from "../models/responses/base.response";
import {CreateUserDto} from "./dto/create-user.dto";
import {JwtPayload} from "../auth/jwt.payload";
import {AuthJwt} from "../auth/auth.decorator";
import {FileInterceptor} from "@nestjs/platform-express";
import * as fs from "fs";
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes, ApiNotAcceptableResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags
} from "@nestjs/swagger";
import {ApiBodyFile} from "../utils/api-file.decorator";
import {SearchUserDto} from "./dto/search-user.dto";
import {DetectGenderDto} from "./dto/detect-gender.dto";
// import {AwsS3Service} from "../aws-s3/aws-s3.service";
import {FriendsService} from "../friends/friends.service";
import {UserRelationshipDto} from "../friends/dto/user-relationship.dto";
import sharp, {OutputInfo, Sharp} from "sharp";
// Disable face detect
// import * as faceapi from "face-api.js";
// import {faceDetectionOptions} from "../main";

@ApiTags('users')
@Controller('users')
export class UsersController {

    private logger: Logger = new Logger(UsersController.name);

    constructor(
        private readonly friendsService: FriendsService,
        private readonly usersService: UsersService,
        // private readonly awsS3Service: AwsS3Service
    ) {
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Update user info'})
    @ApiBearerAuth()
    @ApiBody({type: CreateUserDto})
    @ApiOkResponse({
        description: 'user info',
        type: User,
    })
    async create(@Body() user: CreateUserDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<User | null>> {
        const response: BaseResponse<any> = {};
        const uid = payload.uid;

        // Username is available
        const userByUsername = await this.usersService.findUserByUsername(user.username);
        if (!userByUsername || userByUsername.uid === uid) {
            response.data = await this.usersService.updateUser(uid, user);
        } else {
            response.error = {
                code: HttpStatus.NOT_ACCEPTABLE,
                message: "Username is not available."
            }
        }

        return response;
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Get user'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'user info',
        type: User,
    })
    async getUserInfo(@AuthJwt() payload: JwtPayload): Promise<BaseResponse<User | null>> {
        const response: BaseResponse<User | null> = {}
        response.data = await this.usersService.findUserByUid(payload.uid);
        return response;
    }

    @Post('search')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Search by username'})
    @ApiBearerAuth()
    @ApiBody({type: SearchUserDto})
    @ApiOkResponse({
        description: 'list of user',
        type: [UserRelationshipDto],
    })
    async searchUsersByUsername(@Body() searchDto: SearchUserDto, @AuthJwt() payload: JwtPayload): Promise<BaseResponse<UserRelationshipDto[] | null>> {
        const response: BaseResponse<UserRelationshipDto[] | null> = {}
        const users = await this.usersService.searchUsersByUsername(searchDto.username);

        const results: UserRelationshipDto[] = [];
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

    @Delete()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({summary: 'Delete user'})
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'true or false',
        type: Boolean,
    })
    async deleteUser(@AuthJwt() payload: JwtPayload): Promise<BaseResponse<boolean>> {
        const response: BaseResponse<boolean> = {}
        response.data = await this.usersService.deleteUser(payload.uid);
        return response;
    }

    @Post('avatar')
    @ApiOperation({summary: 'Upload avatar'})
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBodyFile()
    @ApiOkResponse({
        description: 'file name',
        type: String,
    })
    async uploadAvatar(@AuthJwt() payload: JwtPayload, @UploadedFile() file): Promise<BaseResponse<string>> {
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
        const filePath = `./${multerDest}/` + filename;
        const awsFilePath = `${env}/avatars/${uid}_${filename}`;
        // await this.awsS3Service.uploadFile(bucketName, filePath, awsFilePath);
        try {
            fs.unlinkSync(filePath);
        } catch (e) {
            // Ignore
            this.logger.error(e);
        }
        // Update avatar
        await this.usersService.updateAvatar(uid, {
            avatar: awsFilePath
        });
        const response: BaseResponse<string> = {
            data: awsFilePath
        }
        return response;
    }

    @Post('gender')
    @ApiOperation({summary: 'Detect gender'})
    // @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    // @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBodyFile()
    @ApiOkResponse({
        description: 'success',
        type: DetectGenderDto
    })
    @ApiNotFoundResponse({description: 'Face was not found'})
    @ApiNotAcceptableResponse({description: 'Image file is not valid.'})
    async detectGender(@AuthJwt() payload: JwtPayload, @UploadedFile() file): Promise<BaseResponse<DetectGenderDto>> {
        const response: BaseResponse<DetectGenderDto> = {};
        const multerDest = process.env.MULTER_DEST || 'upload';
        const filename = file.filename;
        const filePath = `./${multerDest}/` + filename;

        const notFoundE = {
            code: HttpStatus.NOT_FOUND,
            message: "Face was not found"
        };
        const notAcceptableE = {
            code: HttpStatus.NOT_ACCEPTABLE,
            message: "Image file is not valid."
        };
        try {
            const isImage = require('is-image');
            if (isImage(filePath)) {
                // Create preview
                const previewFilename = `preview_${filename}`;
                const filePreviewPath = `./${multerDest}/${previewFilename}`;
                const sharpFile: Sharp = sharp(filePath);
                const originalFileMetadata = await sharpFile.metadata();
                const w = originalFileMetadata.width ? originalFileMetadata.width : 0;
                const h = originalFileMetadata.height ? originalFileMetadata.height : 0;
                if (w > 0 && h > 0) {
                    const maxPreviewSize = 300;
                    // 600 x 200 (w x h)
                    // 600/maxPreviewSize = 2 => h = 200 / 2 = 100
                    const maxSize = Math.max(w, h);
                    let resizeFactor = 1;
                    if (maxSize > maxPreviewSize) {
                        resizeFactor = maxSize / maxPreviewSize;
                    }

                    await sharpFile
                        .resize(Math.floor(w / resizeFactor), Math.floor(h / resizeFactor))
                        .toFile(filePreviewPath);

                    // Disable face detect
                    // const canvas = require('canvas');
                    // const img = await canvas.loadImage(filePreviewPath);
                    // const result = await faceapi
                    //     .detectSingleFace(img, faceDetectionOptions)
                    //     .withAgeAndGender();
                    // if (result) {
                    //     response.data = {
                    //         age: faceapi.utils.round(result.age, 0),
                    //         gender: result.gender,
                    //         probability: faceapi.utils.round(result.genderProbability)
                    //     };
                    // } else {
                    //     response.error = notFoundE;
                    // }
                    response.error = notFoundE;

                    try {
                        fs.unlinkSync(filePreviewPath);
                    } catch (e) {
                        // Ignore
                        this.logger.error(e);
                    }
                } else {
                    response.error = notAcceptableE;
                }

            } else {
                response.error = notAcceptableE;
            }
        } finally {
            try {
                // Delete uploaded file
                fs.unlinkSync(filePath);
            } catch (e) {
                this.logger.error(e);
            }
        }
        return response;
    }

    // @Get('avatar/:id')
    // @ApiOperation({summary: 'Get avatar'})
    // @ApiOkResponse({
    //     description: 'avatar image',
    //     type: Object,
    // })
    // async getAvatar(@Param('id') avatarId: string, @Res() response) {
    //     const data = fs.createReadStream(`./avatars/${avatarId}`);
    //     // This will wait until we know the readable stream is actually valid before piping
    //     data.on('open', function () {
    //         // This just pipes the read stream to the response object (which goes to the client)
    //         data.pipe(response);
    //     });
    //
    //     // This catches any errors that happen while creating the readable stream (usually invalid names)
    //     data.on('error', function (err) {
    //         response.send(err);
    //     });
    // }

}
