"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const users_controller_1 = require("./users.controller");
const users_service_1 = require("./users.service");
const user_schema_1 = require("./schemas/user.schema");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
const multer_1 = require("multer");
const aws_s3_module_1 = require("../aws-s3/aws-s3.module");
const friends_module_1 = require("../friends/friends.module");
let UsersModule = class UsersModule {
};
UsersModule = __decorate([
    common_1.Module({
        imports: [
            aws_s3_module_1.AwsS3Module,
            common_1.forwardRef(() => friends_module_1.FriendsModule),
            mongoose_1.MongooseModule.forFeature([{ name: user_schema_1.User.name, schema: user_schema_1.UserSchema }]),
            platform_express_1.MulterModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    dest: configService.get('MULTER_DEST'),
                    storage: multer_1.diskStorage({
                        destination: configService.get('MULTER_DEST'),
                        filename: (req, file, callback) => {
                            callback(null, `${Date.now()}${path_1.extname(file.originalname)}`);
                        }
                    })
                }),
                inject: [config_1.ConfigService],
            })
        ],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService],
        exports: [users_service_1.UsersService]
    })
], UsersModule);
exports.UsersModule = UsersModule;
//# sourceMappingURL=users.module.js.map