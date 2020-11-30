import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

// One user can save up to 10 call history
@Schema()
export class History extends Document {
    @Prop({required: true})
    @ApiProperty()
    uid: string;

    @Prop({required: true})
    @ApiProperty()
    friend_id: string;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(uid: string, friend_id: string, created_at: number, updated_at: number) {
        super();
        this.uid = uid;
        this.friend_id = friend_id;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const HistorySchema = SchemaFactory.createForClass(History);
