import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class BodyMessageDto {

    @IsNotEmpty()
    @ApiProperty()
    type: string;

    @IsNotEmpty()
    @ApiProperty()
    value: string;

    constructor(type: string, value: string) {
        this.type = type;
        this.value = value;
    }
}
