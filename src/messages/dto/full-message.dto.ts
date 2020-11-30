import {CreateMessageDto} from "./create-message.dto";
import {ApiProperty} from "@nestjs/swagger";

export class FullMessageDto extends CreateMessageDto {
    @ApiProperty()
    left: string;

    @ApiProperty()
    read: boolean;

    @ApiProperty()
    received: boolean;

    system?: boolean;
    color?: number;
    created_at?: number;
    updated_at?: number;
    is_sender?: boolean;

    constructor(right: string, device_id: string, body: string, left: string, received: boolean, read: boolean) {
        super(right, device_id, body);
        this.left = left;
        this.read = read;
        this.received = received;
    }
}
