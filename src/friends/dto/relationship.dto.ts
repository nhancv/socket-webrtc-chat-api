import {ApiProperty} from "@nestjs/swagger";
import {User} from "../../users/schemas/user.schema";

// Relationship between LEFT and RIGHT
export class RelationshipDto {
    // in case: LEFT friend with RIGHT, but not sure the other side
    @ApiProperty({description: 'in case: LEFT friend with RIGHT, but not sure the other side'})
    is_friend: boolean;

    // in case: LEFT friend with RIGHT, and RIGHT friend with LEFT
    @ApiProperty({description: 'in case: LEFT friend with RIGHT, and RIGHT friend with LEFT'})
    is_full_friend: boolean;

    // in case: RIGHT is LEFT's favorite
    @ApiProperty({description: 'in case: RIGHT is LEFT\'s favorite'})
    is_favorite: boolean;

    // in case: RIGHT sent request to LEFT
    @ApiProperty({description: 'in case: RIGHT sent request to LEFT'})
    is_request_received: boolean;

    // in case: LEFT sent request to RIGHT
    @ApiProperty({description: 'in case: LEFT sent request to RIGHT'})
    is_request_sent: boolean;

    constructor(is_friend: boolean, is_full_friend: boolean, is_favorite: boolean, is_request_received: boolean, is_request_sent: boolean) {
        this.is_friend = is_friend;
        this.is_full_friend = is_full_friend;
        this.is_favorite = is_favorite;
        this.is_request_received = is_request_received;
        this.is_request_sent = is_request_sent;
    }
}
