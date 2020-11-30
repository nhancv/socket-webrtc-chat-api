import {IsNotEmpty} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class SupportDto {

    @IsNotEmpty()
    @ApiProperty()
    ticket_id: string;

    @IsNotEmpty()
    @ApiProperty()
    client_id: string;

    @IsNotEmpty()
    @ApiProperty()
    supporter_id: string;

    constructor(ticket_id: string, client_id: string, supporter_id: string) {
        this.ticket_id = ticket_id;
        this.client_id = client_id;
        this.supporter_id = supporter_id;
    }
}
