import {CreateNotificationDto} from "./create-notification.dto";
import {ApiProperty} from "@nestjs/swagger";

export class FullNotificationDto extends CreateNotificationDto {

    @ApiProperty()
    uid: string;

    constructor(uid: string, device_id: string, fcm_token: string) {
        super(device_id, fcm_token);
        this.uid = uid;
    }
}
