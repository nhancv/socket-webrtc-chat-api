import {ApiProperty} from "@nestjs/swagger";

export class VerifyTokenDto {
    @ApiProperty()
    token: string;

    constructor(token: string) {
        this.token = token;
    }
}
