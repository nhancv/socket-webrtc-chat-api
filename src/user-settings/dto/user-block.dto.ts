import { IsEmail, IsNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class UserBlockDto {

    @IsNotEmpty()
    @ApiProperty()
    block_uid: string;

    @ApiProperty()
    reason: string;

    constructor(block_uid: string, reason: string) {
        this.block_uid = block_uid;
        this.reason = reason;
    }
}
