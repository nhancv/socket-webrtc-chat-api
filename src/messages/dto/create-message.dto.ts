import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateMessageDto {

    @IsNotEmpty()
    @ApiProperty()
    right: string;

    @IsNotEmpty()
    @ApiProperty()
    device_id: string;

    @IsNotEmpty()
    @ApiProperty()
    body: string;

    constructor(right: string, device_id: string, body: string) {
        this.right = right;
        this.device_id = device_id;
        this.body = body;
    }
}
