import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {AppConfigService} from "../app-config/app-config.service";
import {MessagesService} from "../messages/messages.service";
import {AppConfig} from "../app-config/schemas/app-config.schema";
import {Message} from "../messages/schemas/message.schema";

@Injectable()
export class MigrationService_1_0_19 {
    private readonly logger = new Logger(MigrationService_1_0_19.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly appConfigService: AppConfigService,
        private readonly messagesService: MessagesService,
    ) {
    }

    async migrate(appConfig: AppConfig) {
        this.logger.debug('MigrationService_1_0_19');
        // Duplicate messages with is_sender
        const messages = await this.messagesService.getAllMessage();
        for (let i = 0; i < messages.length; i++) {
            // Convert mongoose object to plain object
            const msg: Message = messages[i].toObject();
            // Default color = -1
            msg.color = -1;
            // Request and accept friend will be green
            // Wants to add you as a friend
            // You're now friends
            const greens = [
                'Wants to add you as a friend',
                'You\'re now friends'
            ]
            const reds = [
                'The user removed friend connection with you'
            ];
            if (msg.system) {
                for (let i = 0; i < greens.length; i++) {
                    const isGreen = msg.body.includes(greens[i]);
                    if (isGreen) {
                        msg.color = 0;
                        break;
                    }
                }
                for (let i = 0; i < reds.length; i++) {
                    const isRed = msg.body.includes(reds[i]);
                    if (isRed) {
                        msg.color = 1;
                        break;
                    }
                }
            }
            await this.messagesService.putRawMessage(msg, msg._id);
        }
    }
}
