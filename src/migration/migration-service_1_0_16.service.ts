import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {AppConfigService} from "../app-config/app-config.service";
import {MessagesService} from "../messages/messages.service";
import {AppConfig} from "../app-config/schemas/app-config.schema";
import {mongo} from "mongoose";

@Injectable()
export class MigrationService_1_0_16 {
    private readonly logger = new Logger(MigrationService_1_0_16.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly appConfigService: AppConfigService,
        private readonly messagesService: MessagesService,
    ) {
    }

    async migrate(appConfig: AppConfig) {
        this.logger.debug('MigrationService_1_0_16');
        // Duplicate messages with is_sender
        const messages = await this.messagesService.getAllMessage();
        for (let i = 0; i < messages.length; i++) {
            // Convert mongoose object to plain object
            const msg = messages[i].toObject();
            if (msg.is_sender === undefined) {
                // Update current is_sender = true
                msg.is_sender = true;
                await this.messagesService.putRawMessage(msg, msg._id);
                // Clone new message with is_sender = false;
                msg._id = null;
                msg.is_sender = false;
                await this.messagesService.putRawMessage(msg, new mongo.ObjectId());
            }
        }
    }
}
