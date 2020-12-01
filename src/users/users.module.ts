import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {UsersController} from './users.controller';
import {UsersService} from './users.service';
import {User, UserSchema} from './schemas/user.schema';
import {MulterModule} from "@nestjs/platform-express";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {extname} from "path";
import {diskStorage} from "multer";
import {AwsS3Module} from "../aws-s3/aws-s3.module";
import {FriendsModule} from "../friends/friends.module";
@Module({
    imports: [
        // AwsS3Module,
        forwardRef(() => FriendsModule),
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
        MulterModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                dest: configService.get<string>('MULTER_DEST'),
                storage: diskStorage({
                    destination: configService.get<string>('MULTER_DEST'),
                    filename: (req, file, callback) => {
                        callback(null, `${Date.now()}${extname(file.originalname)}`);
                    }
                })
            }),
            inject: [ConfigService],
        })
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {
}
