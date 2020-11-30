import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class DeleteMultiConversationDto {

    @IsNotEmpty()
    @ApiProperty()
    rightIds: string[];

    constructor(rightIds: string[]) {
        this.rightIds = rightIds;
    }
}
