import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class Ticket extends Document {

    @Prop({required: true})
    @ApiProperty()
    left: string;

    @Prop({required: true})
    @ApiProperty()
    right: string;

    @Prop({required: true})
    @ApiProperty()
    ticket_id: string;

    @Prop({required: true})
    @ApiProperty()
    body: string;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(left: string, right: string, ticket_id: string, body: string, created_at: number, updated_at: number) {
        super();
        this.left = left;
        this.right = right;
        this.ticket_id = ticket_id;
        this.body = body;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
