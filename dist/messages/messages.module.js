"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesModule = void 0;
const common_1 = require("@nestjs/common");
const messages_controller_1 = require("./messages.controller");
const messages_service_1 = require("./messages.service");
const mongoose_1 = require("@nestjs/mongoose");
const message_schema_1 = require("./schemas/message.schema");
const realtime_module_1 = require("../realtime/realtime.module");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
const multer_1 = require("multer");
let MessagesModule = class MessagesModule {
};
MessagesModule = __decorate([
    common_1.Module({
        imports: [
            common_1.forwardRef(() => realtime_module_1.RealtimeModule),
            mongoose_1.MongooseModule.forFeature([
                { name: message_schema_1.Message.name, schema: message_schema_1.MessageSchema },
            ]),
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
        controllers: [messages_controller_1.MessagesController],
        providers: [messages_service_1.MessagesService],
        exports: [messages_service_1.MessagesService]
    })
], MessagesModule);
exports.MessagesModule = MessagesModule;
//# sourceMappingURL=messages.module.js.map