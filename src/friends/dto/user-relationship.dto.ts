import {ApiProperty} from "@nestjs/swagger";
import {User} from "../../users/schemas/user.schema";
import {RelationshipDto} from "./relationship.dto";

export class UserRelationshipDto {
    @ApiProperty({type: User})
    user: User

    @ApiProperty({type: RelationshipDto})
    relationship: RelationshipDto

    // DEPRECATED, will be removed later
    @ApiProperty()
    is_friend?: boolean;
    // DEPRECATED, will be removed later
    @ApiProperty()
    is_full_friend?: boolean;
    // DEPRECATED, will be removed later
    @ApiProperty()
    is_favorite?: boolean;
    // DEPRECATED, will be removed later
    @ApiProperty()
    is_request_friend?: boolean;

    constructor(user: User, relationship: RelationshipDto) {
        this.user = user;
        this.relationship = relationship;
    }
}
