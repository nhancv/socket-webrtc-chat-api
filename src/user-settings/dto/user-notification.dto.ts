import { IsEmail, IsNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class UserNotificationDto {

    @IsNotEmpty()
    @ApiProperty()
    activity_related_profile: boolean;

    @IsNotEmpty()
    @ApiProperty()
    latest_news_our_service: boolean;

    @IsNotEmpty()
    @ApiProperty()
    message_from_out_partner: boolean;

    constructor(activity_related_profile: boolean, latest_news_our_service: boolean, message_from_out_partner: boolean) {
        this.activity_related_profile = activity_related_profile;
        this.latest_news_our_service = latest_news_our_service;
        this.message_from_out_partner = message_from_out_partner;
    }
}
