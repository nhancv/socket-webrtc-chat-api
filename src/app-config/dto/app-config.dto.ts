import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {Prop} from "@nestjs/mongoose";

export class AppConfigDto {
    @Prop({required: true})
    @ApiProperty()
    version: string;

    @ApiProperty({description: 'iOS version code'})
    ios_version?: number;

    @ApiProperty({description: 'Android version code'})
    ad_version?: number;

    constructor(version: string, ios_version: number, ad_version: number) {
        this.version = version;
        this.ios_version = ios_version;
        this.ad_version = ad_version;
    }
}
