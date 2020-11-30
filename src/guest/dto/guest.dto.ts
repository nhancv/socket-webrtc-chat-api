import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty} from "class-validator";

export class GuestDto {
    @IsNotEmpty()
    @ApiProperty()
    device_id: string;

    @IsNotEmpty()
    @ApiProperty()
    connection_count: number;

    constructor(device_id: string, connection_count: number) {
        this.device_id = device_id;
        this.connection_count = connection_count;
    }
}
