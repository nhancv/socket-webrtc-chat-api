import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty} from "class-validator";

export class MobileVersionDto {

    @IsNotEmpty()
    @ApiProperty({description: 'iOS version code'})
    ios_version: number;

    @IsNotEmpty()
    @ApiProperty({description: 'Android version code'})
    ad_version: number;

    constructor(ios_version: number, ad_version: number) {
        this.ios_version = ios_version;
        this.ad_version = ad_version;
    }
}
