import {IsNotEmpty} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class MinuteDto {

    @IsNotEmpty()
    @ApiProperty()
    minutes: string;

    constructor(minutes: string) {
        this.minutes = minutes;
    }
}
