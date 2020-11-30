import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class Friend extends Document {
    @Prop({required: true})
    @ApiProperty()
    left: string;

    @Prop({required: true})
    @ApiProperty()
    right: string;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    created_at: number;

    @Prop({type: Date, default: Date.now})
    @ApiProperty()
    updated_at: number;

    constructor(left: string, right: string, created_at: number, updated_at: number) {
        super();
        this.left = left;
        this.right = right;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

export const FriendSchema = SchemaFactory.createForClass(Friend);
