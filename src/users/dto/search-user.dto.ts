import { IsEmail, IsNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class SearchUserDto {

    @IsNotEmpty()
    @ApiProperty()
    username: string;

    constructor(username: string) {
        this.username = username;
    }
}
