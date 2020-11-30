import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty} from "class-validator";

export class GuestRequestDto {

    @IsNotEmpty()
    @ApiProperty()
    device_id: string;

    constructor(device_id: string) {
        this.device_id = device_id;
    }
}
