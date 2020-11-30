import { IsEmail, IsNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class UserContentDto {

    @IsNotEmpty()
    @ApiProperty()
    not_dubious_content: boolean;

    @IsNotEmpty()
    @ApiProperty()
    quick_connection: boolean;

    constructor(not_dubious_content: boolean, quick_connection: boolean) {
        this.not_dubious_content = not_dubious_content;
        this.quick_connection = quick_connection;
    }
}
