import { IsEmail, IsNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class FavoriteFriendDto {

    @IsNotEmpty()
    @ApiProperty()
    right: string;

    constructor(right: string) {
        this.right = right;
    }
}
