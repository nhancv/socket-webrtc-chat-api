import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class Minute extends Document {
    @Prop({required: true})
    @ApiProperty()
    uid: string;

    @Prop({required: true})
    @ApiProperty()
    minutes: string;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(uid: string, minutes: string, created_at: number, updated_at: number) {
        super();
        this.uid = uid;
        this.minutes = minutes;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const MinuteSchema = SchemaFactory.createForClass(Minute);
