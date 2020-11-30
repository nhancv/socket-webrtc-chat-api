import { IsEmail, IsNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";
import {Prop} from "@nestjs/mongoose";

export class ReceiptDto {

    @IsNotEmpty()
    @ApiProperty()
    receipt: string;

    @IsNotEmpty()
    @ApiProperty()
    device_id: string;

    @IsNotEmpty()
    @ApiProperty()
    platform: string;

    constructor(receipt: string, device_id: string, platform: string) {
        this.receipt = receipt;
        this.device_id = device_id;
        this.platform = platform;
    }
}
