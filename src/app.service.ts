import {Injectable} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class AppService {
    constructor(
        private readonly configService: ConfigService,
    ) {
    }

    getConfigService(): ConfigService {
        return this.configService;
    }

    getHello(): string {
        return 'It works';
    }
}
