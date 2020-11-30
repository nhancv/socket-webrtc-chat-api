import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class Guest extends Document {
    @Prop({required: true})
    @ApiProperty()
    uid: string;

    @Prop({required: true})
    @ApiProperty()
    device_id: string;

    @Prop({default: 0})
    @ApiProperty()
    connection_count: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(uid: string, device_id: string, connection_count: number, created_at: number, updated_at: number) {
        super();
        this.uid = uid;
        this.device_id = device_id;
        this.connection_count = connection_count;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const GuestSchema = SchemaFactory.createForClass(Guest);
