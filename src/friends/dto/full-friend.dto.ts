import {ApiProperty} from "@nestjs/swagger";
import {Message} from "../../messages/schemas/message.schema";
import {RelationshipDto} from "./relationship.dto";

export class FullFriendDto {

    @ApiProperty()
    uid: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    avatar?: string;

    @ApiProperty({type: Message})
    last_message?: Message;

    @ApiProperty()
    un_read?: number;

    @ApiProperty({type: RelationshipDto})
    relationship: RelationshipDto;

    // DEPRECATED, will be removed later
    @ApiProperty()
    is_request_friend?: boolean;
    // DEPRECATED, will be removed later
    @ApiProperty()
    is_friend?: boolean;
    // DEPRECATED, will be removed later
    @ApiProperty()
    is_full_friend?: boolean;
    // DEPRECATED, will be removed later
    @ApiProperty()
    is_favorite?: boolean;

    constructor(uid: string, name: string, avatar: string, last_message: Message, un_read: number, relationship: RelationshipDto) {
        this.uid = uid;
        this.name = name;
        this.avatar = avatar;
        this.last_message = last_message;
        this.un_read = un_read;
        this.relationship = relationship;
    }
}
