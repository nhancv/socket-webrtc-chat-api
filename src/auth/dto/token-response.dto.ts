import {ApiProperty} from "@nestjs/swagger";
import {User} from "../../users/schemas/user.schema";

export class TokenResponseDto {

    @ApiProperty({type: User})
    user: User | null;

    @ApiProperty()
    accessToken: String;

    @ApiProperty()
    expiresIn: String

    constructor(user: User | null, accessToken: String, expiresIn: String) {
        this.user = user;
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
    }
}
