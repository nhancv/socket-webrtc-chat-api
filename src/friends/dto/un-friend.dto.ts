import { IsEmail, IsNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class UnFriendDto {

    @IsNotEmpty()
    @ApiProperty()
    right: string;

    constructor(right: string) {
        this.right = right;
    }
}
