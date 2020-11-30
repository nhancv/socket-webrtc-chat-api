import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateHistoryDto {

    @IsNotEmpty()
    @ApiProperty()
    friend_id: string;

    constructor(friend_id: string) {
        this.friend_id = friend_id;
    }
}
