import { IsEmail, IsNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class CreateUserDto {

    @IsNotEmpty()
    @ApiProperty()
    name: string;

    @IsEmail()
    @ApiProperty()
    email: string;

    @IsNotEmpty()
    @ApiProperty()
    username: string;

    @IsNotEmpty()
    @ApiProperty({description: 'gender index: 0 - male, 1 - female'})
    gender: number;

    @IsNotEmpty()
    @ApiProperty({description: 'option index: 0, 1, 2 [from 18 to 24, from 25 to 34, from 35 to 44, from 45+]'})
    ages: number;

    avatar?: string;

    constructor(name: string, email: string, username: string, gender: number, ages: number, avatar: string) {
        this.name = name;
        this.email = email;
        this.username = username;
        this.gender = gender;
        this.ages = ages;
        this.avatar = avatar;
    }
}
