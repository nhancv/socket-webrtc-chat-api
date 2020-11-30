import {IsNotEmpty} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class TicketDto {

    @IsNotEmpty()
    @ApiProperty()
    left: string;

    @IsNotEmpty()
    @ApiProperty()
    right: string;

    @IsNotEmpty()
    @ApiProperty()
    ticket_id: string;

    @IsNotEmpty()
    @ApiProperty()
    body: string;

    @IsNotEmpty()
    @ApiProperty()
    supporter_id: string;

    constructor(left: string, right: string, ticket_id: string, body: string, supporter_id: string) {
        this.left = left;
        this.right = right;
        this.ticket_id = ticket_id;
        this.body = body;
        this.supporter_id = supporter_id;
    }
}
