import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class PagingMessageDto {

    @IsNotEmpty()
    @ApiProperty()
    from: number;

    @IsNotEmpty()
    @ApiProperty()
    to: number;

    constructor(from: number, to: number) {
        this.from = from;
        this.to = to;
    }
}
