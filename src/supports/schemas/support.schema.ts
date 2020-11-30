import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class Support extends Document {
    @Prop({required: true})
    @ApiProperty()
    ticket_id: string;

    @Prop({required: true})
    @ApiProperty()
    client_id: string;

    @Prop({required: true})
    @ApiProperty()
    supporter_id: string;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(ticket_id: string, client_id: string, supporter_id: string, created_at: number, updated_at: number) {
        super();
        this.ticket_id = ticket_id;
        this.client_id = client_id;
        this.supporter_id = supporter_id;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const SupportSchema = SchemaFactory.createForClass(Support);
