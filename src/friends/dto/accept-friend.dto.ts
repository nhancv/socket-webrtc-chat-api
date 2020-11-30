import { IsEmail, IsNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class AcceptFriendDto {

    @IsNotEmpty()
    @ApiProperty()
    left: string;

    constructor(left: string) {
        this.left = left;
    }
}
