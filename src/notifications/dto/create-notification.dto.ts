import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateNotificationDto {

    @IsNotEmpty()
    @ApiProperty()
    device_id: string;

    @IsNotEmpty()
    @ApiProperty()
    fcm_token: string;

    constructor(device_id: string, fcm_token: string) {
        this.device_id = device_id;
        this.fcm_token = fcm_token;
    }
}
