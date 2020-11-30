import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class UpdateMessageDto {

    @IsNotEmpty()
    @ApiProperty()
    _id: string;

    @IsNotEmpty()
    @ApiProperty()
    device_id: string;

    @IsNotEmpty()
    @ApiProperty()
    text: string;

    constructor(_id: string, device_id: string, text: string) {
        this._id = _id;
        this.text = text;
        this.device_id = device_id;
    }
}
