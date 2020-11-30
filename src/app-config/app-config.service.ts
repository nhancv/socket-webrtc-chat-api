import {Injectable, Logger} from '@nestjs/common';
import {InjectConnection, InjectModel} from "@nestjs/mongoose";
import {Connection, Model} from "mongoose";
import {AppConfig} from "./schemas/app-config.schema";
import {AppConfigDto} from "./dto/app-config.dto";
import {MobileVersionDto} from "./dto/mobile-version.dto";

@Injectable()
export class AppConfigService {
    private readonly logger = new Logger(AppConfigService.name);

    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(AppConfig.name) private appConfigModel: Model<AppConfig>,
    ) {
    }

    async getAppConfig(): Promise<AppConfig | null> {
        return this.appConfigModel.findOne().exec();
    }

    async putAppConfig(appConfigDto: AppConfigDto): Promise<AppConfig | null> {
        const res = await this.appConfigModel.updateOne({}, {
            ...appConfigDto,
            updated_at: Date.now()
        }, {upsert: true});
        return this.getAppConfig();
    }

    async updateMobileVersion(mobileVersion: MobileVersionDto): Promise<boolean> {
        const res = await this.appConfigModel.updateOne({}, {
            ios_version: mobileVersion.ios_version ?? 0,
            ad_version: mobileVersion.ad_version ?? 0,
            updated_at: Date.now()
        });
        return res && res.n > 0;
    }



}
